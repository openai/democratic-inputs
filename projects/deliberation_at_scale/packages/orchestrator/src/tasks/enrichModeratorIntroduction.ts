import { ModeratorTaskTuple, sendHardCodedEnrichMessage } from "../utilities/tasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { Helpers } from "graphile-worker";

export default async function enrichModeratorIntroduction(payload: BaseProgressionWorkerTaskPayload, helpers: Helpers): Promise<ModeratorTaskTuple> {
    const contentOptions = [
        `
        Hello everyone!
        I'm here to moderate our conversation.
        Before we delve into our discussion, let's take a brief moment for introductions.
        May I suggest saying hi to eachother briefly?
        `,
        `
        Greetings to all!
        I'm your moderator for today's conversation.
        Before we get started, let's take a moment for everyone to introduce themselves.
        I'd suggest a quick introduction from each participant.
        `,
        `
        Hello everyone!
        I'm here to moderate our conversation today.
        Before we get started, let's take a brief moment for everyone to introduce themselves.
        I'd appreciate a quick intro from each participant. Let's begin!
        `,
        `
        Greetings everyone!
        I'm your conversation moderator for today.
        Before we get started, let's take a quick moment for everyone to introduce themselves.
        I'd suggest a quick introduction from each participant.
        `,
        `
        Greetings to all!
        I'm the moderator for today's conversation.
        Before we get started, let's take a brief moment for everyone to introduce themselves.
        May I suggest saying hi to eachother briefly?
        `,
    ];

    const { moderation } = await sendHardCodedEnrichMessage({
        contentOptions,
        ...payload,
        helpers
    });

    return {
        moderation,
    };
}
