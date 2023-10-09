'use client';
import { motion } from 'framer-motion';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import ReactMarkdown from 'react-markdown';
import { msg } from "@lingui/macro";

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
import classNames from 'classnames';

export interface OpinionOption {
    content: string;
    icon: IconProp;
    optionType: OpinionOptionType;
}

interface Props {
    outcome?: FullOutcomeFragment;
    participantId?: string;
    variant?: "compact" | "spacious"
}

export default function RoomOutcome(props: Props) {
    const { _ } = useLingui();
    const { outcome, participantId, variant } = props;
    const { id: outcomeId, content = '', type } = outcome ?? {};
    const { isGivingOpinion, setOpinion, getExistingOpinion } = useUpsertOpinion({ subjects: [outcome], participantId });
    const existingOpinion = getExistingOpinion(outcomeId);
    const [timeoutCompleted, setTimeoutCompleted] = useState(false);
    const title = useMemo(() => {
        switch (type) {
            case OutcomeType.Consensus: return _(msg`Consensus Proposal`);
            case OutcomeType.Milestone: return _(msg`Milestone`);
            case OutcomeType.OffTopic: return _(msg`Off Topic`);
        }
    }, [type, _]);
    const timeoutMs = useMemo(() => {
        if (!type || !!existingOpinion) {
            return 0;
        }

        return OUTCOME_OPINION_TIMEOUT_MS_LOOKUP[type];
    }, [type, existingOpinion]);
    const hasTimeout = timeoutMs > 0;
    console.log(`${type}-${variant}`);

    const opinionOptions = useMemo(() => {
        switch (`${type}-${variant}`) {
            case `${OutcomeType.Consensus}-undefined`:
                return [
                    {
                        content: _(msg`I agree with this consensus.`),
                        icon: faCheck,
                        optionType: OpinionOptionType.AgreeConsensus,
                    },
                    {
                        content: _(msg`I don't agree with this.`),
                        icon: faTimes,
                        optionType: OpinionOptionType.DisagreeConsensus,
                    },
                    {
                        content: _(msg`This statement should be reformulated.`),
                        icon: faTimes,
                        optionType: OpinionOptionType.Wrong,
                    },
                ];
            case `${OutcomeType.Consensus}-compact`:
                return [
                    {
                        content: _(msg`Agree`),
                        icon: faCheck,
                        optionType: OpinionOptionType.AgreeConsensus,
                    },
                    {
                        content: _(msg`Disagree`),
                        icon: faTimes,
                        optionType: OpinionOptionType.DisagreeConsensus,
                    },
                    {
                        content: _(msg`Pass`),
                        icon: faTimes,
                        optionType: OpinionOptionType.Wrong,
                    },
                ];
        }

        return [];
    }, [type,variant, _]);
    
    const hasOpinionOptions = (opinionOptions.length > 0);

    if (!outcome) {
        return null;
    }

    return (
        <motion.div
            layoutId={outcomeId}
            className="py-4 gap-4 flex flex-col items-start"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Pill icon={statementSolid} className="border-black">{title}</Pill>
            <ReactMarkdown>{content}</ReactMarkdown>
            {hasOpinionOptions && (
                <div className={classNames("flex gap-2 w-full flex-wrap", variant === "compact" && "flex-row", variant === "spacious" && "flex-col", variant === "spacious" && "flex-col" )}>
                    {opinionOptions.map((option) => {
                        const { content, icon, optionType } = option;
                        const isSelected = (existingOpinion?.option_type === optionType);
                        const isDisabled = isGivingOpinion || (timeoutCompleted && DISABLE_OPINION_INPUT_WHEN_TIMED_OUT);
                        const onOptionClick = () => {
                            setOpinion({
                                subjectId: outcomeId,
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
                                className="flex-1"
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


