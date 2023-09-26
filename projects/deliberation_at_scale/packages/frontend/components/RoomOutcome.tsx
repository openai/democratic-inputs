'use client';
import { motion } from 'framer-motion';
import { Trans, t } from '@lingui/macro';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

import { statementSolid } from "./EntityIcons";
import Pill from "./Pill";
import { FullOutcomeFragment, OpinionOptionType, OpinionType, OutcomeType, useChangeOpinionMutation, useCreateOpinionMutation } from '@/generated/graphql';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useMemo, useState } from 'react';
import Button from './Button';
import { DISABLE_OPINION_INPUT_WHEN_TIMED_OUT, OUTCOME_OPINION_TIMEOUT_MS_LOOKUP } from '@/utilities/constants';
import TimeProgressBar from './TimeProgressBar';

export interface OpinionOption {
    content: string;
    icon: IconProp;
    optionType: OpinionOptionType;
}

interface Props {
    outcome?: FullOutcomeFragment;
    participantId?: string;
}

export default function RoomOutcome(props: Props) {
    const { outcome, participantId } = props;
    const opinions = outcome?.opinionsCollection?.edges?.map((opinion) => opinion.node);
    const existingOpinion = opinions?.find((opinion) => {
        return opinion.participant_id === participantId;
    });
    const hasExistingOpinion = !!existingOpinion;
    const { id: outcomeId, content, type } = outcome ?? {};
    const [createOpinion, { loading: isCreatingOpinion }] = useCreateOpinionMutation();
    const [changeOpinion, { loading: isChangingOpinion }] = useChangeOpinionMutation();
    const [timeoutCompleted, setTimeoutCompleted] = useState(false);
    const isGivingOpinion = isCreatingOpinion || isChangingOpinion;
    const title = useMemo(() => {
        switch (type) {
            case OutcomeType.Consensus: return 'Consensus Proposal';
            case OutcomeType.Milestone: return 'Milestone';
            case OutcomeType.OffTopic: return 'Off Topic';
        }
    }, [type]);
    const timeoutMs = useMemo(() => {
        if (!type || hasExistingOpinion) {
            return 0;
        }

        return OUTCOME_OPINION_TIMEOUT_MS_LOOKUP[type];
    }, [type, hasExistingOpinion]);
    const hasTimeout = timeoutMs > 0;

    const opinionOptions = useMemo(() => {
        return getOpinionOptionsByOutcomeType(type);
    }, [type]);

    if (!outcome) {
        return null;
    }

    return (
        <motion.div
            layoutId={outcomeId}
            className="p-4 gap-4 flex flex-col items-start"
            initial={{ opacity: 0, x: -70 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <Pill icon={statementSolid} className="border-black">
                <Trans>{title}</Trans>
            </Pill>
            <span>{content}</span>
            <div className="flex flex-col gap-2 w-full">
                {opinionOptions.map((option) => {
                    const { content, icon, optionType } = option;
                    // TODO: implement on button
                    const isSelected = (existingOpinion?.option_type === optionType);
                    const isDisabled = isGivingOpinion || (timeoutCompleted && DISABLE_OPINION_INPUT_WHEN_TIMED_OUT);
                    const onOptionClick = () => {
                        const mutationVariables = {
                            outcomeId,
                            participantId,
                            type: OpinionType.Option,
                            optionType,
                        };

                        // guard: update an existing opinion when already given one
                        if (hasExistingOpinion) {
                            changeOpinion({
                                variables: mutationVariables,
                            });
                            return;
                        }

                        createOpinion({
                            variables: mutationVariables,
                        });
                    };

                    return (
                        <Button
                            disabled={isDisabled}
                            key={optionType}
                            icon={icon}
                            onClick={onOptionClick}
                        >
                            {content}
                        </Button>
                    );
                })}
            </div>
            {hasTimeout && (
                <TimeProgressBar
                    durationMs={timeoutMs}
                    startReferenceTime={outcome.created_at}
                    onIsCompleted={(isCompleted) => {
                        setTimeoutCompleted(isCompleted);
                    }}
                />
            )}
        </motion.div>
    );
}

function getOpinionOptionsByOutcomeType(type?: OutcomeType): OpinionOption[] {
    switch (type) {
        case OutcomeType.Consensus:
            return [
                {
                    content: t`Yes, this reflects our deliberation`,
                    icon: faCheck,
                    optionType: OpinionOptionType.AgreeConsensus,
                },
                {
                    content: t`No, this does not reflect our deliberation`,
                    icon: faTimes,
                    optionType: OpinionOptionType.DisagreeConsensus,
                },
            ];
    }

    return [];
}


