"use client";
import useProfile from "@/hooks/useProfile";
import useLobby from "@/hooks/useLobby";
import { ParticipantStatusType } from "@/generated/graphql";


export default function Index() {
    const { user } = useProfile();
    const { participant, loading: participantLoading, transferToRoom } = useLobby(user?.id);

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-4xl justify-between items-center p-3 text-sm text-foreground">
                <h1>Lobby</h1>
                <p>welcome {user?.nick_name}</p>
                <br></br>
                <h2>Waiting to join discussion</h2>
                {
                    participantLoading ? (<p>LOADING</p>) :
                        <p>{JSON.stringify(participant, null, 4)}</p>
                }
                {
                    participant?.status == ParticipantStatusType.WaitingForConfirmation ?
                        <button onClick={async () => {
                            // transfer to room
                            await transferToRoom();
                        }}>
                            Join room
                        </button>
                        :
                        null
                }
            </div>
        </div >
    );

}
