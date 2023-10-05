'use client';
import { motion } from 'framer-motion';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import ReactMarkdown from 'react-markdown';

import { statementSolid } from "./EntityIcons";
import Pill from "./Pill";
import { FullOutcomeFragment, OpinionOptionType, OpinionType, OutcomeType } from '@/generated/graphql';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useMemo, useState } from 'react';
import Button from './Button';
import { DISABLE_OPINION_INPUT_WHEN_TIMED_OUT, OUTCOME_OPINION_TIMEOUT_MS_LOOKUP } from '@/utilities/constants';
import TimeProgressBar from './TimeProgressBar';
import useUpsertOpinion from '@/hooks/useUpsertOpinion';
import { useLingui } from '@lingui/react';

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
    const { _ } = useLingui();
    const { outcome, participantId } = props;
    const { id: outcomeId, content = '', type } = outcome ?? {};
    const { isGivingOpinion, setOpinion, getExistingOpinion } = useUpsertOpinion({ outcomes: [outcome], participantId });
    const existingOpinion = getExistingOpinion(outcomeId);
    const [timeoutCompleted, setTimeoutCompleted] = useState(false);
    const title = useMemo(() => {
        switch (type) {
            case OutcomeType.Consensus: return _(`Consensus Proposal`);
            case OutcomeType.Milestone: return _(`Milestone`);
            case OutcomeType.OffTopic: return _(`Off Topic`);
        }
    }, [type, _]);
    const timeoutMs = useMemo(() => {
        if (!type || !!existingOpinion) {
            return 0;
        }

        return OUTCOME_OPINION_TIMEOUT_MS_LOOKUP[type];
    }, [type, existingOpinion]);
    const hasTimeout = timeoutMs > 0;
    const opinionOptions = useMemo(() => {
        switch (type) {
            case OutcomeType.Consensus:
                return [
                    {
                        content: _(`I agree with this consensus.`),
                        icon: faCheck,
                        optionType: OpinionOptionType.AgreeConsensus,
                    },
                    {
                        content: _(`I don't agree with this.`),
                        icon: faTimes,
                        optionType: OpinionOptionType.DisagreeConsensus,
                    },
                    {
                        content: _(`This statement should be reformulated.`),
                        icon: faTimes,
                        optionType: OpinionOptionType.Wrong,
                    },
                ];
        }

        return [];
    }, [type, _]);
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
            <Pill icon={statementSolid} className="border-black">{title}</Pill>
            <ReactMarkdown>{content}</ReactMarkdown>
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
                                key={optionType}
                                disabled={isDisabled}
                                selected={isSelected}
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


