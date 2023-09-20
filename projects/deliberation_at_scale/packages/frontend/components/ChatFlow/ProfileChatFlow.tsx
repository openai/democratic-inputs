"use client";
import ChatFlow from "./index";
import profileFlow from "@/flows/profileFlow";

export default function ProfileChatFlow() {
    return (
        <ChatFlow flow={profileFlow}/>
    );
}
