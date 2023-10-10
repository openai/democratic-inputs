import { BaseProgressionWorkerTaskPayload } from "../types";
import { Helpers } from "graphile-worker";
import { getParticipantsByRoomId } from "../utilities/participants";
import { SendMessageOptions, getMessagesAfter, joinMessagesContentWithParticipants, sendBotMessage } from "../utilities/messages";
import { getLatestOutcomeByRoomId, getOutcomesByRoomId } from "../utilities/outcomes";
import dayjs from "dayjs";
import { IS_DEVELOPMENT, ONE_MINUTE_MS, ONE_SECOND_MS } from "../config/constants";
import { Opinion, OpinionOptionType, Participant, supabaseClient } from "../lib/supabase";
import { draw, flat, unique } from "radash";
import { createVerificationFunctionCompletion } from "../lib/openai";
import { waitFor } from "../utilities/time";
import { getRoomById } from "../utilities/rooms";

// Time constants
const TIME_MULTIPLIER = IS_DEVELOPMENT ? 1 : 1;

// The time before the bot will invite people to vote
const INVITE_VOTE_AFTER_MS = 1 * 60 * ONE_SECOND_MS * TIME_MULTIPLIER;

// The time before the bot will invite the participants to have an open discussion within the current vote
const INVITE_OPEN_DISCUSSION_AFTER_MS = 5 * 60 * ONE_SECOND_MS * TIME_MULTIPLIER;

// The time before the bot will invite to pass on the current vote
const INVITE_PASS_AFTER_MS = 10 * 60 * ONE_SECOND_MS * TIME_MULTIPLIER;

// The time before the bot will forcefully move to a new vote
const TIMEOUT_VOTE_AFTER_MS = 15 * 60 * ONE_SECOND_MS * TIME_MULTIPLIER;

// The time before a new outcome is searched after a vote has timed out
const NEW_OUTCOME_AFTER_VOTE_TIMEOUT_MS = 5 * ONE_SECOND_MS * TIME_MULTIPLIER;

// The time before a new outcome is searched out after everyone voted the same
const NEW_OUTCOME_AFTER_EVERYONE_VOTED_THE_SAME_MS = 5 * ONE_SECOND_MS * TIME_MULTIPLIER;

// The time before the new outcome is shown after it is announced in chat
const NEW_OUTCOME_AFTER_OUTCOME_INTRODUCTION_MS = 3 * ONE_SECOND_MS * TIME_MULTIPLIER;

// Timekeeping
const TIMEKEEPING_MOMENTS = [
    ONE_MINUTE_MS * 10 * TIME_MULTIPLIER,
    ONE_MINUTE_MS * 20 * TIME_MULTIPLIER,
    ONE_MINUTE_MS * 30 * TIME_MULTIPLIER,
];

// Cooldown of the bot message within each outcome
const BOT_OUTCOME_COOLDOWN_MS = ONE_SECOND_MS * 30 * TIME_MULTIPLIER;

// Cooldown of the bot message for each message tag
const BOT_TAG_COOLDOWN_MS = ONE_SECOND_MS * 90 * TIME_MULTIPLIER;

// Data fetching
const DEFAULT_MESSAGE_LIMIT = 300;

type MessagesScope = 'latestOutcome' | 'room';

interface AttemptSendBotMessageOptions extends Omit<SendMessageOptions, 'type'> {
    sendOnce?: boolean;
    scope?: MessagesScope;
}

