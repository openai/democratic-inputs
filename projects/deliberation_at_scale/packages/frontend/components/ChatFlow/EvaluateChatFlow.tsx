"use client";
import { ChatFlowConfig, OnInputHelpers } from "@/flows/types";
import ChatFlow from "./index";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { useCallback, useMemo } from "react";
import useRoom from "@/hooks/useRoom";
import { OpinionOptionType, OpinionType, OutcomeType } from "@/generated/graphql";
import useUpsertOpinion, { SetOpinionOptions } from "@/hooks/useUpsertOpinion";

export default function EvaluateChatFlow() {
    const { outcomes, participantId } = useRoom();
    const { setOpinion } = useUpsertOpinion({ outcomes, participantId });
    const getOutcomeByType = useCallback((type: OutcomeType) => {
        const outcome = outcomes?.find((outcome) => {
            return outcome.type === type;
        });

        return outcome;
    }, [outcomes]);
    const hasOutcomeType = useCallback((type: OutcomeType) => {
        return !!getOutcomeByType(type);
    }, [getOutcomeByType]);
    const handleOpinionClick = useCallback(async (helpers: OnInputHelpers, outcomeType: OutcomeType.OverallImpression, options: Omit<SetOpinionOptions, 'outcomeId'>) => {
        const outcome = getOutcomeByType(outcomeType);
        const { id: outcomeId } = outcome ?? {};

        await setOpinion({
            outcomeId,
            ...options,
        });
        helpers.goToNext();
    }, [getOutcomeByType, setOpinion]);

    const evaluateFlow = useMemo(() => {
        return {
            id: 'evaluate',
            steps: [
                {
                    name: "intro",
                    messageOptions: [["Hi there {nickName}! I hope you enjoyed the discussion you had with the group."]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    active: hasOutcomeType(OutcomeType.OverallImpression),
                    name: "overall_impression",
                    messageOptions: [["Let's review what you all discussed. What was your general impression?"]],
                    quickReplies: [
                        {
                            id: "review_great",
                            content: "It was great!",
                            onClick: async (helpers) => {
                                await handleOpinionClick(helpers, OutcomeType.OverallImpression, {
                                    type: OpinionType.Option,
                                    optionType: OpinionOptionType.Positive,
                                });
                            }
                        },
                        {
                            id: "review_okay",
                            content: "It was okay.",
                            onClick: async (helpers) => {
                                await handleOpinionClick(helpers, OutcomeType.OverallImpression, {
                                    type: OpinionType.Option,
                                    optionType: OpinionOptionType.Neutral,
                                });
                            }
                        },
                        {
                            id: "review_bad",
                            content: "It was bad.",
                            onClick: async (helpers) => {
                                await handleOpinionClick(helpers, OutcomeType.OverallImpression, {
                                    type: OpinionType.Option,
                                    optionType: OpinionOptionType.Negative,
                                });
                            }
                        },
                    ],
                },
                {
                    active: hasOutcomeType(OutcomeType.OverallImpression),
                    name: "overall_impression_thanks",
                    messageOptions: [["Thanks for the feedback {nickName}!"]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "thank_you_1",
                    messageOptions: [["What do you want to do next?"]],
                    quickReplies: [
                        {
                            id: "join_another_room",
                            content: "Join another room",
                            onClick: (helpers) => {
                                helpers.goToPage("/lobby");
                            }
                        },
                        {
                            id: "go_to_profile",
                            content: "Go back to the home page",
                            onClick: (helpers) => {
                                helpers.goToPage("/profile");
                            }
                        },
                    ],
                },
            ],
        } satisfies ChatFlowConfig;
    }, [hasOutcomeType]);

    return (
        <ChatFlow flow={evaluateFlow}/>
    );
}
