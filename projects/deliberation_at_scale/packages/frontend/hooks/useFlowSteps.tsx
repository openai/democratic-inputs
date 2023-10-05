import { FlowStep } from "../types/flows";
import { useMemo } from "react";
import { useLingui } from "@lingui/react";
import { sendMagicLink } from "@/utilities/supabase";

export default function useFlowSteps() {
    const { _ } = useLingui();
    const askForEmailStep = useMemo(() => {
        return {
            name: "ask_for_email_address",
            messageOptions: [[_(`Will you please enter your e-mail address below?`)]],
            onInput: async (input, helpers) => {
                const { content } = input;
                // eslint-disable-next-line no-useless-escape
                const isEmailAddress = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(content);

                helpers.postUserMessages([[content]]);
                await helpers.waitFor(1000);

                // guard: regex to check if a string is just numbers
                if(!isEmailAddress) {
                    helpers.postBotMessages([[_(`That is not a valid email address!`)]]);
                    return false;
                }

                helpers.postBotMessages([[_(`That looks like a valid e-mail. We're sending you an email now...`)]]);
                try {
                    const lang = helpers.params?.lang;
                    await sendMagicLink(content, (typeof lang === 'string') ? lang : undefined);
                } catch (error) {
                    helpers.postBotMessages([[_(`There was an error sending you an email. Please try again!`)]]);

                    // dont clear the chat input field!
                    return false;
                }
                helpers.goToNext?.();
                return;
            },
        } satisfies FlowStep;
    }, [_]);

    return {
        askForEmailStep,
    };
}
