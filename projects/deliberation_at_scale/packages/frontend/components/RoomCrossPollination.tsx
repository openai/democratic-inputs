'use client';
import { motion } from 'framer-motion';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import ReactMarkdown from 'react-markdown';
import { msg } from "@lingui/macro";

import { statementSolid } from "./EntityIcons";
import Pill from "./Pill";
import { CrossPollinationType, FullCrossPollinationFragment, OpinionOptionType, OpinionType } from '@/generated/graphql';
import { faCheck, faQuestion, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useMemo } from 'react';
import Button from './Button';
import useUpsertOpinion from '@/hooks/useUpsertOpinion';
import { useLingui } from '@lingui/react';

export interface OpinionOption {
    content: string;
    icon: IconProp;
    optionType: OpinionOptionType;
}

interface Props {
    crossPollination?: FullCrossPollinationFragment;
    participantId?: string;
}

export default function RoomCrossPollination(props: Props) {
    const { _ } = useLingui();
    const { crossPollination, participantId } = props;
    const { id: crossPollinationId, type } = crossPollination ?? {};
    const { isGivingOpinion, setOpinion, getExistingOpinion } = useUpsertOpinion({ subjects: [crossPollination], participantId });
    const existingOpinion = getExistingOpinion(crossPollinationId);
    const outcome = crossPollination?.outcome;
    const topic = crossPollination?.topic;
    const title = useMemo(() => {
        switch (type) {
            case CrossPollinationType.Outcome: return _(msg`Enticing Statement`);
            case CrossPollinationType.Topic: return _(msg`New Topic`);
        }
    }, [type, _]);
    const content = useMemo(() => {
        switch (type) {
            case CrossPollinationType.Outcome: return outcome?.content;
            case CrossPollinationType.Topic: return topic?.content;
        }
    }, [outcome, topic, type]);
    const opinionOptions = useMemo(() => {
        switch (type) {
            case CrossPollinationType.Topic:
                return [
                    {
                        content: _(msg`Great new topic!`),
                        icon: faCheck,
                        optionType: OpinionOptionType.Positive,
                    },
                    {
                        content: _(msg`Not sure what to think...`),
                        icon: faQuestion,
                        optionType: OpinionOptionType.Neutral,
                    },
                    {
                        content: _(msg`No thanks!`),
                        icon: faTimes,
                        optionType: OpinionOptionType.Negative,
                    },
                ];
            case CrossPollinationType.Outcome:
                return [
                    {
                        content: _(msg`I agree with the statement!`),
                        icon: faCheck,
                        optionType: OpinionOptionType.Agree,
                    },
                    {
                        content: _(msg`I'm not sure what to think...`),
                        icon: faQuestion,
                        optionType: OpinionOptionType.Neutral,
                    },
                    {
                        content: _(msg`I don't agree with this.`),
                        icon: faTimes,
                        optionType: OpinionOptionType.Disagree,
                    },
                ];
        }

        return [];
    }, [type, _]);
    const hasOpinionOptions = (opinionOptions.length > 0);

    if (!crossPollination || !content) {
        return null;
    }

    return (
        <motion.div
            layoutId={crossPollinationId}
            className="py-4 gap-4 flex flex-col items-start"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Pill icon={statementSolid} className="border-black">{title}</Pill>
            <ReactMarkdown>{content}</ReactMarkdown>
            {hasOpinionOptions && (
                <div className="flex flex-col gap-2 w-full">
                    {opinionOptions.map((option) => {
                        const { content, icon, optionType } = option;
                        const isSelected = (existingOpinion?.option_type === optionType);
                        const isDisabled = isGivingOpinion;
                        const onOptionClick = () => {
                            setOpinion({
                                subjectId: crossPollinationId,
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
        </motion.div>
    );
}


