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
const INVITE_OPEN_DISCUSSION_AFTER_MS = 3 * 60 * ONE_SECOND_MS * TIME_MULTIPLIER;

// The time before the bot will invite to pass on the current vote
const INVITE_PASS_AFTER_MS = 5 * 60 * ONE_SECOND_MS * TIME_MULTIPLIER;

// The time before the bot will forcefully move to a new vote
const TIMEOUT_VOTE_AFTER_MS = 10 * 60 * ONE_SECOND_MS * TIME_MULTIPLIER;

// The time before a new outcome is searched after a vote has timed out
const NEW_OUTCOME_AFTER_VOTE_TIMEOUT_MS = 5 * ONE_SECOND_MS * TIME_MULTIPLIER;

// The time before the new outcome is shown after it is announced in chat
const NEW_OUTCOME_AFTER_OUTCOME_INTRODUCTION_MS = 3 * ONE_SECOND_MS * TIME_MULTIPLIER;

// The time after the whole conversation is forcefully ended
const TIMEOUT_CONVSERSATION_AFTER_MS = 40 * ONE_MINUTE_MS * TIME_MULTIPLIER;

// The minimum time before a new outcome is allowed to be created
const NEW_CROSS_POLLINATION_COOLDOWN_MS = 10 * ONE_SECOND_MS * TIME_MULTIPLIER;

