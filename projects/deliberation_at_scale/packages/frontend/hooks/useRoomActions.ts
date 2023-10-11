import { useAppSelector } from "@/state/store";
import useRoom from "./useRoom";
import { useMemo } from "react";
import dayjs from "dayjs";
import { OutcomeType } from "@/generated/graphql";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/macro";
import { faDoorOpen } from "@fortawesome/free-solid-svg-icons";
import useLocalizedPush from "./useLocalizedPush";

export interface RoomAction {
    id: string;
    icon?: IconDefinition;
    title: string;
    onClick: () => void;
}

export default function useRoomActions() {
    const { _ } = useLingui();
    const { roomId, isRoomEnded, getOutcomeByType } = useRoom();
    const lastOpenedAssistantAt = useAppSelector((state) => state.room.lastOpenedAssistantAt);
    const { push } = useLocalizedPush();
    const actions: RoomAction[] = useMemo(() => {
        const newActions: RoomAction[] = [];
        const latestConsensusOutcome = getOutcomeByType(OutcomeType.Consensus);
        const shouldNotify = (createdAt?: string) => {
            return createdAt && dayjs(createdAt).isAfter(lastOpenedAssistantAt);
        };
        const shouldNotifyConsensus = shouldNotify(latestConsensusOutcome?.created_at);

        if (shouldNotifyConsensus) {
            newActions.push({
                id: 'vote-for-consensus',
                title: _(msg`Go to voting`),
                onClick: () => {
                    push(`/room/${roomId}`);
                },
            });
        }

        if (isRoomEnded) {
            newActions.push({
                id: 'end-room',
                icon: faDoorOpen,
                title: _(msg`Leave room`),
                onClick: () => {
                    push(`/evaluate/${roomId}`);
                },
            });
        }

        return newActions;
    }, [getOutcomeByType, isRoomEnded, lastOpenedAssistantAt, _, push, roomId]);

    return {
        actions,
    };
}
