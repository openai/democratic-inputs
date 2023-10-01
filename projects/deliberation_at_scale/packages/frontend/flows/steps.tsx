import { t } from "@lingui/macro";

import { sendMagicLink } from "@/utilities/supabase";
import { FlowStep } from "./types";

export const askForEmailStep: FlowStep = {
    name: "ask_for_email_address",
    messageOptions: [[t`Will you please enter your e-mail address below?`]],
    onInput: async (input, helpers) => {
        const { content } = input;
        // eslint-disable-next-line no-useless-escape
        const isEmailAddress = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(content);

        helpers.postUserMessages([[content]]);
        await helpers.waitFor(1000);

        // guard: regex to check if a string is just numbers
        if(!isEmailAddress) {
            helpers.postBotMessages([[t`That is not a valid email address!`]]);
            return false;
        }

        helpers.postBotMessages([[t`That looks like a valid e-mail. We're sending you an email now...`]]);
        try {
            const lang = helpers.params?.lang;
            await sendMagicLink(content, (typeof lang === 'string') ? lang : undefined);
        } catch (error) {
            helpers.postBotMessages([[t`There was an error sending you an email. Please try again!`]]);

            // dont clear the chat input field!
            return false;
        }
        helpers.goToNext?.();
        return;
    },
};
