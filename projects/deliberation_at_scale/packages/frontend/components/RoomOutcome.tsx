'use client';
import { motion } from 'framer-motion';
import { Trans, t } from '@lingui/macro';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

import { statementSolid } from "./EntityIcons";
import Pill from "./Pill";
import { FullOutcomeFragment, OpinionOptionType, OpinionType, OutcomeType } from '@/generated/graphql';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useMemo, useState } from 'react';
import Button from './Button';
import { DISABLE_OPINION_INPUT_WHEN_TIMED_OUT, OUTCOME_OPINION_TIMEOUT_MS_LOOKUP } from '@/utilities/constants';
import TimeProgressBar from './TimeProgressBar';
import useUpsertOpinion from '@/hooks/useUpsertOpinion';

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
    const { id: outcomeId, content, type } = outcome ?? {};
    const { isGivingOpinion, setOpinion, getExistingOpinion } = useUpsertOpinion({ outcomes: [outcome], participantId });
    const existingOpinion = getExistingOpinion(outcomeId);
    const [timeoutCompleted, setTimeoutCompleted] = useState(false);
    const title = useMemo(() => {
        switch (type) {
            case OutcomeType.Consensus: return 'Consensus Proposal';
            case OutcomeType.Milestone: return 'Milestone';
            case OutcomeType.OffTopic: return 'Off Topic';
        }
    }, [type]);
    const timeoutMs = useMemo(() => {
        if (!type || !!existingOpinion) {
            return 0;
        }

        return OUTCOME_OPINION_TIMEOUT_MS_LOOKUP[type];
    }, [type, existingOpinion]);
    const hasTimeout = timeoutMs > 0;

    const opinionOptions = useMemo(() => {
        return getOpinionOptionsByOutcomeType(type);
    }, [type]);
    const hasOpinionOptions = (opinionOptions.length > 0);

    if (!outcome) {
        return null;
    }

    return (
        <motion.div
            layoutId={outcomeId}
            className="p-4 gap-4 flex flex-col items-start"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Pill icon={statementSolid} className="border-black">
                <Trans>{title}</Trans>
            </Pill>
            <span>{content}</span>
            {hasOpinionOptions && (
                <div className="flex flex-col gap-2 w-full">
                    {opinionOptions.map((option) => {
                        const { content, icon, optionType } = option;
                        // TODO: implement on button
                        const isSelected = (existingOpinion?.option_type === optionType);
                        const isDisabled = isGivingOpinion || (timeoutCompleted && DISABLE_OPINION_INPUT_WHEN_TIMED_OUT);
                        const onOptionClick = () => {
                            setOpinion({
                                outcomeId,
                                type: OpinionType.Option,
                                optionType,
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
            )}
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


