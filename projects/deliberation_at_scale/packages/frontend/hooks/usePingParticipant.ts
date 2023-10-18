import { useEffect, useState } from "react";

import { FullParticipantFragment, usePingParticipantMutation } from "@/generated/graphql";
import { PARTICIPANT_PING_INTERVAL_DELAY_MS } from "@/utilities/constants";
import useLocalizedPush from "./useLocalizedPush";
import { supabaseClient } from "@/state/supabase";

const MAX_FAILED_PINGS = 10;

export function usePingParticipant(candidateParticipant?: FullParticipantFragment) {
    const participantId = candidateParticipant?.id;
    const participantActive = candidateParticipant?.active;
    const participantStatus = candidateParticipant?.status;
    const [ping, { loading, error, data }] = usePingParticipantMutation();
    const { push } = useLocalizedPush();
    const [failedPings, setFailedPings] = useState(0);

    useEffect(() => {

        // guard check if the ID is valid and only ping when queued
        // this prevent in confirmation participants to be updated as well
        if (!participantId || participantActive !== true) {
            return;
        }

        const pingInterval = setInterval(async () => {
            const { data, error } = await supabaseClient.rpc('ping_participant', {
                participant_id: participantId,
            });
            const affectedCount = data ? 1 : 0;

            if (error || affectedCount <= 0) {
                setFailedPings((currentFailedPings) => {
                    return currentFailedPings + 1;
                });
            } else {
                setFailedPings(0);
            }
        }, PARTICIPANT_PING_INTERVAL_DELAY_MS);

        return (() => {
            clearInterval(pingInterval);
        });
    }, [participantId, participantStatus, participantActive, ping, push]);

    // reload the page when the participant got deactivated somehow
    useEffect(() => {
        if (failedPings >= MAX_FAILED_PINGS) {
            document.location.reload();
        }
    }, [failedPings]);

    return { loading, error, data };
}
