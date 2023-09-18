import { usePingParticipantMutation } from "@/generated/graphql";
import { useEffect } from "react";

const PING_INTERVAL_DELAY_MS = 1000;

export function usePingParticipant(participantID?: string) {
    const [ping, { loading, error, data }] = usePingParticipantMutation();
    useEffect(() => {
        // guard
        if (!participantID) {
            return;
        }

        // if has participant ID set interval
        const timer = setInterval(() => {
            ping({
                variables: {
                    participantID,
                    updateTime: new Date().toISOString(),
                }
            });
        }, PING_INTERVAL_DELAY_MS);

        return (() => {
            clearInterval(timer);
        });
    }, [participantID, ping]);
    useEffect(() => {
        if (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }, [error]
    );

    return { loading, error, data };
}