export default async function enrichVoteCheck(payload: BaseProgressionWorkerTaskPayload, helpers: Helpers) {
    const { roomId } = payload;
    const [roomResult, latestOutcomeResult, participantsResult, roomBotMessagesResult] = await Promise.allSettled([
        getRoomById(roomId),
        getLatestOutcomeByRoomId(roomId),
        getParticipantsByRoomId(roomId),
        getMessagesAfter({
            roomId,
            limit: DEFAULT_MESSAGE_LIMIT,
            types: ['bot'],
        })
    ]);

    // guard: check if the required data is valid
    if (roomResult.status === 'rejected' ||
        latestOutcomeResult.status === 'rejected' ||
        participantsResult.status === 'rejected' ||
        roomBotMessagesResult.status === 'rejected') {
        throw Error(`Could not get the latest outcome, participants, or messages for the vote check enrichment.`);
    }

    const room = roomResult?.value;
    const latestOutcome = latestOutcomeResult?.value;
    const participants = participantsResult?.value;
    const roomBotMessages = roomBotMessagesResult?.value;

    // guard: send an initial outcome when there is none yet
    if (!latestOutcome) {
        helpers.logger.info(`Sending initial outcome for room ${roomId}...`);
        await sendNewCrossPollination({
            roomId,
            helpers,
            attemptSendBotMessage: (options) => {
                sendBotMessage(options);
            },
        });
        return;
    }

    // fetching more data when outcome is found
    const latestOutcomeId = latestOutcome?.id;
    const participantIds = participants?.map(participant => participant.id);
    const latestBotOutcomeMessages = await getMessagesAfter({
        roomId,
        limit: DEFAULT_MESSAGE_LIMIT,
        types: ['bot'],
        fromDate: dayjs(latestOutcome.created_at),
    });
    const latestOutcomeMessages = await getMessagesAfter({
        roomId,
        limit: DEFAULT_MESSAGE_LIMIT,
        fromDate: dayjs(latestOutcome?.created_at),
    });

    // time helpers
    const timeSinceRoomStartedMs = Math.abs(dayjs().diff(dayjs(room?.created_at), 'ms'));
    const timeSinceLatestOutcome = Math.abs(dayjs().diff(dayjs(latestOutcome.created_at), 'ms'));
    const shouldInviteVote = timeSinceLatestOutcome > INVITE_VOTE_AFTER_MS;
    const shouldInviteOpenDiscussion = timeSinceLatestOutcome > INVITE_OPEN_DISCUSSION_AFTER_MS;
    const shouldInviteToPass = timeSinceLatestOutcome > INVITE_PASS_AFTER_MS;
    const shouldTimeoutVote = timeSinceLatestOutcome > TIMEOUT_VOTE_AFTER_MS;
    const hasRecentlySentBotMessage = latestBotOutcomeMessages.some((message) => {
        return dayjs(message.created_at).isAfter(dayjs().subtract(BOT_OUTCOME_COOLDOWN_MS, 'ms'));
    });

    // contribution helpers
    const contributingParticipantIds = unique(latestOutcomeMessages.map((message) => message.participant_id)).filter((id) => id !== null) as string[];
    const hasEveryoneContributed = contributingParticipantIds.length === participantIds.length;
    const hasAnyoneContributed = contributingParticipantIds.length > 0;
    const lackingContributingNicknames = getLackingNicknames({
        participants,
        requiredParticipantIds: contributingParticipantIds,
    });

    // bot message helpers
    const attemptSendBotMessage = async (options: AttemptSendBotMessageOptions) => {
        const { tags, sendOnce = false, scope = 'latestOutcome' } = options;
        const messages = scope === 'latestOutcome' ? latestBotOutcomeMessages : roomBotMessages;

        if (hasRecentlySentBotMessage) {
            return;
        }

        const latestMessageWithTags = messages.find((message) => {
            return !!tags && message.tags?.includes(tags);
        });

        // guard: check if the bot has sent a message with the same tag recently
        if (latestMessageWithTags) {

            // skip when already sent out
            if (sendOnce) {
                return;
            }

            const timeSinceLatestMessageWithTags = Math.abs(dayjs().diff(dayjs(latestMessageWithTags.created_at), 'ms'));

            // guard: check if the bot has sent a message with the same tag recently
            if (timeSinceLatestMessageWithTags < BOT_TAG_COOLDOWN_MS) {
                return;
            }
        }

        await sendBotMessage(options);
    };

    // always notify the participants of the timekeeping
    TIMEKEEPING_MOMENTS.forEach((timekeepingTimeMs) => {
        if (timeSinceRoomStartedMs > timekeepingTimeMs) {
            attemptSendBotMessage({
                roomId,
                content: getTimeKeepingMessageContent(timekeepingTimeMs),
                tags: `timekeeping-${timekeepingTimeMs}`,
                sendOnce: true,
                scope: 'room',
            });
        }
    });

    // guard: check if everyone contributed so we can attempt to make a summary
    if (hasEveryoneContributed) {
        const taskContent = joinMessagesContentWithParticipants(latestOutcomeMessages, participants);
        const consensusResult = await createVerificationFunctionCompletion({
            taskInstruction: `
            You are a democratic summarisation bot. You will receive some comments made by the participants of a conversation about a difficult topic. These people do not know each other and may have very different views. Do not bias towards any particular person or viewpoint. Using only the comments, create a synthesising, standalone, normative statement that captures the values of each participant and the nuance of what they have shared. Make sure the statement is short and to the point (less than two sentences). When formulating the statement, follow these rules:
                1. Don't use metaphors or similes. Say it how it is.
                2. Never use a long word where a short one works.
                3. If it is possible to cut a word out, cut it.
                4. Never use the passive where you can use the active.
                5. Never use a foreign phrase, a scientific word, or a jargon word if there exists an everyday equivalent.
                6. Break any of these rules if following them would feel strange or uncanny.
            `,
            taskContent,
        });

        // guard: check if there is a consensus
        if (!consensusResult.verified) {
            return;
        }

        // store the consensus and send it over to the current room for them to vote on
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
        return;
    }

    // guard: check if we should timeout the vote
    if (shouldTimeoutVote) {
        helpers.logger.info(`Timing out vote for room ${roomId}...`);
        await sendBotMessage({
            roomId,
            content: getTimeoutVoteMessageContent(),
            tags: 'timeout-vote',
        });
        await waitFor(NEW_OUTCOME_AFTER_VOTE_TIMEOUT_MS);
        await sendNewCrossPollination({
            roomId,
            helpers,
            attemptSendBotMessage,
        });
        return;
    }

    // invite the participants to pass this outcome
    if (shouldInviteToPass) {
        await sendBotMessage({
            roomId,
            content: getInviteToPassMessageContent(),
            tags: 'invite-to-pass',
        });
    }

    // check if we should moderate the open discussion a bit when it all takes too long
    if (shouldInviteOpenDiscussion) {
        helpers.logger.info(`Moderating open discussion in room ${roomId}...`);

        // send opening invite only once
        attemptSendBotMessage({
            roomId,
            content: getOpenDiscussionMessageContent(),
            tags: 'open-discussion',
            sendOnce: true,
        });

        // send a message to invite others to contribute
        if (hasAnyoneContributed && !hasEveryoneContributed) {
            attemptSendBotMessage({
                roomId,
                content: getInviteContributionMessageContent(lackingContributingNicknames),
                tags: 'not-everyone-contributed',
            });
        }
    }

    // fetching all opinions to see what the votes look like
    const { data: opinions } = await supabaseClient
        .from('opinions')
        .select()
        .eq('outcome_id', latestOutcomeId)
        .in('participant_id', participantIds)
        .order('created_at', { ascending: false });
    const hasEveryoneVoted = getHasEveryoneVoted({ opinions, participantIds });
    const hasEveryoneVotedTheSame = getHasEveryoneVotedTheSame({ opinions });

    // attempt send message to remind people to vote
    if (shouldInviteVote && !hasEveryoneVoted) {
        helpers.logger.info(`Sending vote reminder for room ${roomId}...`);
        await attemptSendBotMessage({
            roomId,
            content: getVoteInviteMessageContent(),
            tags: 'not-everyone-voted',
        });
    }

    // send new cross pollination when everyone has voted the same
    if (hasEveryoneVoted && hasEveryoneVotedTheSame) {
        helpers.logger.info(`Sending new cross pollination for room ${roomId} because everyone voted the same...`);
        await sendBotMessage({
            roomId,
            content: getVotedSameMessageContent(),
            tags: 'everyone-voted-the-same',
        });
        await waitFor(NEW_OUTCOME_AFTER_EVERYONE_VOTED_THE_SAME_MS);
        await sendNewCrossPollination({
            roomId,
            helpers,
            attemptSendBotMessage,
        });
    }

    // guard: check if everyone has not voted the same
    if (hasEveryoneVoted && !hasEveryoneVotedTheSame) {
        await attemptSendBotMessage({
            roomId,
            content: getNotEveryoneVotedTheSameMessageContent(),
            tags: 'not-everyone-voted-the-same',
        });
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

interface SendCrossPollinationOptions {
    roomId: string;
    helpers: Helpers;
    attemptSendBotMessage: (options: AttemptSendBotMessageOptions) => void;
}

async function sendNewCrossPollination(options: SendCrossPollinationOptions) {
    const { roomId, helpers, attemptSendBotMessage } = options;
    const room = await getRoomById(roomId);
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
    const timeSinceRoomStartedMs = Math.abs(dayjs().diff(dayjs(room?.created_at), 'ms'));

    // guard: make sure there is an outcome
    if (!candidateOutcomeId || !candidateOutcomeContent) {
        helpers.logger.info(`Could not find an candidate outcome for room ${roomId}.`);

        if (timeSinceRoomStartedMs > ONE_MINUTE_MS * 10) {
            await attemptSendBotMessage({
                roomId,
                content: 'I could not find a new statement for you to discuss. You can continue the discussion if you want or join others in a new conversation!',
                sendOnce: true,
                scope: 'room',
            });
        } else {
            await attemptSendBotMessage({
                roomId,
                content: 'I could not find a new statement for you to discuss. You can continue the discussion yourself here if you want!',
                sendOnce: true,
                scope: 'room',
            });
        }
        return;
    }

    helpers.logger.info(`Sending new cross pollination for room ${roomId} with outcome ${candidateOutcomeId} and content ${candidateOutcomeContent}...`);
    await sendBotMessage({
        roomId,
        content: getNewCrossPollinationMessageContent(candidateOutcomeContent),
    });
    await waitFor(NEW_OUTCOME_AFTER_OUTCOME_INTRODUCTION_MS);
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

    return newOutcome;
}

function getVotedSameMessageContent(): string {
    return draw([
        'Everyone voted the same! Let\'s find a new statement to discuss!',
    ]) ?? '';
}

function getVoteInviteMessageContent(): string {
    return draw([
        'Friendly reminder to vote on the mentioned statement!'
    ]) ?? '';
}

function getInviteToPassMessageContent(): string {
    return draw([
        'It looks like the discussion it taking a bit longer. You can also decide to pass on this statement and find a new one to discuss.',
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

function getNewCrossPollinationMessageContent(statement: string): string {
    return draw([
        `I have found a new statement for you to discuss and vote on: ${statement}`,
    ]) ?? '';
}

function getTimeKeepingMessageContent(timeMs: number): string {
    return draw([
        `You have been discussing for more than ${timeMs / ONE_MINUTE_MS} minutes now. You can keep on going or decide to join another conversation.`,
    ]) ?? '';
}

function getTimeoutVoteMessageContent(): string {
    return draw([
        'Discussing the statement is taking a bit long. Let\'s find a new statement to discuss!',
    ]) ?? '';
}
