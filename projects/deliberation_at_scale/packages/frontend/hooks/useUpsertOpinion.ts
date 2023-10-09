import { FullOpinionFragment, FullOutcomeFragment, OpinionOptionType, OpinionType, useChangeOpinionMutation, useCreateOpinionMutation } from "@/generated/graphql";
import { useCallback, useMemo } from "react";

export type Subject = FullOutcomeFragment;

export interface UseUpsertOpinionOptions {
    subjects?: (Subject | undefined)[];
    participantId?: string;
}

export interface SetOpinionOptions {
    subjectId: string;
    type: OpinionType;
    optionType?: OpinionOptionType
    statement?: string;
    rangeValue?: number;
}

export default function useUpsertOpinion(options: UseUpsertOpinionOptions) {
    const { subjects, participantId } = options;
    const opinions = useMemo(() => {
        const opinions: FullOpinionFragment[] = [];

        subjects?.map((subject) => {
            subject?.opinionsCollection?.edges.map((opinion) => {
                opinions.push(opinion.node);
            });
        });

        return opinions;
    }, [subjects]);
    const getExistingOpinion = useCallback((subjectId: string) => {
        return opinions.find((opinion) => {
            return (opinion.outcome_id === subjectId || opinion.cross_pollination_id === subjectId) && opinion.participant_id === participantId;
        });
    }, [opinions, participantId]);
    const hasExistingOpinion = useCallback((subjectId: string) => {
        return !!getExistingOpinion(subjectId);
    }, [getExistingOpinion]);
    const [createOpinion, { loading: isCreatingOpinion }] = useCreateOpinionMutation();
    const [changeOpinion, { loading: isChangingOpinion }] = useChangeOpinionMutation();
    const isGivingOpinion = isCreatingOpinion || isChangingOpinion;
    const setOpinion = useCallback((options: SetOpinionOptions) => {
        const { subjectId } = options;
        const subject = subjects?.find((subject) => {
            return subject?.id === subjectId;
        });
        const subjectIdMutationKey = (subject?.__typename === 'outcomes' ? 'outcomeId' : 'unknownId');
        const mutationVariables = {
            ...options,
            participantId,
            [subjectIdMutationKey]: subjectId,
        };

        // guard: update an existing opinion when already given one
        if (hasExistingOpinion(subjectId)) {
            changeOpinion({
                variables: mutationVariables,
            });
            return;
        }

        createOpinion({
            variables: mutationVariables,
        });
    }, [changeOpinion, createOpinion, hasExistingOpinion, participantId, subjects]);

    return {
        getExistingOpinion,
        hasExistingOpinion,
        isGivingOpinion,
        setOpinion,
    };
}
