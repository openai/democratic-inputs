"use client";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/macro";

import { ChatFlowConfig, OnInputHelpers } from "@/types/flows";
import ChatFlow from "./index";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";
import { useCallback, useMemo } from "react";
import useRoom from "@/hooks/useRoom";
import { OpinionOptionType, OpinionType, OutcomeType } from "@/generated/graphql";
import useGiveOpinion, { SetOpinionOptions } from "@/hooks/useGiveOpinion";

export default function EvaluateChatFlow() {
    const { _ } = useLingui();
    const { outcomes, participantId, getOutcomeByType, hasOutcomeType } = useRoom();
    const { setOpinion } = useGiveOpinion({ subjects: outcomes, participantId });
    const handleOpinionClick = useCallback(async (helpers: OnInputHelpers, outcomeType: OutcomeType.OverallImpression, options: Omit<SetOpinionOptions, 'subjectId'>) => {
        const outcome = getOutcomeByType(outcomeType);
        const { id: outcomeId } = outcome ?? {};

        await setOpinion({
            ...options,
            subjectId: outcomeId,
        });
        helpers.goToNext();
    }, [getOutcomeByType, setOpinion]);
    const evaluateFlow = useMemo(() => {
        return {
            id: 'evaluate',
            steps: [
                {
                    name: "intro",
                    messageOptions: [[_(msg`Hi [nickName]! Hopefully you enjoyed the conversation you had with the group.`)]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
                {
                    name: "thank_you_1",
                    messageOptions: [[_(msg`What do you want to do next?`)]],
                    quickReplies: [
                        {
                            hidden: () => true,
                            id: "go_to_feedback",
                            content: _(msg`Share your feedback`),
                            onClick: (helpers) => {
                                helpers.goToPage("/profile");
                            }
                        },
                        {
                            id: "join_another_room",
                            content: _(msg`Join another conversation`),
                            onClick: (helpers) => {
                                helpers.goToPage("/lobby");
                            }
                        },
                        {
                            id: "go_to_profile",
                            content: _(msg`Go back to the profile page`),
                            onClick: (helpers) => {
                                helpers.goToPage("/profile");
                            }
                        },
                    ],
                },
                {
                    active: hasOutcomeType(OutcomeType.OverallImpression),
                    name: "overall_impression",
                    messageOptions: [[_(msg`What was your general impression of the conversation?`)]],
                    quickReplies: [
                        {
                            id: "review_great",
                            content: _(msg`It was great!`),
                            onClick: async (helpers) => {
                                await handleOpinionClick(helpers, OutcomeType.OverallImpression, {
                                    type: OpinionType.Option,
                                    optionType: OpinionOptionType.Positive,
                                });
                            }
                        },
                        {
                            id: "review_okay",
                            content: _(msg`It was okay.`),
                            onClick: async (helpers) => {
                                await handleOpinionClick(helpers, OutcomeType.OverallImpression, {
                                    type: OpinionType.Option,
                                    optionType: OpinionOptionType.Neutral,
                                });
                            }
                        },
                        {
                            id: "review_bad",
                            content: _(msg`It was bad.`),
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
                    messageOptions: [[_(msg`Thanks for the feedback [nickName]!`)]],
                    timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                },
            ],
        } satisfies ChatFlowConfig;
    }, [handleOpinionClick, hasOutcomeType, _]);

    return (
        <ChatFlow flow={evaluateFlow}/>
    );
}
