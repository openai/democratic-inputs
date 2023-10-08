import { useAppSelector } from "@/state/store";
import useRoom from "./useRoom";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { OutcomeType } from "@/generated/graphql";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/macro";
import { sort } from "radash";

export interface RoomAction {
    id: string;
    icon?: IconDefinition;
    title: string;
    onClick: () => void;
}

export default function useRoomActions() {
    const { _ } = useLingui();
    const { roomId, isRoomEnded, getOutcomeByType, crossPollinations } = useRoom();
    const lastOpenedAssistantAt = useAppSelector((state) => state.room.lastOpenedAssistantAt);
    const { push } = useRouter();
    const actions: RoomAction[] = useMemo(() => {
        const newActions: RoomAction[] = [];
        const latestConsensusOutcome = getOutcomeByType(OutcomeType.Consensus);
        const latestCrossPollination = sort(crossPollinations, (cp) => cp.created_at, true)?.[0];
        const shouldNotify = (createdAt?: string) => {
            return createdAt && dayjs(createdAt).isAfter(lastOpenedAssistantAt);
        };
        const shouldNotifyConsensus = shouldNotify(latestConsensusOutcome?.created_at);
        const shouldNotifyCrossPollination = shouldNotify(latestCrossPollination?.created_at);

        if (shouldNotifyConsensus) {
            newActions.push({
                id: 'vote-for-consensus',
                title: _(msg`Go to voting`),
                onClick: () => {
                    push(`/room/${roomId}`);
                },
            });
        }

        if (shouldNotifyCrossPollination) {
            newActions.push({
                id: 'view-cross-pollination',
                title: _(msg`View inspiration`),
                onClick: () => {
                    push(`/room/${roomId}`);
                },
            });
        }

        if (isRoomEnded) {
            newActions.push({
                id: 'end-room',
                title: _(msg`Leave room`),
                onClick: () => {
                    push(`/evaluate/${roomId}`);
                },
            });
        }

        return newActions;
    }, [getOutcomeByType, crossPollinations, isRoomEnded, lastOpenedAssistantAt, _, push, roomId]);

    return {
        actions,
    };
}
