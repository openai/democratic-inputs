"use client";
import ChatFlow from "./index";
import loginFlow from "@/flows/loginFlow";

export default function LoginChatFlow() {
    return (
        <ChatFlow flow={loginFlow}/>
    );
}
