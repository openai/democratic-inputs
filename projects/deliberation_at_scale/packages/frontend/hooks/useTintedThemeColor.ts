import { AUTHENTICATE_ROOM_BASE_COLOR, DELIBERATION_ROOM_BASE_COLOR, DEFAULT_ROOM_BASE_COLOR } from "@/utilities/constants";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface Options {
    classNamePrefix: string;
    baseColor?: string;
    tint?: number;
}

export default function useColorClassName(options?: Options) {
    const pathname = usePathname();
    const inferredBaseColor = useMemo(() => {

        // TODO: better way to do this? Bit harder due to translations in URL
        if (pathname?.includes('/login') || pathname?.includes('/register')) {
            return AUTHENTICATE_ROOM_BASE_COLOR;
        }

        if (pathname?.includes('/lobby') || pathname?.includes('/evaluate') || pathname?.includes('/profile')) {
            return DEFAULT_ROOM_BASE_COLOR;
        }

        if (pathname?.includes('/room')) {
            return DELIBERATION_ROOM_BASE_COLOR;
        }

        // home page
        return DELIBERATION_ROOM_BASE_COLOR;
    }, [pathname]);

    const {
        classNamePrefix = "bg",
        baseColor = inferredBaseColor,
        tint = 300,
    } = options ?? {};
    const className = `${classNamePrefix}-${baseColor}-${tint}`;

    return className;
}
