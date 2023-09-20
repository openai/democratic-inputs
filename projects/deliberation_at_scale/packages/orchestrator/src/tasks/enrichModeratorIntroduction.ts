import { sendBotMessage } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { Helpers } from "graphile-worker";
import { draw } from "radash";

export default async function enrichModeratorIntroduction(payload: BaseProgressionWorkerTaskPayload, helpers: Helpers) {
    const { roomId } = payload;
   
    const contentOptions = [
        `
        Hello everyone!
        I'm ChatGPT, here to moderate our conversation.
        Before we delve into our discussion, let's take a brief moment for introductions.
        Could each of you please provide a quick 20-second intro?
        `,
        `
        Greetings to all!
        I'm ChatGPT, your moderator for today's conversation.
        Before we get started, let's take a moment for everyone to introduce themselves.
        I'd suggest a quick 20-second introduction from each participant.
        `,
        `
        Hello everyone!
        I'm ChatGPT, here to moderate our conversation today.
        Before we get started, let's take a brief moment for everyone to introduce themselves.
        I'd appreciate if each participant could give a quick 20-second intro. Let's begin!
        `,
        `
        Greetings everyone!
        I'm ChatGPT, your conversation moderator for today.
        Before we get started, let's take a quick moment for everyone to introduce themselves.
        I'd suggest a concise 20-second introduction from each participant.
        `,
        `
        Greetings to all!
        I'm ChatGPT, the moderator for today's conversation.
        Before we get started, let's take a brief moment for everyone to introduce themselves.
        May I suggest a quick 20-second intro from each participant?
        `,
    ];

    const selectedContent = draw(contentOptions);

    if (!selectedContent) {
        helpers.logger.error(``);
        return;
    }

    sendBotMessage({
        content: selectedContent,
        roomId,
    });
}
