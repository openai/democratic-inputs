import { Database } from "./generated/database.types";

export type OrchestratorRole = 'all' | 'runner' | 'listener' | 'scheduler';

export interface OrchestratorRoleTask {
    name: string;
    roles: OrchestratorRole[];
    startTask: () => Promise<void>;
    stopTask: () => Promise<void>;
}

export interface BaseProgressionWorkerTaskPayload {
    progressionTask: ProgressionTask;
}

/** The root of the topology containing all the different layers where the deliberation can go through. */
export interface ProgressionTopology {
    layers: ProgressionLayer[];
}

/** All the possible tasks that can be registered in the job system */
export type LayerId = 'introductionParticipants' | 'introductionTopic' | 'safe' | 'informed' | 'conversate' | 'results' | 'conclude';

export type RoomStatus = Database['public']['Enums']['roomStatusType'];

/** Single layer of the topology the deliberation can progress to */
export interface ProgressionLayer {
    /** The unique identifier of the layer. */
    id: LayerId;
    /** The room status that should be persisted on the room when progressed to this layer. */
    roomStatus: RoomStatus;
    /** All the required verifications to progress to the next layer, with supporting moderation.  */
    verifications: ProgressionVerificationTask[];
    /** Additional moderations that can enrich the deliberation, but don't have any influence on the progression itself. */
    enrichments?: ProgressionEnrichmentTask[];
}

/** All the possible tasks that can be registered in the job system */
export type WorkerTaskId =
    'verifyBadLanguage' |
    'verifyIntroductionParticipants' |
    'verifyDifficultLanguage' |
    'verifyEmotionalWellbeing' |
    'enrichModeratorMessageSafeBehaviour' |
    'enrichModeratorMessageParticipantIntroduction' |
    'verifyOffTopic' | 'enrichModeratorMessageInformedBehaviour' |
    'verifyEnoughContent' |
    'verifyEqualParticipation' |
    'verifyConsensusForming' |
    'enrichModeratorMessageStimulateConsensus';

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
    cooldownSeconds?: number;
    /** An optional minimum cooldown in terms of amount of messages before checking this task again. */
    cooldownAmountMessages?: number;
    /** An optional amount of maximum atempt in a specific layer (This could be more in total, e.g.: when it switches back to the layer because of X) */
    maxAtemptsInLayer?: number;
    /** An optional amount of maximum atempt in total (Even when switching between layers, the value wont be reset) */
    maxAtemptsInTotal?: number;
    /** An optional buffer in amount of time before the task is allowed to run */
    buffer?: number;
}

/** A single verification task which specify behaviour what to do when the verification fails. */
export interface ProgressionVerificationTask extends ProgressionTask {
    /** True when this verification task causes a fallback to the previous layer when not verified. */
    fallback?: boolean;
}

/** A single enrichtment task with specific behaviour how to perform the enrichtment. */
export interface ProgressionEnrichmentTask extends ProgressionTask {

}

export interface ProgressionContext {
    /** Context for the messages data fetching. */
    messages: ProgressionHistoryContext;
}

export interface ProgressionHistoryContext {
    /** The amount of seconds in the history the data should be fetched. */
    historyAmountSeconds?: number;
    historyAmountMessages?: number;
    historyAllMessages?: boolean;

    /** Check on history for specified layer. All collected message history that took place in a  specified layer */
    historySpecifiedLayers?: Array<LayerId>;

}
