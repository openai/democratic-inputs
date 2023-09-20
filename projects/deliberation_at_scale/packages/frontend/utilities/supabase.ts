import { supabaseClient } from "@/state/supabase";
import { isEmpty } from "radash";

export const sendMagicLink = async (email: string) => {
    const formattedEmail = email.trim();

    // guard: skip when email invalid
    if (isEmpty(formattedEmail)) {
        return new Error("The email address is invalid.");
    }

    const result = await supabaseClient.auth.signInWithOtp({
        email,
    });
    const hasError = !!result.error;

    if (hasError) {
        throw new Error(result.error.message);
    }
};
