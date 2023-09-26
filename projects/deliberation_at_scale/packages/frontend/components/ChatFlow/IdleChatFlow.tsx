"use client";
import ChatFlow from "./index";
import idleFlow from "@/flows/idleFlow";

export default function ProfileChatFlow() {
    return (
        <ChatFlow flow={idleFlow}/>
    );
}
