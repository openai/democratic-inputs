"use client";
import registerFlow from "@/flows/registerFlow";
import ChatFlow from "./index";

export default function RegisterChatFlow() {
    return (
        <ChatFlow flow={registerFlow}/>
    );
}
