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
                messageOptions: [["Let's review what you all discussed. What was your general impression?"]],
                quickReplies: [
                    {
                        id: "review_great",
                        content: "It was great!",
                        onClick: (helpers) => {
                            helpers.goToNext();
                        }
                    },
                    {
                        id: "review_okay",
                        content: "It was okay.",
                        onClick: (helpers) => {
                            helpers.goToNext();
                        }
                    },
                    {
                        id: "review_bad",
                        content: "It was bad.",
                        onClick: (helpers) => {
                            helpers.goToNext();
                        }
                    },
                ],
            },
            {
                name: "thank_you_1",
                messageOptions: [["Thanks for the feedback {nickName}! What do you want to do next?"]],
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
    };

    return (
        <ChatFlow flow={evaluateFlow}/>
    );
}
