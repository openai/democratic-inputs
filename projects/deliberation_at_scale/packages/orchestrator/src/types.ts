import { Database } from "./generated/database.types";

export type OrchestratorRole = 'all' | 'runner' | 'listener' | 'scheduler';

export interface OrchestratorRoleTask {
    name: string;
    roles: OrchestratorRole[];
    startTask: () => Promise<void>;
    stopTask: () => Promise<void>;
}

/** The root of the topology containing all the different layers where the deliberation can go through. */
export interface ProgressionTopology {
    layers: ProgressionLayer[];
}

/** All the possible tasks that can be registered in the job system */
export type LayerId = 'safe' | 'informed' | 'debate' | 'results';

/** Single layer of the topology the deliberation can progress to */
export interface ProgressionLayer {
    /** The unique identifier of the layer. */
    id: LayerId;
    /** The room status that should be persisted on the room when progressed to this layer. */
    roomStatus: Database['public']['Enums']['roomStatusType'];
    /** All the required verifications to progress to the next layer, with supporting moderation.  */
    verifications: ProgressionVerificationTask[];
    /** Additional moderations that can enrich the deliberation, but don't have any influence on the progression itself. */
    enrichments?: ProgressionEnrichmentTask[];
}

/** All the possible tasks that can be registered in the job system */
export type ProgressionTaskId = 'badLanguage';

/** A single task within a progression layer. */
export interface ProgressionTask {
    /** The task to execute for this part of the progression. */
    id: ProgressionTaskId;
    /** The context passed to the task to know what data to pay attention to. */
    context?: ProgressionContext;
    /** An optional minimum cooldown in terms of time before checking this task again. */
    cooldownSeconds?: number;
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
    historyAmountSeconds: number;
}
