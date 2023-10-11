import { DEFAULT_LANGUAGE } from "@/utilities/constants";
import { useParams } from "next/navigation";

export function useLanguage() {
    const params = useParams();
    const language = params?.lang ?? DEFAULT_LANGUAGE;

    return language;
}
