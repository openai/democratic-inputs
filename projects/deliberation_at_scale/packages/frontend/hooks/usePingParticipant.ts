import dayjs from "dayjs";
import { useEffect } from "react";

import { usePingParticipantMutation } from "@/generated/graphql";
import { PARTICIPANT_PING_INTERVAL_DELAY_MS } from "@/utilities/constants";

export function usePingParticipant(participantId?: string) {
    const [ping, { loading, error, data }] = usePingParticipantMutation();

    useEffect(() => {

        // guard
        if (!participantId) {
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
    }, [participantId, ping]);

    return { loading, error, data };
}
