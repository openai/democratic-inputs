import { BaseProgressionWorkerTaskPayload } from "../types";
import { Helpers } from "graphile-worker";
import { getParticipantsByRoomId } from "../utilities/participants";
import { SendMessageOptions, getMessagesAfter, joinMessagesContentWithParticipants, sendBotMessage } from "../utilities/messages";
import { getLatestOutcomeByRoomId, getOutcomesByRoomId } from "../utilities/outcomes";
import dayjs from "dayjs";
import { IS_DEVELOPMENT, ONE_MINUTE_MS, ONE_SECOND_MS } from "../config/constants";
import { Opinion, OpinionOptionType, Participant, supabaseClient } from "../lib/supabase";
import { draw, flat, unique, isEmpty } from "radash";
import { createPromptCompletion, createVerificationFunctionCompletion } from "../lib/openai";
import { waitFor } from "../utilities/time";
import { getRoomById, updateRoomStatus } from "../utilities/rooms";
import { t } from "@lingui/macro";

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

const TIMEOUT_CONVSERSATION_AFTER_MS = 40 * ONE_MINUTE_MS * TIME_MULTIPLIER;

// The minimum time before a new outcome is allowed to be created
const NEW_CROSS_POLLINATION_COOLDOWN_MS = 10 * ONE_SECOND_MS;

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
    force?: boolean;
    outcomeCooldownMs?: number;
    tagCooldownMs?: number;
}

