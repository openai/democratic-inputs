import dayjs from "dayjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { FullParticipantFragment, ParticipantStatusType, usePingParticipantMutation } from "@/generated/graphql";
import { PARTICIPANT_PING_INTERVAL_DELAY_MS } from "@/utilities/constants";

export function usePingParticipant(candidateParticipant?: FullParticipantFragment) {
    const participantId = candidateParticipant?.id;
    const participantActive = candidateParticipant?.active;
    const participantStatus = candidateParticipant?.status;
    const [ping, { loading, error, data }] = usePingParticipantMutation();
    const { push } = useRouter();

    useEffect(() => {

        // guard check if the ID is valid and only ping when queued
        // this prevent in confirmation participants to be updated as well
        if (!participantId || participantStatus !== ParticipantStatusType.Queued || participantActive !== true) {
            return;
        }

        const pingInterval = setInterval(async () => {
            const pingResult = await ping({
                variables: {
                    participantId,
                    lastSeenAt: dayjs().toISOString(),
                }
            });

            const affectedCount = pingResult.data?.updateparticipantsCollection?.affectedCount ?? 0;

            // reload the pge when the participant got deactivated somehow
            if (affectedCount <= 0) {
                document.location.reload();
            }
        }, PARTICIPANT_PING_INTERVAL_DELAY_MS);

        return (() => {
            clearInterval(pingInterval);
        });
    }, [participantId, participantStatus, participantActive, ping, push]);

    return { loading, error, data };
}
