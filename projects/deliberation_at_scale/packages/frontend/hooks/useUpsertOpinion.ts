import { FullOpinionFragment, FullOutcomeFragment, OpinionOptionType, OpinionType, useChangeOpinionMutation, useCreateOpinionMutation } from "@/generated/graphql";
import { useCallback, useMemo } from "react";

export interface UseUpsertOpinionOptions {
    outcomes?: (FullOutcomeFragment | undefined)[];
    participantId?: string;
}

export interface SetOpinionOptions {
    outcomeId: string;
    type: OpinionType;
    optionType?: OpinionOptionType
    statement?: string;
    rangeValue?: number;
}

export default function useUpsertOpinion(options: UseUpsertOpinionOptions) {
    const { outcomes, participantId } = options;
    const opinions = useMemo(() => {
        const opinions: FullOpinionFragment[] = [];

        outcomes?.map((outcome) => {
            outcome?.opinionsCollection?.edges.map((opinion) => {
                opinions.push(opinion.node);
            });
        });

        return opinions;
    }, [outcomes]);
    const getExistingOpinion = useCallback((outcomeId: string) => {
        return opinions.find((opinion) => {
            return opinion.outcome_id === outcomeId && opinion.participant_id === participantId;
        });
    }, [opinions, participantId]);
    const hasExistingOpinion = useCallback((outcomeId: string) => {
        return !!getExistingOpinion(outcomeId);
    }, [getExistingOpinion]);
    const [createOpinion, { loading: isCreatingOpinion }] = useCreateOpinionMutation();
    const [changeOpinion, { loading: isChangingOpinion }] = useChangeOpinionMutation();
    const isGivingOpinion = isCreatingOpinion || isChangingOpinion;
    const setOpinion = useCallback((options: SetOpinionOptions) => {
        const { outcomeId } = options;
        const mutationVariables = {
            ...options,
            participantId,
        };

        // guard: update an existing opinion when already given one
        if (hasExistingOpinion(outcomeId)) {
            changeOpinion({
                variables: mutationVariables,
            });
            return;
        }

        createOpinion({
            variables: mutationVariables,
        });
    }, [changeOpinion, createOpinion, hasExistingOpinion, participantId]);

    return {
        getExistingOpinion,
        hasExistingOpinion,
        isGivingOpinion,
        setOpinion,
    };
}