export default async function enrichVoteCheck(payload: BaseProgressionWorkerTaskPayload, helpers: Helpers) {
    const { roomId } = payload;
    const [roomResult, latestOutcomeResult, outcomesResult, participantsResult, roomBotMessagesResult] = await Promise.allSettled([
        getRoomById(roomId),
        getLatestOutcomeByRoomId(roomId),
        getOutcomesByRoomId(roomId),
        getParticipantsByRoomId(roomId),
        getMessagesAfter({
            roomId,
            limit: DEFAULT_MESSAGE_LIMIT,
            types: ['bot'],
        }),
    ]);

    // guard: check if the required data is valid
    if (roomResult.status === 'rejected' ||
        latestOutcomeResult.status === 'rejected' ||
        outcomesResult.status === 'rejected' ||
        participantsResult.status === 'rejected' ||
        roomBotMessagesResult.status === 'rejected') {
        throw Error(`Could not get the latest outcome, participants, or messages for the vote check enrichment.`);
    }

    const room = roomResult?.value;
    const latestOutcome = latestOutcomeResult?.value;
    const outcomes = outcomesResult?.value;
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
    const roomOutcomeAmount = outcomes?.length ?? 0;
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
    const shouldTimeoutConversation = timeSinceRoomStartedMs > TIMEOUT_CONVSERSATION_AFTER_MS;

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
        const {
            tags, sendOnce = false,
            scope = 'latestOutcome', force = false,
            tagCooldownMs = BOT_TAG_COOLDOWN_MS, outcomeCooldownMs = BOT_OUTCOME_COOLDOWN_MS,
        } = options;
        const messages = scope === 'latestOutcome' ? latestBotOutcomeMessages : roomBotMessages;
        const hasRecentlySentBotMessage = latestBotOutcomeMessages.some((message) => {
            return dayjs(message.created_at).isAfter(dayjs().subtract(outcomeCooldownMs, 'ms'));
        });

        // guard: check if we should force the message
        if (force) {
            await sendBotMessage(options);
            return;
        }

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
            if (timeSinceLatestMessageWithTags < tagCooldownMs) {
                return;
            }
        }

        await sendBotMessage(options);
    };

    // guard: timeout the conversation when taking too long
    if (shouldTimeoutConversation) {
        await attemptSendBotMessage({
            roomId,
            content: getTimeoutConversationMessageContent(),
            force: true,
        });
        await updateRoomStatus({
            roomId,
            roomStatus: 'end',
            helpers,
        });
        return;
    }

    // always notify the participants of the timekeeping
    TIMEKEEPING_MOMENTS.forEach((timekeepingTimeMs) => {
        if (timeSinceRoomStartedMs > timekeepingTimeMs) {
            attemptSendBotMessage({
                roomId,
                content: getTimeKeepingMessageContent(timekeepingTimeMs, roomOutcomeAmount),
                tags: `timekeeping-${timekeepingTimeMs}`,
                sendOnce: true,
                scope: 'room',
            });
        }
    });

    // send a message to invite others to contribute
    if (hasAnyoneContributed && !hasEveryoneContributed) {
        await attemptSendBotMessage({
            roomId,
            content: getInviteContributionMessageContent(lackingContributingNicknames),
            tags: 'not-everyone-contributed',
            tagCooldownMs: BOT_TAG_COOLDOWN_MS * 2,
        });
    }

    // check if everyone contributed so we can attempt to make a summary
    if (hasEveryoneContributed) {
        const taskContent = joinMessagesContentWithParticipants(latestOutcomeMessages, participants);
        const contributionCheckResult = await createVerificationFunctionCompletion({
            taskInstruction: getSummarisationPrompt({
                mode: 'verification',
            }),
            taskContent,
        });
        const isContribution = contributionCheckResult?.verified ?? false;

        // guard: check if there is a valuable contribution
        if (isContribution) {
            const contributionResult = await createPromptCompletion({
                taskInstruction: getSummarisationPrompt({
                    mode: 'completion',
                }),
                taskContent,
            });
            const hasContribution = !!contributionResult && !isEmpty(contributionResult.trim());

            if (hasContribution) {
                // store the consensus and send it over to the current room for them to vote on
                const { data: newOutcomes } = await supabaseClient
                    .from('outcomes')
                    .insert({
                        content: contributionResult,
                        type: 'consensus',
                        room_id: roomId,
                        original_outcome_id: latestOutcomeId,
                    })
                    .select();
                const newOutcome = newOutcomes?.[0];
                helpers.logger.info(`Created a new outcome for room ${roomId} with id ${newOutcome?.id} and content ${newOutcome?.content}`);

                if (newOutcome) {
                    await attemptSendBotMessage({
                        roomId,
                        content: getNewContributionMessageContent(),
                        tags: 'new-contributions',
                        force: true,
                    });
                    return;
                }
            }
        }
    }

    // guard: check if we should timeout the vote
    if (shouldTimeoutVote) {
        await sendNewCrossPollination({
            roomId,
            helpers,
            attemptSendBotMessage,
            beforeSend: async () => {
                helpers.logger.info(`Timing out vote for room ${roomId}...`);
                await attemptSendBotMessage({
                    roomId,
                    content: getTimeoutVoteMessageContent(),
                    tags: 'timeout-vote',
                    force: true,
                });
                await waitFor(NEW_OUTCOME_AFTER_VOTE_TIMEOUT_MS);
            },
        });
        return;
    }

    // check if we should moderate the open discussion a bit when it all takes too long
    if (shouldInviteOpenDiscussion || shouldInviteToPass) {
        helpers.logger.info(`Moderating open discussion in room ${roomId}...`);

        // send opening invite only once
        attemptSendBotMessage({
            roomId,
            content: getOpenDiscussionMessageContent(),
            tags: 'open-discussion',
            sendOnce: true,
        });
    }

    // fetching all opinions to see what the votes look like
    const { data: allOpinions } = await supabaseClient
        .from('opinions')
        .select()
        .eq('outcome_id', latestOutcomeId)
        .in('participant_id', participantIds)
        .order('created_at', { ascending: false });
    const opinions = unique(allOpinions ?? [], (opinion) => {
        const { outcome_id, participant_id } = opinion;
        return `${outcome_id}-${participant_id}`;
    });
    const hasEveryoneVoted = getHasEveryoneVoted({ opinions, participantIds });
    const hasEveryoneVotedTheSame = getHasEveryoneVotedTheSame({ opinions });

    // attempt send message to remind people to vote
    if (shouldInviteVote && !hasEveryoneVoted) {
        helpers.logger.info(`Sending vote reminder for room ${roomId}...`);
        await attemptSendBotMessage({
            roomId,
            content: getVoteInviteMessageContent(),
            tags: 'invite-to-vote',
            tagCooldownMs: BOT_TAG_COOLDOWN_MS * 2,
        });
    }

    // send new cross pollination when everyone has voted the same
    if (hasEveryoneVoted && hasEveryoneVotedTheSame) {
        await sendNewCrossPollination({
            roomId,
            helpers,
            attemptSendBotMessage,
            beforeSend: async () => {
                helpers.logger.info(`Sending new cross pollination for room ${roomId} because everyone voted the same...`);
                await attemptSendBotMessage({
                    roomId,
                    content: getVotedSameMessageContent(),
                    tags: 'everyone-voted-the-same',
                    force: true,
                });
                await waitFor(NEW_OUTCOME_AFTER_EVERYONE_VOTED_THE_SAME_MS);
            },
        });
        return;
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
    beforeSend?: () => Promise<void>;
    attemptSendBotMessage: (options: AttemptSendBotMessageOptions) => void;
}

