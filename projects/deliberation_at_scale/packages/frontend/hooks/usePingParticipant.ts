import dayjs from "dayjs";
import { useEffect } from "react";

import { FullParticipantFragment, ParticipantStatusType, usePingParticipantMutation } from "@/generated/graphql";
import { PARTICIPANT_PING_INTERVAL_DELAY_MS } from "@/utilities/constants";

export function usePingParticipant(candidateParticipant?: FullParticipantFragment) {
    const participantId = candidateParticipant?.id;
    const participantStatus = candidateParticipant?.status;
    const [ping, { loading, error, data }] = usePingParticipantMutation();

    useEffect(() => {

        // guard check if the ID is valid and only ping when queued
        // this prevent in confirmation participants to be updated as well
        if (!participantId || participantStatus !== ParticipantStatusType.Queued) {
            return;
        }

        const pingInterval = setInterval(() => {
            ping({
                variables: {
                    participantId,
                    lastSeenAt: dayjs().toISOString(),
                }
            });
        }, PARTICIPANT_PING_INTERVAL_DELAY_MS);

        return (() => {
            clearInterval(pingInterval);
        });
    }, [participantId, participantStatus, ping]);

    return { loading, error, data };
}
