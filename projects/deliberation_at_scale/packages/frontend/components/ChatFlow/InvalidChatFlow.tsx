"use client";
import ChatFlow from "./index";
import invalidFlow from "@/flows/invalidFlow";

export default function InvalidChatFlow() {
    return (
        <ChatFlow flow={invalidFlow}/>
    );
}
