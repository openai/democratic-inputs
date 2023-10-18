'use client';
import { motion } from 'framer-motion';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import ReactMarkdown from 'react-markdown';
import { msg } from "@lingui/macro";

import { statementSolid } from "./EntityIcons";
import Pill from "./Pill";
import { FullOutcomeFragment, OpinionOptionType, OpinionType, OutcomeType, FullParticipantFragment } from '@/generated/graphql';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useMemo, useState } from 'react';
import Button from './Button';
import { DISABLE_OPINION_INPUT_WHEN_TIMED_OUT, OUTCOME_OPINION_TIMEOUT_MS_LOOKUP } from '@/utilities/constants';
import TimeProgressBar from './TimeProgressBar';
import useGiveOpinion from '@/hooks/useGiveOpinion';
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
    participants?: FullParticipantFragment[]
    variant?: "compact" | "spacious"
}

export default function RoomOutcome(props: Props) {
    const { _ } = useLingui();
    const { outcome, participantId, participants, variant } = props;
    const { id: outcomeId, content = '', type } = outcome ?? {};
    const { setOpinion, getExistingOpinion, getGroupOpinions } = useGiveOpinion({ subjects: [outcome], participantId });
    const [selectedOpinionOptionType, setSelectedOpinionOptionType] = useState<OpinionOptionType | undefined | null>();
    const existingOpinion = getExistingOpinion(outcomeId);
    const groupOpinions = getGroupOpinions(outcomeId);
    const [timeoutCompleted, setTimeoutCompleted] = useState(false);
    const title = useMemo(() => {
        switch (type) {
            case OutcomeType.Consensus: return _(msg`Consensus Proposal`);
            case OutcomeType.Milestone: return _(msg`Milestone`);
            case OutcomeType.OffTopic: return _(msg`Off Topic`);
            case OutcomeType.CrossPollination: return _(msg`Statement`);
            case OutcomeType.SeedStatement: return _(msg`Statement`);
            default: return _(msg`Statement`);
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
            case OutcomeType.CrossPollination:
            case OutcomeType.SeedStatement:
            default:
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

    }, [type, _]);
    const hasOpinionOptions = (opinionOptions.length > 0);
    const formattedContent = content?.trim();

    // handle updates from the database which should reset the optimistic selected option
    useEffect(() => {
        if (existingOpinion && existingOpinion.option_type === selectedOpinionOptionType) {
            setSelectedOpinionOptionType(null);
        }
    }, [existingOpinion, selectedOpinionOptionType]);

    if (!outcome) {
        return null;
    }

    return (
        <motion.div
            layoutId={outcomeId}
            className="gap-2 md:gap-4 flex flex-col items-start"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Pill icon={statementSolid} className="border-black hidden md:inline-flex">{title}</Pill>
            <span className="md:hidden font-bold">{title}:</span>
            <ReactMarkdown>{formattedContent}</ReactMarkdown>
            {hasOpinionOptions && (
                <div className={classNames(
                    "flex gap-1 md:gap-2 w-full flex-wrap",
                    variant === "compact" && "flex-row",
                    variant === "spacious" && "flex-col",
                    variant === "spacious" && "flex-col"
                )}>
                    {opinionOptions.map((option) => {
                        const { content, icon, optionType } = option;
                        const isSelected = (existingOpinion?.option_type === optionType && !selectedOpinionOptionType) || selectedOpinionOptionType === optionType;
                        const isDisabled = (timeoutCompleted && DISABLE_OPINION_INPUT_WHEN_TIMED_OUT);
                        const participantAmount = participants?.length ?? 0;
                        const otherOptionOpinions = groupOpinions.filter((opinion) => opinion.option_type === optionType && opinion.participant_id != participantId);
                        const progress = (participantAmount > 0) ? ((otherOptionOpinions.length + (isSelected ? 1 : 0)) / participantAmount) : 0;
                        const onOptionClick = () => {
                            setSelectedOpinionOptionType(optionType);
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
                                progress={progress}
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


