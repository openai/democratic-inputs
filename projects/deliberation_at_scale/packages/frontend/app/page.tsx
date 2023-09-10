"use client";

import { NavLink } from "@/components/NavLink";

export default function Index() {
    return (
        <div className="w-full flex flex-col items-center text-foreground">
            LANDING

            <NavLink href="/room-tester">Go to Room Tester</NavLink>
            <NavLink href="/message-tester">Go to Message Tester</NavLink>
        </div>
    );
}
