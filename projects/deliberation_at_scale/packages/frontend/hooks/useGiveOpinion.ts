import { FullOpinionFragment, FullOutcomeFragment, OpinionOptionType, OpinionType, useCreateOpinionMutation } from "@/generated/graphql";
// import { randomUUID } from "crypto";
// import dayjs from "dayjs";
import { sort, unique } from "radash";
import { useCallback, useMemo } from "react";

export type Subject = FullOutcomeFragment;

export interface UseGiveOpinionOptions {
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

export default function useGiveOpinion(options: UseGiveOpinionOptions) {
    const { subjects, participantId } = options;
    const opinions = useMemo(() => {
        const opinions: FullOpinionFragment[] = [];

        subjects?.map((subject) => {
            subject?.opinionsCollection?.edges.map((opinion) => {
                opinions.push(opinion.node);
            });
        });

        // only use the latest opinion per outcome per participant
        const orderedOpinions = sort(opinions, (opinion) => {
            return opinion.created_at;
        }, true);
        const latestOpinions = unique(orderedOpinions, (opinion) => {
            const { outcome_id, participant_id } = opinion;
            return `${outcome_id}-${participant_id}`;
        });

        return latestOpinions;
    }, [subjects]);
    const getExistingOpinion = useCallback((subjectId: string) => {
        return opinions.find((opinion) => {
            return opinion.outcome_id === subjectId && opinion.participant_id === participantId;
        });
    }, [opinions, participantId]);
    const getGroupOpinions = useCallback((subjectId: string) => {
        return opinions.filter((opinion) => {
            return opinion.outcome_id === subjectId;
        });
    }, [opinions]);
    const hasExistingOpinion = useCallback((subjectId: string) => {
        return !!getExistingOpinion(subjectId);
    }, [getExistingOpinion]);
    const [createOpinion, { loading: isGivingOpinion }] = useCreateOpinionMutation();
    const setOpinion = useCallback((options: SetOpinionOptions) => {
        const { subjectId } = options;
        const existingOpinion = getExistingOpinion(subjectId);
        const subject = subjects?.find((subject) => {
            return subject?.id === subjectId;
        });
        const subjectIdMutationKey = (subject?.__typename === 'outcomes' ? 'outcomeId' : 'unknownId');
        const mutationVariables = {
            ...options,
            participantId,
            [subjectIdMutationKey]: subjectId,
        };

        // guard: skip when the opinion is the same
        if (existingOpinion &&
            existingOpinion?.option_type == options.optionType &&
            existingOpinion?.statement == (options.statement ?? '') &&
            existingOpinion?.range_value == (options.rangeValue ?? 0)
        ) {
            return;
        }

        createOpinion({
            variables: mutationVariables,
            // optimisticResponse: {
            //     insertIntoopinionsCollection: {
            //         affectedCount: 1,
            //         records: [{
            //             __typename: 'opinions',
            //             id: randomUUID(),
            //             active: true,
            //             type: mutationVariables.type,
            //             outcome_id: mutationVariables.subjectId,
            //             participant_id: mutationVariables.participantId,
            //             range_value: mutationVariables.rangeValue ?? 0,
            //             statement: mutationVariables.statement ?? '',
            //             option_type: mutationVariables.optionType,
            //             created_at: dayjs().toISOString(),
            //             updated_at: dayjs().toISOString(),
            //         }],
            //     },
            // }
        });
    }, [createOpinion, participantId, subjects, getExistingOpinion]);

    return {
        getGroupOpinions,
        getExistingOpinion,
        hasExistingOpinion,
        isGivingOpinion,
        setOpinion,
    };
}
