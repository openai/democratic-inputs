'use client';
import { useRoomConnection } from '@/components/RoomConnection/context';
import { useLocalMedia } from '@/hooks/useLocalMedia';

export default function Room() {
    const localMedia = useLocalMedia();
    const connection = useRoomConnection();

    if (!connection) {
        return null;
    }

    const { roomConnectionStatus, localParticipant, remoteParticipants } = connection.state;
    const { VideoView } = connection.components;


    return (
        <div>
            {roomConnectionStatus === "connecting" && <span>Connecting...</span>}
            {roomConnectionStatus === "connected" && (
                <>
                    <div className="container">
                        {[localParticipant, ...remoteParticipants].map((participant, i) => (
                            <div className="participantWrapper" key={participant?.id || i}>
                                {participant ? (
                                    <>
                                        <div>
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