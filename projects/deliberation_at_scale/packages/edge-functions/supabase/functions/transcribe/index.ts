import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';
import { Deepgram } from "https://esm.sh/@deepgram/sdk@v2.4.0";
import dayjs from "dayjs";
import base64 from "https://deno.land/x/b64@1.1.28/src/base64.js";

const API_MODE: ApiMode = 'whisper';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const DEEPGRAM_API_KEY = Deno.env.get('DEEPGRAM_API_KEY');
const WHISPER_API_URL = Deno.env.get('WHISPER_API_URL');
const DEEPGRAM_API_URL = Deno.env.get('DEEPGRAM_API_URL');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SENTENCES_PER_MESSAGE = 2;
const MIN_TEXT_LENGTH_SENTENCE = 50;
const MIN_TEXT_LENGTH_BEFORE_UPSERT = 60;
const DEFAULT_WHISPER_LANGUAGE = 'en';
const DEFAULT_WHISPER_MODEL = 'whisper-1';
const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseAdminClient = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
);

const deepgramClient = new Deepgram(DEEPGRAM_API_KEY);

type ApiMode = 'whisper' | 'deepgram';

interface RequestBody {
    content: string;
    language?: string;
    model?: string;
    roomId: string;
    participantId: string;
    chunkStartTime: string;
}

serve(async (req) => {

  // guard: handle options request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: DEFAULT_HEADERS });
  }

  // get the data from the request
  const {
    content, // base64 encoded
    language,
    model,
    roomId,
    participantId,
    chunkStartTime,
  } = (await req.json() as RequestBody);
  const supabaseUserClient = await getSupabaseUserClient(req);
  const authUser = await supabaseUserClient.auth.getUser();
  let text = '';
  let result = {};

  // guard: check if the user is logged in
  if (!authUser) {
    return createResponse({
        error: 'You need to be logged in to use this function.',
    });
  }

  // guard: check if passed data is valid
  if (!chunkStartTime) {
    return createResponse({
        error: 'Invalid data is passed to handle the transcription.',
    });
  }

  // convert base64 content to a file which is required by Whisper
  // SOURCE: https://gist.github.com/AshikNesin/ca4ad1ff1d24c26cb228a3fb5c72e0d5
  const fetchedContent = await fetch(content);
  const blob = await fetchedContent.blob();
  const file = new File([blob], 'speech.mp3', { type: 'audio/mpeg' });

  if (API_MODE === 'whisper') {

    // convert to text
    result = await transcribeAtWhisper({
        file,
        language,
        model,
    });
    text = result.text;
  } else if (API_MODE === 'deepgram') {
    result = await transcribeAtDeepgram({
        file,
        content,
    });
    console.log('DEEPGRAM RESULT')
    console.log(result);
    // TODO: handle results
  }

  // only update messages when there is text
  if (text) {
    await upsertMesagesForTranscript({
        text,
        roomId,
        participantId,
        afterCreatedAt: chunkStartTime,
    });
  }

  return createResponse(result);
});

interface MessagesContext {
    text: string;
    roomId: string;
    participantId: string;
    afterCreatedAt: string;
}

/**
 * Update the messages for the given transcript.
 */
