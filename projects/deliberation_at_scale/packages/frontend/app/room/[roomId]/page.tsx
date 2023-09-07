'use client';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import { NEXT_PUBLIC_WHEREBY_SUBDOMAIN } from '@/utilities/constants';
import { useRoomConnection } from '@whereby.com/browser-sdk';
import { useMemo } from 'react';

export default function Room({ params }: { params: { roomId: string }}) {
    const roomUrl = useMemo(() => (
        `https://${NEXT_PUBLIC_WHEREBY_SUBDOMAIN}/${params.roomId}`
    ), [params.roomId]);

    const localMedia = useLocalMedia();
    const { state, components: { VideoView } } = useRoomConnection(roomUrl, {
        displayName: 'TEST',
        localMediaConstraints: { audio: true, video: true, },
        localMedia,
        logger: console,
    });

    const { localParticipant, remoteParticipants, roomConnectionStatus } = state; 

    return (
        <div>
            {roomConnectionStatus === "connecting" && <span>Connecting...</span>}
            {/* {roomConnectionStatus === "room_locked" && (
                <div style={{ color: "red" }}>
                    <span>Room locked, please knock....</span>
                    <button onClick={() => actions.knock()}>Knock</button>
                </div>
            )}
            {roomConnectionStatus === "knocking" && <span>Knocking...</span>}
            {roomConnectionStatus === "rejected" && <span>Rejected :(</span>} */}
            {roomConnectionStatus === "connected" && (
                <>
                    <div className="container">
                        {[localParticipant, ...remoteParticipants].map((participant, i) => (
                            <div className="participantWrapper" key={participant?.id || i}>
                                {participant ? (
                                    <>
                                        <div
                                            className="bouncingball"
                                            style={{
                                                animationDelay: `1000ms`,
                                                ...(participant.isAudioEnabled
                                                    ? {
                                                        border: "2px solid grey",
                                                    }
                                                    : null),
                                                ...(!participant.isVideoEnabled
                                                    ? {
                                                        backgroundColor: "green",
                                                    }
                                                    : null),
                                            }}
                                        >
                                            {participant.stream && participant.isVideoEnabled && (
                                                <VideoView
                                                    muted={participant.isLocalParticipant}
                                                    stream={participant.stream}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            )}
                                        </div>
                                        <div className="displayName">{participant.displayName || "Guest"}</div>
                                    </>
                                ) : null}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-2">
                        <button
                            className="bg-white shadow rounded py-3 px-4"
                            onClick={() => localMedia.actions.toggleCameraEnabled()}
                        >
                            {localMedia.state.isVideoEnabled ? 'Disable' : 'Enable'} camera
                        </button>
                        <button
                            className="bg-white shadow rounded py-3 px-4"
                            onClick={() => localMedia.actions.toggleMicrophoneEnabled()}
                        >
                            {localMedia.state.isAudioEnabled ? 'Disable' : 'Enable'} microphone
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}