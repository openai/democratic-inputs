"use client";

import { NavLink } from "@/components/NavLink";

export default function Index() {
    return (
        <div className="w-full flex flex-col items-center text-foreground">
            LANDING

            <NavLink href="/tests/rooms">Go to Room Tester</NavLink>
            <NavLink href="/tests/messages">Go to Message Tester</NavLink>
        </div>
    );
}
