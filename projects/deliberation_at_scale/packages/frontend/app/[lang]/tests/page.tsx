"use client";

import { NavLink } from "@/components/NavLink";
import { i18n } from '@lingui/core';
import { Trans } from '@lingui/macro';

import ColouredHeader from "@/components/ColouredHeader";

export default function Index() {
    return (
        <div className="w-full flex flex-col items-center text-foreground">
            <ColouredHeader />
            <Trans>Landing page</Trans>
            <h2>{i18n.locale}</h2>
            <NavLink href="/login">Go to login</NavLink>
            <NavLink href="/tests/rooms">Go to Room Tester</NavLink>
            <NavLink href="/tests/messages">Go to Message Tester</NavLink>
            <NavLink href="/tests/lobby">Go to lobby Tester</NavLink>
        </div>
    );
}
