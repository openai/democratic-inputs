import { Database } from "../generated/database.types";
import { PARTICIPANTS_PER_ROOM } from "@deliberation-at-scale/common";

type Message = Database["public"]["Tables"]["messages"]["Row"];

// Check if all participants have send a message in the set of messages.
export default async function allParticipantsContributed(messages: Message[]) {
    const participantIds = messages.map((message) => message.participant_id);
    const uniqueParticipantIds = Array.from(new Set(participantIds)).length;
    const allContributed = (uniqueParticipantIds == PARTICIPANTS_PER_ROOM) ? true : false;

    return allContributed;
}