async function sendNewCrossPollination(options: SendCrossPollinationOptions) {
    const { roomId, helpers, attemptSendBotMessage, beforeSend } = options;
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
    const newestOutcome = outcomes?.[0];
    const timeSinceLastOutcomeMs = Math.abs(dayjs().diff(dayjs(newestOutcome?.created_at), 'ms'));

    if (newestOutcome && timeSinceLastOutcomeMs < NEW_CROSS_POLLINATION_COOLDOWN_MS) {
        return;
    }

    // guard: make sure there is an outcome
    if (!candidateOutcomeId || !candidateOutcomeContent) {
        helpers.logger.info(`Could not find an candidate outcome for room ${roomId}.`);

        if (timeSinceRoomStartedMs > TIMEKEEPING_MOMENTS[0]) {
            await attemptSendBotMessage({
                roomId,
                content: t`No new statements could be found unfortunately. You can continue the discussion if you want or join others in a new conversation!`,
                sendOnce: true,
                scope: 'room',
            });
        } else {
            await attemptSendBotMessage({
                roomId,
                content: t`No new statements could be found unfortunately. You can continue the conversation yourself here!`,
                sendOnce: true,
                scope: 'room',
            });
        }
        return;
    }

    helpers.logger.info(`Sending new cross pollination for room ${roomId} with outcome ${candidateOutcomeId} and content ${candidateOutcomeContent}...`);

    // NOTE: force this one because it is an important message
    await beforeSend?.();
    await attemptSendBotMessage({
        roomId,
        content: getNewCrossPollinationMessageContent(candidateOutcomeContent),
        force: true,
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

// DONE
function getVotedSameMessageContent(): string {
    return draw([
        t`You share the same opinion. A new statement will follow shortly!`,
    ]) ?? '';
}

// DONE
function getVoteInviteMessageContent(): string {
    return draw([
        t`Once everyone has voted, a new statement will be shared.`,
    ]) ?? '';
}

// DONE
function getNotEveryoneVotedTheSameMessageContent(): string {
    return draw([
        t`You are not sharing the same opinion. Perhaps you can discuss this a bit more?`,
    ]) ?? '';
}

// DONE
function getInviteContributionMessageContent(nickNames: string[]): string {
    const nickNamesString = nickNames.join(', ');

    return draw([
        t`Hey ${nickNamesString}. Can you also share your thoughts in the chat?`,
    ]) ?? '';
}

// DONE, TODO: rename this
function getOpenDiscussionMessageContent(): string {
    return draw([
        t`Not everyone has voted. When you all vote the next statement will come. You can also pass the statement. Or maybe you want to type your thoughts in the chat?`,
    ]) ?? '';
}

// DONE
function getNewCrossPollinationMessageContent(statement: string, isFirst: boolean = false): string {
    return draw([
        t`Here is a ${!isFirst ? 'new' : ''} statement for you to discuss and vote on.`,
    ]) ?? '';
}

// DONE
function getTimeKeepingMessageContent(timeMs: number, outcomeAmount: number): string {
    let invitation = t`Enjoying the conversation? Please continue. Interested in other people's opinions? Then you can move on to a new group!`;
    let outcomeAmountMessage = ``;

    if (timeMs >= ONE_MINUTE_MS * 20) {
        invitation = t`You are really enjoying this conversation, but remember other people might also enjoy your contribution.`;
    }

    if (outcomeAmount > 1) {
        outcomeAmountMessage = t`You discussed and voted on ${outcomeAmount} statements so far!`;
    }

    return draw([
        t`You've been having a conversation for ${timeMs / ONE_MINUTE_MS} minutes. ${outcomeAmountMessage} ${invitation}`,
    ]) ?? '';
}

// DONE
function getTimeoutVoteMessageContent(): string {
    return draw([
        t`I've been instructed to introduce a new statement after ${TIMEOUT_VOTE_AFTER_MS / ONE_MINUTE_MS} minutes. So here is a new statement!`,
    ]) ?? '';
}

function getTimeoutConversationMessageContent(): string {
    return draw([
        t`I've been instructed to introduce a new statement after ${TIMEOUT_CONVSERSATION_AFTER_MS / ONE_MINUTE_MS} minutes. So we unfortunately need to stop this conversation!`,
    ]) ?? '';
}

function getNewContributionMessageContent(): string {
    return draw([
        t`A new statement has been created based on your contributions! You can now vote on it whether you agree or disagree with the proposal.`,
    ]) ?? '';
}

interface SummarisationPromptOptions {
    mode: 'completion' | 'verification';
}

function getSummarisationPrompt(options: SummarisationPromptOptions) {
    const { mode } = options;
    const basePrompt = `
        Role: You are a democratic summarisation bot built by the consortium "Deliberation at scale".

        Context: You will receive some unstructured comments from the participants of a conversation about a difficult topic.
        These people do not know each other and may have very different views.

        Task: Using only the comments, create one synthesising, standalone, normative "We should..." statement that captures the values of each participant and the nuance of what they have shared.

        When formulating the statement, follow these rules:
        1. Don't use metaphors or similes. Say it how it is.
        2. Never use a long word where a short one works.
        3. If it is possible to cut a word out, cut it out.
        4. Ensure the statement is short and to the point (less than two sentences).
        5. Never use the passive where you can use the active.
        6. Never use a foreign phrase, a scientific word, or a jargon word if there exists an everyday equivalent.
        7. Remember the statement should be standalone. The statement you generate will be presented and voted on by people with no knowledge of how it was generated. Do not describe the discussion itself!
        8. Use only the comments that demonstrate an intent to contribute to the broader societal discussion: Meta commentary, comments directed at the participants themselves, and or filler content should be ignored for the analysis.
        9. Do not be biased towards any particular person or viewpoint in the conversation.
    `;
    const completionPrompt = `
        10. If no relevant content is found, do not reply to the irrelevant content! Just say a variant of: "I don't think you have all typed out your own thoughts on the subject yet. If you could all share what you think, then I can make a summary of your views. Thanks!"
    `;
    const verificationPrompt = `
        10. Search for any relevant content even if some of it is useless. Do not reply to the irrelevant content!

        Instructions:
        If you can make a statement respond in a structured JSON without any prefixes or postfixes whether this is the case.
        As an output use the following JSON format:
            - verified: boolean to identify whether a relevant statement could be made.
            - statement: the actual statement that was made.
    `;

    const prompt = `
        ${basePrompt}
        ${mode === 'completion' ? completionPrompt : verificationPrompt}
    `;

    return prompt;
}
