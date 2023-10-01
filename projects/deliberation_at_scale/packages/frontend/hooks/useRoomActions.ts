import { useAppSelector } from "@/state/store";
import useRoom from "./useRoom";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { t } from "@lingui/macro";
import { OutcomeType } from "@/generated/graphql";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface RoomAction {
    id: string;
    icon?: IconDefinition;
    title: string;
    onClick: () => void;
}

export default function useRoomActions() {
    const { roomId, isRoomEnded, getOutcomeByType } = useRoom();
    const lastOpenedAssistantAt = useAppSelector((state) => state.room.lastOpenedAssistantAt);
    const { push } = useRouter();
    const actions: RoomAction[] = useMemo(() => {
        const newActions: RoomAction[] = [];
        const latestConsensusOutcome = getOutcomeByType(OutcomeType.Consensus);
        const shouldNotifyConsensus = latestConsensusOutcome && dayjs(latestConsensusOutcome?.created_at).isAfter(lastOpenedAssistantAt);

        if (shouldNotifyConsensus) {
            newActions.push({
                id: 'vote-for-consensus',
                title: t`Go to voting`,
                onClick: () => {
                    push(`/room/${roomId}/ai`);
                },
            });
        }

        if (isRoomEnded) {
            newActions.push({
                id: 'end-room',
                title: t`Leave room`,
                onClick: () => {
                    push(`/evaluate/${roomId}`);
                },
            });
        }

        return newActions;
    }, [getOutcomeByType, isRoomEnded, lastOpenedAssistantAt, push, roomId]);

    return {
        actions,
    };
}
