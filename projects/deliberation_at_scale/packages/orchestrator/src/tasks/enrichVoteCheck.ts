import { ModeratorTaskTuple, sendHardCodedEnrichMessage } from "../utilities/tasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { Helpers } from "graphile-worker";
import { getParticipantsByRoomId } from "src/utilities/participants";

export default async function enrichVoteCheck(payload: BaseProgressionWorkerTaskPayload, helpers: Helpers): Promise<ModeratorTaskTuple> {
    const { roomId, progressionTask, progressionLayerId } = payload;
    const latestOutcome = getLatestOutcomeByRoomId(roomId);
    const participants = await getParticipantsByRoomId(roomId);
    const participantIds = participants?.map(p => p.id);

    // TODO: make outcome recursive and remove cross pollination
    if (latestOutcome) {
        const opinions = getOutcomeOpinionsByParticipants(latestOutcome, participantIds);
        const hasEveryoneVoted = participants.map();

        if (!hasEveryoneVoted) {
            // remind for vote!
        } else {
            // move to new outcome
        }
    }

    return {
        moderation,
    };
}
