import { DEFAULT_LANGUAGE, ENABLE_FORCE_LANGUAGE, FORCED_LANGUAGE } from "@/utilities/constants";
import { useParams } from "next/navigation";

export function useLanguage() {
    const params = useParams();
    const language = ENABLE_FORCE_LANGUAGE ? FORCED_LANGUAGE : params?.lang ?? DEFAULT_LANGUAGE;

    return language;
}
