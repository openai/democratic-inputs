import { supabaseClient } from "@/state/supabase";
import { isEmpty } from "radash";
import { DEFAULT_LANGUAGE, NEXT_PUBLIC_SIGN_IN_ANONYMOUS_API_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from "./constants";
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sendMagicLink = async (email: string, lang = DEFAULT_LANGUAGE) => {
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

export const getAnonymousLoginLink = async(identifier: string) => {
    const body = {
        identifier,
    };
    const options = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
    };
    const response = await axios.post(
        NEXT_PUBLIC_SIGN_IN_ANONYMOUS_API_URL,
        body,
        options
    );
    const data = response.data;
    const { loginLink } = data;

    return {
        loginLink,
    };
};
