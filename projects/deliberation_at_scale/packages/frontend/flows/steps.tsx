import { sendMagicLink } from "@/utilities/supabase";
import { FlowStep } from "./types";

export const askForEmailStep: FlowStep = {
    name: "ask_for_email_address",
    messageOptions: [["Can you give me your email address?"]],
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

        helpers.postBotMessages([["Sending you an email..."]]);
        try {
            await sendMagicLink(content);
        } catch (error) {
            helpers.postBotMessages([["There was an error sending you an email. Please try again!"]]);
            return;
        }
        helpers.goToNext?.();
        return;
    },
};