// The time before the remaining participants are notificed of another participant leaving
const NOTIFY_LEAVING_PARTICIPANT_AFTER_MS = 15 * ONE_SECOND_MS * TIME_MULTIPLIER;

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
    const topicId = room?.topic_id;
    const latestOutcome = latestOutcomeResult?.value;
    const outcomes = outcomesResult?.value;
    const participants = participantsResult?.value;
    const roomBotMessages = roomBotMessagesResult?.value;

    // guard: send an initial outcome when there is none yet
    if (!latestOutcome) {
        helpers.logger.info(`Sending initial outcome for room ${roomId}...`);
        await sendNewCrossPollination({
            roomId,
            topicId,
            helpers,
            attemptSendBotMessage: (options) => {
                sendBotMessage(options);
            },
        });
        return;
    }

    // fetching more data when outcome is found
    const latestOutcomeId = latestOutcome.id;
    const latestOutcomeContent = latestOutcome.content;
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

    // presence helpers
    const presentParticipantIds = participants?.filter((participant) => {
        const timeSinceLastSeenMs = Math.abs(dayjs().diff(dayjs(participant.last_seen_at), 'ms'));
        return timeSinceLastSeenMs <= NOTIFY_LEAVING_PARTICIPANT_AFTER_MS;
    }).map((participant) => participant.id) ?? [];
    const hasLeavingParticipants = presentParticipantIds?.length < participantIds.length;
    const lackingPresenceNicknames = getLackingNicknames({
        participants,
        requiredParticipantIds: presentParticipantIds,
    });

    // request helpers
    const hasRequestedNextStatement = latestOutcomeMessages.some((message) => {
        return message.tags?.toLowerCase().includes('next-statement');
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

    // send message when there are participants who have left
    if (hasLeavingParticipants) {
        await attemptSendBotMessage({
            roomId,
            content: getLeavingParticipantsMessageContent(lackingPresenceNicknames),
            tags: 'leaving-participants',
        });
    }

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
                statement: latestOutcomeContent,
            }),
            taskContent,
        });
        const isContribution = contributionCheckResult?.verified ?? false;

        // check if there is no contribution yet
        if (!isContribution) {
            await attemptSendBotMessage({
                roomId,
                content: getNoVerifiedContributionMessageContent(),
                tags: 'no-verified-contribution-yet',
            });
        }

        // console.log('isContribution', contributionCheckResult, taskContent); process.exit(1);
        // guard: check if there is a valuable contribution
        if (isContribution) {
            await attemptSendBotMessage({
                roomId,
                content: getVerifiedContributionMessageContent(),
                tags: 'verified-contribution',
                force: true,
            });
            const contributionResult = await createPromptCompletion({
                taskInstruction: getSummarisationPrompt({
                    mode: 'completion',
                    statement: latestOutcomeContent,
                }),
                taskContent,
            });
            const hasValuableContent = !contributionResult?.includes('NO_CONTENT_FOUND') ?? false;
            const hasContribution = !!contributionResult && !isEmpty(contributionResult.trim()) && hasValuableContent;

            // moderator sends message "i don't think this is valuable etc"
            if (!hasValuableContent) {
                await attemptSendBotMessage({
                    roomId,
                    content: getNoVerifiedContributionMessageContent(),
                    tags: 'no-verified-contribution-yet',
                });
            }

            if (hasContribution) {
                // store the consensus and send it over to the current room for them to vote on
                const { data: newOutcomes } = await supabaseClient
                    .from('outcomes')
                    .insert({
                        content: contributionResult,
                        type: 'consensus',
                        room_id: roomId,
                        topic_id: topicId,
                        original_outcome_id: latestOutcomeId,
                    })
                    .select();
                const newOutcome = newOutcomes?.[0];
                helpers.logger.info(`Created a new outcome for room ${roomId} with id ${newOutcome?.id} and content ${newOutcome?.content}`);

                if (newOutcome) {
                    await Promise.allSettled([
                        attemptSendBotMessage({
                            roomId,
                            content: getNewContributionMessageContent(),
                            tags: 'new-contributions',
                            force: true,
                        }),
                        supabaseClient
                            .from('outcome_sources')
                            .insert(latestOutcomeMessages.map((message) => {
                                return {
                                    outcome_id: newOutcome.id,
                                    message_id: message.id,
                                };
                            }))
                    ]);

                    return;
                }
            }
        }
    }

    // guard: check if we should timeout the vote
    if (shouldTimeoutVote) {
        await sendNewCrossPollination({
            roomId,
            topicId,
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

    // guard: check if a next statement is requested
    if (hasEveryoneVoted && hasRequestedNextStatement) {
        await sendNewCrossPollination({
            roomId,
            topicId,
            helpers,
            attemptSendBotMessage,
        });
        return;
    }

    // attempt send message to remind people to vote
    if (shouldInviteVote && !hasEveryoneVoted) {
        helpers.logger.info(`Sending vote reminder for room ${roomId}...`);
        await attemptSendBotMessage({
            roomId,
            content: getVoteInviteMessageContent(),
            tags: 'invite-to-vote',
            tagCooldownMs: BOT_TAG_COOLDOWN_MS * 4,
        });
    }

    // send new cross pollination when everyone has voted the same
    if (hasEveryoneVoted && hasEveryoneVotedTheSame) {
        await attemptSendBotMessage({
            roomId,
            content: getVotedSameMessageContent(),
            tags: 'everyone-voted-the-same',
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
    topicId?: string;
    helpers: Helpers;
    beforeSend?: () => Promise<void>;
    attemptSendBotMessage: (options: AttemptSendBotMessageOptions) => void;
}

async function sendNewCrossPollination(options: SendCrossPollinationOptions) {
    const { roomId, topicId, helpers, attemptSendBotMessage, beforeSend } = options;
    const room = await getRoomById(roomId);
    const outcomes = await getOutcomesByRoomId(roomId);
    const skippedOutcomeIds = flat(outcomes?.map((outcome) => [outcome.id, outcome.original_outcome_id]) ?? []);
    const { data: candidateOutcomes } = await supabaseClient
        .from('outcomes')
        .select()
        .not('id', 'in', `(${skippedOutcomeIds.join(',')})`)
        .in('type', ['milestone', 'consensus', 'seed_statement'])
        .or(`topic_id.eq.${topicId},topic_id.is.null`)
        .eq('active', true)
        .limit(200);
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
                content: t`Unfortunately, no new statements could be found. You can continue the discussion if you want or join others in a new conversation!`,
                sendOnce: true,
                scope: 'room',
            });
        } else {
            await attemptSendBotMessage({
                roomId,
                content: t`No new statements could be found, Sorry! You can continue the conversation here or move on to the next conversation!`,
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
        t`You share the same opinion. When you are ready, you can move on to a new statement using the next button.`,
    ]) ?? '';
}

// DONE
function getVoteInviteMessageContent(): string {
    return draw([
        t`Don't forget to vote on the statement!`,
    ]) ?? '';
}

// DONE
function getNotEveryoneVotedTheSameMessageContent(): string {
    return draw([
        t`You don't share the same opinion. That's usually the start of a great conversation! Perhaps you can discuss this a bit more and type out your thoughts?`,
        t`You voted differently: not to worry, you can always agree to disagree or type out your thoughts and i'll try making a statement that better reflects all your views.`,
    ]) ?? '';
}

// DONE
function getInviteContributionMessageContent(nickNames: string[]): string {
    const nickNamesString = nickNames.join(', ');

    return draw([
        t`Hey ${nickNamesString}. Can you also share your thoughts in the chat?`,
    ]) ?? '';
}

function getLeavingParticipantsMessageContent(nickNames: string[]): string {
    const nickNamesString = nickNames.join(', ');

    return draw([
        t`It seems like ${nickNamesString} has **encountered an issue** or has **left the conversation**. Are they still in the call? Ask them to **refresh the page**. Af you think this was an accident you can wait while they try to fix it. Otherwise you can leave the conversation using **the red door icon** next to your camera view.`,
    ]) ?? '';
}

// DONE, TODO: rename this
function getOpenDiscussionMessageContent(): string {
    return draw([
        t`You can discuss this statement with the group, write your thoughts down in the chat or move on to the next statement when everyone voted.`,
    ]) ?? '';
}

// DONE
function getNewCrossPollinationMessageContent(statement: string, isFirst: boolean = false): string {
    return draw([
        t`Here is a ${!isFirst ? 'new' : ''} statement for you to discuss and vote on. Remember, if you have an interesting discussion, type out the key points and I will make a new statement that reflects your views!`,
        t`I found a ${!isFirst ? 'new' : ''} statement for you to discuss and vote on. Something to add? Type out your thoughts so I can create a new statement for you.`,
    ]) ?? '';
}

// DONE
function getTimeKeepingMessageContent(timeMs: number, outcomeAmount: number): string {
    let invitation = t`If you enjoying the conversation, keep going! If you're interested in other people's opinions, you can move on to a new group.`;
    let outcomeAmountMessage = ``;

    if (timeMs >= ONE_MINUTE_MS * 20) {
        invitation = t`It seems you are really enjoying this conversation, but remember other people might also enjoy your contribution!`;
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
        t`I've been instructed to stop this conversation after ${TIMEOUT_CONVSERSATION_AFTER_MS / ONE_MINUTE_MS} minutes. So we unfortunately need to stop this conversation!`,
    ]) ?? '';
}

function getNewContributionMessageContent(): string {
    return draw([
        t`A new statement has been created based on your messages! You can now vote on it whether you agree or disagree with the proposal. Do you think I have made a mistake? just click pass.`,
    ]) ?? '';
}

function getNoVerifiedContributionMessageContent(): string {
    return draw([
        t`I couldn't find a new statement based on your messages. If you type out some more of your thoughts I can try again. Thanks!`,
    ]) ?? '';
}

function getVerifiedContributionMessageContent(): string {
    return draw([
        t`I think I might've found a new statement based on your typed messages! Working on it...`,
        t`It looks like you have shared your opinions with me. Let me synthesise them...`,
    ]) ?? '';
}

interface SummarisationPromptOptions {
    mode: 'completion' | 'verification';
    statement: string;
}

function getSummarisationPrompt(options: SummarisationPromptOptions) {
    const { mode, statement } = options;
    const basePrompt = t`
        Role: You are a democratic summarisation bot built by the consortium "Deliberation at scale".

        Context: You will receive some unstructured comments from the participants of a conversation about the following statement: ${statement}.
        These people do not know each other and may have very different views.

        Task: Using only the comments, create one synthesising, standalone, normative statement that captures the values of each participant and the nuance of what they have shared.

        A normative statement follows the structure (Who) (should/could/must) (not?) (do what) in order to (value).

        When formulating the statement, follow these rules:
        1. Don't use metaphors or similes. Say it how it is.
        3. If it is possible to cut a word out, cut it out.
        4. Ensure the statement is short and to the point (less than two sentences).
        5. Never use the passive where you can use the active.
        6. Avoid using foreign phrases, scientific words, or jargon words an everyday equivalent exists.
        7. Remember the statement should be standalone. The statement you generate will be presented and voted on by people with no knowledge of how it was generated. Do not describe the discussion itself!
        8. Use only the comments that demonstrate an intent to contribute to the broader societal discussion: Meta commentary, comments directed at the participants themselves, and or filler content should be ignored for the analysis.
        9. Do not be biased towards any particular person or viewpoint in the conversation.
        10. If someone shares a well structured normative statement and the others agree with it, you can use that statement as the output. Do not synthesise a new statement in this case.
    `;
    const completionPrompt = t`
        11. If no relevant content is found, do not reply to the irrelevant content! Just say "NO_CONTENT_FOUND"
    `;
    const verificationPrompt = t`
        11. Search for any relevant content even if some of it is useless. Do not reply to the irrelevant content!
    `;
    const expandedPrompt = (mode === 'completion' ? completionPrompt : verificationPrompt);

    const prompt = `
        ${basePrompt}
        ${expandedPrompt}
    `;

    return prompt;
}
