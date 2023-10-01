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
    // const [referenceTime, setReferenceTime] = useState(dayjs());
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
                title: t`Go to evaluation`,
                onClick: () => {
                    push(`/evaluate/${roomId}`);
                },
            });
        }

        return newActions;
    }, [getOutcomeByType, isRoomEnded, lastOpenedAssistantAt, push, roomId]);

    // update the reference time so we can handle actions timing out automatically
    // useEffect(() => {
    //     const referenceTimeInterval = setInterval(() => {
    //         setReferenceTime(dayjs());
    //     }, ONE_SECOND_MS * 2);

    //     return () => {
    //         clearInterval(referenceTimeInterval);
    //     };
    // }, []);

    return {
        actions,
    };
}
