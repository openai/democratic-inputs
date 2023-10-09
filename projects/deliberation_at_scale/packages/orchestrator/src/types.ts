import { Database } from "./generated/database-public.types";
import { Message } from "./lib/supabase";

export type OrchestratorRole = 'all' | 'runner' | 'listener' | 'scheduler' | 'migrator';

export interface OrchestratorRoleTask {
    name: string;
    roles: OrchestratorRole[];
    startTask: () => Promise<void>;
    stopTask: () => Promise<void>;
}

export interface BaseWorkerTaskPayload {
    jobKey: string;
}

export interface BaseRoomWorkerTaskPayload extends BaseWorkerTaskPayload {
    roomId: string;
}

export interface BaseMessageWorkerTaskPayload extends BaseRoomWorkerTaskPayload {
    message: Message;
}

export interface BaseProgressionWorkerTaskPayload extends BaseRoomWorkerTaskPayload {
    progressionTask: ProgressionTask;
    progressionLayerId: ProgressionLayerId;
}

/** The root of the topology containing all the different layers where the deliberation can go through. */
export interface ProgressionTopology {
    layers: ProgressionLayer[];
}

/** All the possible tasks that can be registered in the job system */
export type ProgressionLayerId = 'groupIntro' | 'topicIntro' | 'safe' | 'informed' | 'debate' | 'results' | 'close' | 'end';

export type RoomStatus = Database['public']['Enums']['roomStatusType'];

/** Single layer of the topology the deliberation can progress to */
export interface ProgressionLayer {
    /** The unique identifier of the layer. */
    id: ProgressionLayerId;
    /** The room status that should be persisted on the room when progressed to this layer. */
    roomStatus: RoomStatus;
    /** All the required verifications to progress to the next layer, with supporting moderation.  */
    verifications?: ProgressionVerificationTask[];
    /** Additional moderations that can enrich the deliberation, but don't have any influence on the progression itself. */
    enrichments?: ProgressionEnrichmentTask[];
}

/** All the possible tasks that can be registered in the job system */
export type WorkerTaskId =
    'enrichVoteCheck' |
    'verifyRequestedEnd' |
    'enrichClosure' |
    'enrichConsensusProposal' |
    'enrichConsensusStimulation' |
    'enrichEqualParticipation' |
    'enrichGroupIntroduction' |
    'enrichModeratorIntroduction' |
    'enrichSafeBehaviour' |
    'enrichTopicIntroduction' |
    'enrichOffTopic' |
    'enrichSmoothConversation' |
    'triggerRoomProgressionUpdates' |
    'updateRoomProgression' |
    'verifyConsensusForming' |
    'verifyEasyLanguage' |
    'verifyEasyMessage' |
    'verifyEmotionalWellbeing' |
    'verifyEnoughContent' |
    'verifyEqualParticipation' |
    'verifyGroupIntroduction' |
    'verifyOffTopic' |
    'verifySafeLanguage' |
    'verifySafeMessage' |
    'verifySmoothConversation'
;

/** A single task within a progression layer. */
export interface ProgressionTask {
    /** The unique identifier of the progression task. */
    id: string;
    /** The worker task to execute for this part of the progression. */
    workerTaskId: WorkerTaskId;
    /** By default all tasks are active, use this to temporarily disable tasks */
    active?: boolean;
    /** The context passed to the task to know what data to pay attention to. */
    context?: ProgressionContext;
    /** An optional minimum cooldown in terms of time before checking this task again. */
    cooldown?: ProgressionTaskCooldown;
    /** The minimum amount of attempts this task should be done */
    minAttempts?: number;
    /** The maximum amount of attempts this task should be done */
    maxAttempts?: number;
}

export interface ProgressionTaskCooldown {
    /** Flag to determine whether the progression is also blocked when cooling down. */
    blockProgression?: boolean;
    /** The amount of seconds required before the first execution of this task. */
    startDelayMs?: number;
    /** The amount of seconds required to wait before this task can run again. */
    durationMs?: number;
    /** The minimum amount of new messages after last execution of this task required before it can become valid. */
    minMessageAmount?: number;
    /** The maximum amount of new messages after last execution of this task required before it can become valid. */
    maxMessageAmount?: number;
    /** An optional amount of maximum atempt in a specific layer (This could be more in total, e.g.: when it switches back to the layer because of X) */
    maxAtemptsInLayer?: number;
    /** An optional amount of maximum atempt in total (Even when switching between layers, the value wont be reset) */
    maxAtemptsInTotal?: number;
}

/** A single verification task which specify behaviour what to do when the verification fails. */
export interface ProgressionVerificationTask extends ProgressionTask {
    /** True when this verification should be run on every next layer */
    persistent?: boolean;
}

export type EnrichmentExecutionType = 'onNotVerified' | 'onVerified' | 'alwaysBeforeVerification' | 'alwaysAfterVerification';

export interface VerificationCondition {
    /** Which verification task should be checked to see if the enrichment should be triggered  */
    progressionTaskId: string;
    isVerified: boolean;
}

/** A single enrichment task with specific behaviour how to perform the enrichment. */
export interface ProgressionEnrichmentTask extends ProgressionTask {
    priority?: number;
    /** To specifiy when the enrichment should be triggered. */
    executionType?: EnrichmentExecutionType;
    /** Whether the updateRoomProgression function should wait to continue as long as the enrichment task is not finished */
    waitFor?: boolean;
    /** Conditions to specifiy whether the enrichment should trigger on specific verifications*/
    conditions?: VerificationCondition[];
}

export interface ProgressionContext {
    /** Context for the messages data fetching. */
    messages: ProgressionHistoryMessageContext;
}

export interface ProgressionHistoryMessageContext extends ProgressionHistoryContext {
    /** Filter the history on the room statuses when the message was received */
    roomStatuses?: Array<RoomStatus>;
}

export interface ProgressionHistoryContext {
    /** The amount of milliseconds in the past the rows should be fetched */
    durationMs?: number;
    /** The amount of rows should be fetched in the past */
    amount?: number;
}
