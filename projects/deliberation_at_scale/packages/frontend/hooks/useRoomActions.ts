import { useAppSelector } from "@/state/store";
import useRoom from "./useRoom";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { OutcomeType, useSendRoomMessageMutation } from "@/generated/graphql";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/macro";
import { faDoorOpen, faForward } from "@fortawesome/free-solid-svg-icons";
import useLocalizedPush from "./useLocalizedPush";
import useGiveOpinion from "./useGiveOpinion";

export interface RoomAction {
    id: string;
    icon?: IconDefinition;
    title: string;
    onClick: () => void;
}

export default function useRoomActions() {
    const { _ } = useLingui();
    const { roomId, isRoomEnded, getOutcomeByType, lastOutcome, participantId, participants, refetchMessages } = useRoom();
    const { getGroupOpinions } = useGiveOpinion({
        subjects: [lastOutcome],
        participantId,
    });
    const [sendMessage, { loading: isSendingMessage }] = useSendRoomMessageMutation();
    const lastOpenedAssistantAt = useAppSelector((state) => state.room.lastOpenedAssistantAt);
    const [nextStatementPressed, setNextStatementPressed] = useState(false);
    const { push } = useLocalizedPush();
    const actions: RoomAction[] = useMemo(() => {
        const newActions: RoomAction[] = [];
        const latestConsensusOutcome = getOutcomeByType(OutcomeType.Consensus);
        const shouldNotify = (createdAt?: string) => {
            return createdAt && dayjs(createdAt).isAfter(lastOpenedAssistantAt);
        };
        const shouldNotifyConsensus = shouldNotify(latestConsensusOutcome?.created_at);
        const hasEveryoneVoted = getGroupOpinions(lastOutcome?.id).length === participants?.length;
        const canSkipOutcome = hasEveryoneVoted && !nextStatementPressed;

        if (shouldNotifyConsensus) {
            newActions.push({
                id: 'vote-for-consensus',
                title: _(msg`Go to voting`),
                onClick: () => {
                    push(`/room/${roomId}`);
                },
            });
        }

        if (canSkipOutcome) {
            newActions.push({
                id: 'can-skip-outcome',
                icon: faForward,
                title: _(msg`Next statement`),
                onClick: async () => {
                    if (isSendingMessage) {
                        return;
                    }

                    setNextStatementPressed(true);
                    await sendMessage({
                        variables: {
                            roomId,
                            content: _(msg`I would like to move on to the next statement.`),
                            participantId,
                            tags: 'next-statement',
                        },
                    });

                    // TMP: temporary until Realtime has better performance
                    refetchMessages();
                },
            });
        }

        if (isRoomEnded) {
            newActions.push({
                id: 'end-room',
                icon: faDoorOpen,
                title: _(msg`Leave conversation`),
                onClick: () => {
                    push(`/evaluate/${roomId}`);
                },
            });
        }

        return newActions;
    }, [nextStatementPressed, getOutcomeByType, getGroupOpinions, lastOutcome?.id, participants?.length, isRoomEnded, lastOpenedAssistantAt, _, push, roomId, isSendingMessage, sendMessage, participantId, refetchMessages]);

    // allow next statement again
    useEffect(() => {
        setNextStatementPressed(false);
    }, [lastOutcome]);

    return {
        actions,
    };
}
