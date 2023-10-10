import { ModeratorTaskTuple, sendHardCodedEnrichMessage } from "../utilities/tasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { Helpers } from "graphile-worker";

export default async function enrichModeratorIntroduction(payload: BaseProgressionWorkerTaskPayload, helpers: Helpers): Promise<ModeratorTaskTuple> {
    const contentOptions = [
        `
        Hello everyone!
        I'm here to moderate our conversation.
        Before we dive right into it, let's take a brief moment for introductions.
        May I suggest saying hi to eachother briefly?
        After a minute, I'll come back to you and introduce the topic for today.
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