async function upsertMesagesForTranscript(context: MessagesContext) {
    const { text: rawText, roomId, participantId } = context;
    const text = rawText?.trim() ?? '';
    const existingMessages = await getMessagesByContext(context);
    const existingMessageAmount = existingMessages.length;
    const sentences = getSentencesWithPunctuation(text);
    const targetMessageAmount = Math.ceil(calculateAmountOfSentences(text) / SENTENCES_PER_MESSAGE);
    const upsertPromises = [];
    const handledExistingMessageIds = [];

    // guard: check if the text is long enough to be split into messages
    if (text.length <= MIN_TEXT_LENGTH_BEFORE_UPSERT) {
        return;
    }

    // loop all the messages
    for (let messageIndex = 0; messageIndex < targetMessageAmount; messageIndex++) {

        // get the content for the message
        // NOTE: multiply index by 2 because we need to get the punctuation as well
        let messageContent = '';
        let sentenceAmount = 0;
        let targetSentenceAmount = SENTENCES_PER_MESSAGE;
        let targetCharacterAmount = MIN_TEXT_LENGTH_SENTENCE * SENTENCES_PER_MESSAGE;
        const copiedSentences = [...sentences];

        // loop all the sentences
        for (let sentenceIndex = 0; sentenceIndex < copiedSentences.length; sentenceIndex += 2) {
            const punctuationIndex = sentenceIndex + 1;
            const sentence = copiedSentences?.[sentenceIndex] ?? '';
            const punctuation = copiedSentences?.[punctuationIndex] ?? '';
            const sentenceLength = sentence.length;

            // guard: check if the message is long enough
            if (messageContent.length >= targetCharacterAmount) {
                break;
            }

            // guard: check if the message has enough sentences
            if (sentenceAmount >= targetSentenceAmount) {
                break;
            }

            // add the sentence and punctuation to the message
            messageContent += sentence + punctuation;

            // update the sentence amount
            sentenceAmount += 1;

            // remove the sentence and punctuation so it won't be used again
            // NOTE: always remove the first one, because splice is cutting the array
            sentences.splice(0, 2);
        }

        // guard: make sure the message is valid
        if (!messageContent) {
            break;
        }

        // check whether this should be existing message or a new one
        if (messageIndex < existingMessageAmount) {
            const existingMessage = existingMessages[messageIndex];
            const { id: existingMessageId, content: existingMessageContent } = existingMessage;

            // guard: skip when content is identical
            if (existingMessageContent === messageContent) {
                continue;
            }

            const updatePromise = supabaseAdminClient
                .from('messages')
                .update({
                    active: true,
                    content: messageContent,
                })
                .eq('id', existingMessageId);
                // console.log('updatePromise', existingMessageId, messageContent);
            upsertPromises.push(updatePromise);
            handledExistingMessageIds.push(existingMessageId);
        } else {
            const insertPromise = supabaseAdminClient
                .from('messages')
                .insert({
                    active: true,
                    content: messageContent,
                    room_id: roomId,
                    participant_id: participantId,
                });
                // console.log('insertPromise', messageContent);
            upsertPromises.push(insertPromise);
        }
    }

    // deactivate the unhandled existing messages where no content was left for anymore
    // const unhandledExistingMessages = existingMessages.filter((message) => {
    //     const { id: existingMessageId } = message;

    //     return !handledExistingMessageIds.includes(existingMessageId);
    // });
    // unhandledExistingMessages.map((message) => {
    //     const { id: existingMessageId } = message;
    //     const updatePromise = supabaseAdminClient
    //         .from('messages')
    //         .update({
    //             active: false,
    //         })
    //         .eq('id', existingMessageId);

    //     upsertPromises.push(updatePromise);
    // });

    const results = await Promise.allSettled(upsertPromises);
}

/**
 * Get all messages by the given context.
 */
async function getMessagesByContext(context: MessagesContext) {
    const { roomId, participantId, afterCreatedAt } = context;
    const { data: messages, error } = await supabaseAdminClient
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .eq('participant_id', participantId)
        .gte('created_at', afterCreatedAt)
        .order('created_at', { ascending: true });

    return messages ?? [];
}

interface TranscribeAtWhisperOptions {
    file: File;
    language?: string;
    model?: string;
}

/**
 * Request to the whisper API to transcribe the audio file
 */
async function transcribeAtWhisper(options: TranscribeAtWhisperOptions) {
    const {
        file,
        language = DEFAULT_WHISPER_LANGUAGE,
        model = DEFAULT_WHISPER_MODEL,
    } = options;
    const url = `${WHISPER_API_URL}/transcriptions`;
    const body = new FormData();
    body.append('file', file);
    body.append('language', language);
    body.append('model', model);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
          // Don't set contentType manually → https://github.com/github/fetch/issues/505#issuecomment-293064470
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: body,
    });

    return response.json();
}

interface TranscribeAtDeepgramOptions {
    file?: File;
    content?: string;
    language?: string;
    model?: string;
}

/**
 * Request to the Deepgram API to transcribe the audio file
 */
async function transcribeAtDeepgram(options: TranscribeAtDeepgramOptions) {
    const {
        content,
        file,
    } = options;
    const transcription = await deepgramClient.transcription.preRecorded({
        buffer: new Uint8Array(base64.toArrayBuffer(content, true)),
        mimetype: 'audio/mpeg',
    });

    return transcription
}

/**
 * Get the number of sentences in a given text.
 */
function calculateAmountOfSentences(text: string) {
    const sentences = getSentencesWithPunctuation(text);
    const amountOfSentences = (sentences.length / 2);

    return amountOfSentences;
}

/**
 * Split the given text into sentences.
 */
function getSentencesWithPunctuation(text: string) {
    return text.split(/([\.!?]+)/g).filter((sentence) => !!sentence);
}

/**
 * Get the number of words in a given text.
 */
function calculateAmountOfWords(text: string) {
    const words = text.split(' ');
    const amountOfWords = words.length;

    return amountOfWords;
}

/**
 * Get the average amount of words per sentence in a given text.
 */
function calculateAverageWordsPerSentence(text: string) {
    const amountOfWords = calculateAmountOfWords(text);
    const amountOfSentences = calculateAmountOfSentences(text) || 1;

    return amountOfWords / amountOfSentences;
}

/**
 * Create a Supabase client with the Auth context of the logged in user.
 */
async function getSupabaseUserClient(req) {
    const supabaseUserClient = createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    return supabaseUserClient;
};

/**
 * Create a response with the given data.
 */
function createResponse(data: object) {
    return new Response(
        JSON.stringify(data),
        {
            headers: {
                "Content-Type": "application/json",
                ...DEFAULT_HEADERS,
            }
        },
    );
}
