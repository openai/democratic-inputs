import { Helpers } from "graphile-worker";

import { BaseProgressionWorkerTaskPayload } from "../types";
import { ModeratorTaskTuple } from "./tasks";

import enrichClosure from "../tasks/enrichClosure";
import enrichConsensusProposal from "../tasks/enrichConsensusProposal";
import enrichConsensusStimulation from "../tasks/enrichConsensusStimulation";
import enrichEqualParticipation from "../tasks/enrichEqualParticipation";
import enrichGroupIntroduction from "../tasks/enrichGroupIntroduction";
import enrichModeratorIntroduction from "../tasks/enrichModeratorIntroduction";
import enrichSafeBehaviour from "../tasks/enrichSafeBehaviour";
import enrichSmoothConversation from "../tasks/enrichSmoothConversation";
import enrichTopicIntroduction from "../tasks/enrichTopicIntroduction";
import verifyConsensusForming from "../tasks/verifyConsensusForming";
import verifyEasyLanguage from "../tasks/verifyEasyLanguage";
import verifyEmotionalWellbeing from "../tasks/verifyEmotionalWellbeing";
import verifyEnoughContent from "../tasks/verifyEnoughContent";
import verifyEqualParticipation from "../tasks/verifyEqualParticipation";
import verifyOffTopic from "../tasks/verifyOffTopic";
import verifySafeLanguage from "../tasks/verifySafeLanguage";
import verifySmoothConversation from "../tasks/verifySmoothConversation";
import verifyGroupIntroduction from "../tasks/verifyGroupIntroduction";

export interface ProgressionTaskExecutorLookup {
    [key: string]: (payload: BaseProgressionWorkerTaskPayload, helpers: Helpers) => Promise<ModeratorTaskTuple>;
}

// lookup table so we can execute these tasks without a worker job
export const progressionTaskExecutorLookup: ProgressionTaskExecutorLookup = {
    enrichClosure,
    enrichConsensusProposal,
    enrichConsensusStimulation,
    enrichEqualParticipation,
    enrichGroupIntroduction,
    enrichModeratorIntroduction,
    enrichSafeBehaviour,
    enrichSmoothConversation,
    enrichTopicIntroduction,
    verifyConsensusForming,
    verifyEasyLanguage,
    verifyEmotionalWellbeing,
    verifyEnoughContent,
    verifyEqualParticipation,
    verifyGroupIntroduction,
    verifyOffTopic,
    verifySafeLanguage,
    verifySmoothConversation,
};
