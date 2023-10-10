import { BaseProgressionWorkerTaskPayload } from "../types";
import { Helpers } from "graphile-worker";
import { getParticipantsByRoomId } from "../utilities/participants";
import { SendMessageOptions, getMessagesAfter, joinMessagesContentWithParticipants, sendBotMessage } from "../utilities/messages";
import { getLatestOutcomeByRoomId, getOutcomesByRoomId } from "../utilities/outcomes";
import dayjs from "dayjs";
import { ONE_SECOND_MS } from "../config/constants";
import { Opinion, OpinionOptionType, Participant, supabaseClient } from "../lib/supabase";
import { draw, flat, unique } from "radash";
import { createVerificationFunctionCompletion } from "../lib/openai";
import { waitFor } from "../utilities/time";
import { updateRoomStatus } from "../utilities/rooms";

const START_OPEN_DISCUSSION_AFTER_MS = 5 * 60 * ONE_SECOND_MS;
const OPEN_DICUSSION_TIMEOUT_AFTER_MS = 2 * 60 * ONE_SECOND_MS;
const OPEN_DISCUSSION_BOT_MESSAGE_TAG = 'open-discussion';
const DEFAULT_MESSAGE_LIMIT = 200;
const BOT_MESSAGE_COOLDOWN_MS = ONE_SECOND_MS * 30;
const BOT_TAG_COOLDOWN_MS = ONE_SECOND_MS * 60;

