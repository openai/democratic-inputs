import { sendMagicLink } from "@/utilities/supabase";
import { FlowStep } from "./types";

export const askForEmailStep: FlowStep = {
    name: "ask_for_email_address",
    messageOptions: [["Will you please enter your e-mail address?"]],
    onInput: async (input, helpers) => {
        const { content } = input;
        const isEmailAddress = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(content);

        helpers.postUserMessages([[content]]);
        await helpers.waitFor(1000);

        // guard: regex to check if a string is just numbers
        if(!isEmailAddress) {
            helpers.postBotMessages([["That is not a valid email address!"]]);
            return;
        }

        helpers.postBotMessages([["That looks like a valid e-mail. We're sending you an email now..."]]);
        try {
            await sendMagicLink(content, (typeof helpers.params?.lang === 'string') ? helpers.params.lang : undefined);
        } catch (error) {
            helpers.postBotMessages([["There was an error sending you an email. Please try again!"]]);

            // dont clear the chat input field!
            return false;
        }
        helpers.goToNext?.();
        return;
    },
};
