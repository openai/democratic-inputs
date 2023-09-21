"use client";
import ChatFlow from "./index";
import lobbyFlow from "@/flows/lobbyFlow";

export default function LobbyChatFlow() {
    return (
        <ChatFlow flow={lobbyFlow}/>
    );
}