export default async function enrichVoteCheck(payload: BaseProgressionWorkerTaskPayload, helpers: Helpers) {
    const { roomId } = payload;
    const [latestOutcomeResult, participantsResult] = await Promise.allSettled([
        getLatestOutcomeByRoomId(roomId),
        getParticipantsByRoomId(roomId),
    ]);

    // guard: check if the required data is valid
    if (latestOutcomeResult.status === 'rejected' ||
        participantsResult.status === 'rejected') {
        throw Error(`Could not get the latest outcome, participants, or messages for the vote check enrichment.`);
    }

    const latestOutcome = latestOutcomeResult?.value;
    const participants = participantsResult?.value;

    // guard: send an initial outcome when there is none yet
    if (!latestOutcome) {
        helpers.logger.info(`Sending initial outcome for room ${roomId}...`);
        await sendNewCrossPollination({
            roomId,
            helpers,
        });
        return;
    }

    const latestOutcomeId = latestOutcome?.id;
    const participantIds = participants?.map(participant => participant.id);
    const latestBotOutcomeMessages = await getMessagesAfter({
        roomId,
        limit: DEFAULT_MESSAGE_LIMIT,
        types: ['bot'],
        fromDate: dayjs(latestOutcome.created_at),
    });
    const timeSinceLatestOutcome = Math.abs(dayjs().diff(dayjs(latestOutcome.created_at), 'ms'));
    const shouldStartOpenDiscussion = timeSinceLatestOutcome > START_OPEN_DISCUSSION_AFTER_MS;
    const starOpenDiscussionMessage = latestBotOutcomeMessages.find((message) => {
        return message.tags?.includes(OPEN_DISCUSSION_BOT_MESSAGE_TAG);
    });
    const hasStartedOpenDiscussion = !!starOpenDiscussionMessage;
    const timeSinceStartingOpenDiscussion = Math.abs(dayjs().diff(dayjs(starOpenDiscussionMessage?.created_at), 'ms'));
    const timedOutOpenDiscussion = timeSinceStartingOpenDiscussion > OPEN_DICUSSION_TIMEOUT_AFTER_MS;
    const hasRecentlySentBotMessage = latestBotOutcomeMessages.some((message) => {
        return dayjs(message.created_at).isAfter(dayjs().subtract(BOT_MESSAGE_COOLDOWN_MS, 'ms'));
    });
    const attemptSendBotMessage = (options: Omit<SendMessageOptions, 'type'>) => {
        const { tags } = options;

        if (hasRecentlySentBotMessage) {
            // return;
        }

        const latestMessageWithTags = latestBotOutcomeMessages.find((message) => {
            return !!tags && message.tags?.includes(tags);
        });

        // guard: check if the bot has sent a message with the same tag recently
        if (latestMessageWithTags) {
            const timeSinceLatestMessageWithTags = Math.abs(dayjs().diff(dayjs(latestMessageWithTags.created_at), 'ms'));

            if (timeSinceLatestMessageWithTags < BOT_TAG_COOLDOWN_MS) {
                return;
            }
        }

        sendBotMessage(options);
    };

    // guard: send open discussion message
    if (shouldStartOpenDiscussion && !hasStartedOpenDiscussion) {
        helpers.logger.info(`Sending open discussion message for room ${roomId}...`);
        attemptSendBotMessage({
            roomId,
            content: getOpenDiscussionMessageContent(),
            tags: OPEN_DISCUSSION_BOT_MESSAGE_TAG,
        });
        return;
    }

    // guard: keep track of the open discussion, make a summary or time out the discussion
    if (shouldStartOpenDiscussion && hasStartedOpenDiscussion) {
        const openDiscussionMessages = await getMessagesAfter({
            roomId,
            limit: DEFAULT_MESSAGE_LIMIT,
            fromDate: dayjs(starOpenDiscussionMessage?.created_at),
        });
        const contributingParticipantIds = unique(openDiscussionMessages.map((message) => message.participant_id)).filter((id) => id !== null) as string[];
        const hasEveryoneContributed = contributingParticipantIds.length === participantIds.length;
        const lackingNicknames = getLackingNicknames({
            participants,
            requiredParticipantIds: contributingParticipantIds,
        });

        if (!hasEveryoneContributed) {
            attemptSendBotMessage({
                roomId,
                content: getInviteContributionMessageContent(lackingNicknames),
                tags: 'not-everyone-contributed',
            });
            return;
        }

        // on timeout send cross pollination of force a summary?
        if (timedOutOpenDiscussion) {
            helpers.logger.info(`Sending new cross pollination for room ${roomId} because the open discussion timed out...`);
            await sendBotMessage({
                roomId,
                content: getTimedOutOpenDiscussionMessageContent(),
            });
            await waitFor(ONE_SECOND_MS * 2);
            await sendNewCrossPollination({
                roomId,
                helpers,
            });
            return;
        }

        // check if everyone contributed so we can attempt to make a summary
        if (hasEveryoneContributed) {
            const consensusResult = await createVerificationFunctionCompletion({
                taskInstruction: `
                    Verify whether the content below contains a consensus and if so, what the consensus is. Be consise and clear.
                `,
                taskContent: joinMessagesContentWithParticipants(openDiscussionMessages, participants),
            });

            // guard: check if there is a consensus
            if (!consensusResult.verified) {
                return;
            }

            // store the consensus
            const consensusStatement = consensusResult?.moderatedReason;
            const { data: newOutcomes } = await supabaseClient
                .from('outcomes')
                .insert({
                    content: consensusStatement,
                    type: 'consensus',
                    room_id: roomId,
                    original_outcome_id: latestOutcomeId,
                })
                .select();
            const newOutcome = newOutcomes?.[0];

            // debug
            helpers.logger.info(`Created a new outcome for room ${roomId} with id ${newOutcome?.id} and content ${newOutcome?.content}`);
        }

        return;
    }

    const { data: opinions } = await supabaseClient
        .from('opinions')
        .select()
        .eq('outcome_id', latestOutcomeId)
        .in('participant_id', participantIds)
        .order('created_at', { ascending: false });
    const hasEveryoneVoted = getHasEveryoneVoted({ opinions, participantIds });
    const hasEveryoneVotedTheSame = getHasEveryoneVotedTheSame({ opinions });

    // guard: send message to remind people to vote
    if (!hasEveryoneVoted) {
        helpers.logger.info(`Sending vote reminder for room ${roomId}...`);
        attemptSendBotMessage({
            roomId,
            content: getVoteReminderMessageContent(),
            tags: 'not-everyone-voted',
        });
        return;
    }

    // guard: send new cross pollination when everyone has voted the same
    if (hasEveryoneVotedTheSame) {
        helpers.logger.info(`Sending new cross pollination for room ${roomId} because everyone voted the same...`);
        await sendBotMessage({
            roomId,
            content: getVotedSameMessageContent(),
        });
        await waitFor(ONE_SECOND_MS * 2);
        await sendNewCrossPollination({
            roomId,
            helpers,
        });
        return;
    }

    // guard: check if everyone has not voted the same
    if (!hasEveryoneVotedTheSame) {
        attemptSendBotMessage({
            roomId,
            content: getNotEveryoneVotedTheSameMessageContent(),
            tags: 'not-everyone-voted-the-same',
        });
        return;
    }
}

interface GetLackingNicknamesOptions {
    participants: Participant[];
    requiredParticipantIds: string[];
}

function getLackingNicknames(options: GetLackingNicknamesOptions) {
    const { participants, requiredParticipantIds } = options;
    const lackingParticipants = participants.filter((participant) => {
        return !requiredParticipantIds.includes(participant.id);
    });
    const lackingNicknames = lackingParticipants.map((participant) => participant.nick_name);

    return lackingNicknames;
}

