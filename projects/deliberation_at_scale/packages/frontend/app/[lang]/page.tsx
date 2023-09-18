"use client";

import { NavLink } from "@/components/NavLink";
import { i18n } from '@lingui/core';
import { Trans } from '@lingui/macro';

import Flow from "@/components/Flow";
import joinFlow from "@/flows/join";

export default function Index() {
    return (
        <div className="w-full flex flex-col items-center text-foreground">
            <Trans>Landing page</Trans>
            <h2>{i18n.locale}</h2>

            <NavLink href="/tests/rooms">Go to Room Tester</NavLink>
            <NavLink href="/tests/messages">Go to Message Tester</NavLink>
            <NavLink href="/tests/lobby">Go to lobby Tester</NavLink>
            <Flow flow={joinFlow}/>
        </div>
    );
}
