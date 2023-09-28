import { supabaseClient } from "@/state/supabase";
import { isEmpty } from "radash";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sendMagicLink = async (email: string, lang = 'en') => {
    const formattedEmail = email.trim();

    // guard: skip when email invalid
    if (isEmpty(formattedEmail)) {
        return new Error("The email address is invalid.");
    }

    const result = await supabaseClient.auth.signInWithOtp({
        email,
        // TODO: Fix `useAuth` hook returning unauthenticated when a link
        // contains an OTP code
        // options: { emailRedirectTo: `${window.location.origin}/${lang}/profile` },
    });
    const hasError = !!result.error;

    if (hasError) {
        throw new Error(result.error.message);
    }
};