interface HasEveryoneVotedOptions {
    participantIds: string[];
    opinions: Opinion[] | null;
    optionTypes?: OpinionOptionType[];
}

function getHasEveryoneVoted(options: HasEveryoneVotedOptions) {
    const { opinions, participantIds, optionTypes } = options;
    const hasFoundValidOpinionPerParticipant = participantIds.map((participantId) => {
        const opinion = opinions?.find((opinion) => {
            const { participant_id, option_type } = opinion;
            const isParticipant = participant_id === participantId;
            const hasSelectedOption = !optionTypes || !option_type || optionTypes?.includes(option_type);

            return isParticipant && hasSelectedOption;
        });
        const hasFoundOpinion = !!opinion;

        return hasFoundOpinion;
    });

    const hasEveryoneVoted = !hasFoundValidOpinionPerParticipant.includes(false);
    return hasEveryoneVoted;
}

interface HasEveryoneVotedTheSameOptions {
    opinions: Opinion[] | null;
}

function getHasEveryoneVotedTheSame(options: HasEveryoneVotedTheSameOptions) {
    const { opinions } = options;
    const optionTypes = opinions?.map((opinion) => opinion.option_type) ?? [];
    const uniqueOptionTypes = unique(optionTypes);
    const hasEveryoneVotedTheSame = uniqueOptionTypes.length === 1;

    return hasEveryoneVotedTheSame;
}

function getVotedSameMessageContent(): string {
    return draw([
        'Everyone voted the same! Let\'s find a new statement to discuss!',
    ]) ?? '';
}

function getVoteReminderMessageContent(): string {
    return draw([
        'Friendly reminder to vote on the mentioned statement!'
    ]) ?? '';
}

function getTimedOutOpenDiscussionMessageContent(): string {
    return draw([
        'The open discussion took a bit too long. Let\'s find a new statement to discuss!',
    ]) ?? '';
}

function getNotEveryoneVotedTheSameMessageContent(): string {
    return draw([
        'You are not agreeing just yet. Perhaps you can discuss this a bit more?',
    ]) ?? '';
}

function getInviteContributionMessageContent(nickNames: string[]): string {
    const nickNamesString = nickNames.join(', ');

    return draw([
        `Hey there ${nickNamesString}. You have been a bit quiet. We would love to hear your thoughts!`,
    ]) ?? '';
}

function getOpenDiscussionMessageContent(): string {
    return draw([
        'I noticed this statement is quite challenging to vote on. Perhaps we should have an open discussion? I would like to invite you to type your thoughts in the chat.',
    ]) ?? '';
}

function getNewCrossPollinationMessage(statement: string): string {
    return draw([
        `I have found a new statement for you to vote on: ${statement}`,
    ]) ?? '';
}

interface SendCrossPollinationOptions {
    roomId: string;
    helpers: Helpers;
}

async function sendNewCrossPollination(options: SendCrossPollinationOptions) {
    const { roomId, helpers } = options;
    const outcomes = await getOutcomesByRoomId(roomId);
    const skippedOutcomeIds = flat(outcomes?.map((outcome) => [outcome.id, outcome.original_outcome_id]) ?? []);
    const { data: candidateOutcomes } = await supabaseClient
        .from('outcomes')
        .select()
        .not('id', 'in', `(${skippedOutcomeIds.join(',')})`)
        .limit(100);
    const candidateOutcome = draw(candidateOutcomes ?? []);
    const candidateOutcomeId = candidateOutcome?.id;
    const candidateOutcomeContent = candidateOutcome?.content;

    // guard: make sure there is an outcome
    if (!candidateOutcomeId || !candidateOutcomeContent) {
        helpers.logger.info(`Could not find an candidate outcome for room ${roomId}.`);
        await sendBotMessage({
            roomId,
            content: 'I could not find a new statement for you to vote on. You can discuss new ones by joining a new room.',
        });
        await updateRoomStatus({
            roomId,
            roomStatus: 'end',
            helpers,
        });
        return;
    }

    helpers.logger.info(`Sending new cross pollination for room ${roomId} with outcome ${candidateOutcomeId} and content ${candidateOutcomeContent}...`);
    const { data: newOutcomes } = await supabaseClient
        .from('outcomes')
        .insert({
            content: candidateOutcomeContent,
            type: 'cross_pollination',
            room_id: roomId,
            original_outcome_id: candidateOutcomeId,
        })
        .select();
    const newOutcome = newOutcomes?.[0];

    if (newOutcome) {
        sendBotMessage({
            roomId,
            content: getNewCrossPollinationMessage(newOutcome.content),
        });
    }

    return newOutcome;
}
