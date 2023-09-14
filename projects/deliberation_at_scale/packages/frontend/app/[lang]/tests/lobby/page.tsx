"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useGetTopicsQuery, useStartRoomMutation } from "@/generated/graphql";
import useProfile from "@/hooks/useProfile";
import { useAppDispatch } from "@/state/store";
import { joinRoom } from "@/state/slices/room";
import useLobby from "@/hooks/useLobby";


export default function Index() {
    const { user, rooms } = useProfile();
    const {participant, loading: participantLoading} = useLobby(user?.id);

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-4xl justify-between items-center p-3 text-sm text-foreground">
                <h1>Lobby</h1>
                <p>welcome {user?.nick_name}</p>
                <br></br>
                <h2>Waiting to join discussion</h2>
                {
                    participantLoading ? (<p>LOADING</p>) : 
                    <p>{JSON.stringify(participant,null,4)}</p>
                }
            </div>
        </div >
    );

}
