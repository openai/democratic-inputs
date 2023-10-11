import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useLanguage } from "./useLanguage";

export default function useLocalizedPush() {
    const { push } = useRouter();
    const language = useLanguage();
    const localizedPush = useCallback((path: string) => {
        push(`/${language}/${path}`);
    }, [push, language]);

    return {
        push: localizedPush,
    };
}
