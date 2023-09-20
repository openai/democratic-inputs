"use client";
import { ChatFlowConfig } from "@/flows/types";
import ChatFlow from "./index";
import { DEFAULT_BOT_MESSAGE_SPEED_MS } from "@/utilities/constants";

export default function EvaluateChatFlow() {
    // TODO: dynamically generate this flow based on the discussion that was done
    const evaluateFlow: ChatFlowConfig = {
        id: 'evaluate',
        steps: [
            {
                name: "intro",
                messageOptions: [["Hi there {nickName}! I hope you enjoyed the discussion you had with the group."]],
                timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
            },
            {
                name: "review_intro",
                messageOptions: [["Let's review what you all discussed. What we're your general impressions?"]],
                timeoutMs: DEFAULT_BOT_MESSAGE_SPEED_MS,
                quickReplies: [
                    {
                        id: "review_great",
                        content: "It was great!",
                        onClick: () => {
                            console.log("Great!");
                        }
                    },
                    {
                        id: "review_okay",
                        content: "It was okay.",
                        onClick: () => {
                            console.log("Okay!");
                        }
                    },
                    {
                        id: "review_bad",
                        content: "It was bad.",
                        onClick: () => {
                            console.log("Bad!");
                        }
                    },
                ],
            },
        ],
    };

    return (
        <ChatFlow flow={evaluateFlow}/>
    );
}
