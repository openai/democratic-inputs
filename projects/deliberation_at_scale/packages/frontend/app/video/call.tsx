import { useLocalMedia } from '@/hooks/useLocalMedia';
import { VideoView, useRoomConnection } from '@whereby.com/browser-sdk';

const ROOM_URL = "https://deliberation-at-scale.whereby.com/test-small-fe4e9a23-b20e-4d8d-b455-3512bb162943";

export default function Call() {
    const localMedia = useLocalMedia();
    const { state, actions } = useRoomConnection(ROOM_URL, {
        displayName: 'TEST',
        localMediaConstraints: { audio: true, video: true, },
        localMedia,
        logger: console,
    });

    const { localParticipant, remoteParticipants, roomConnectionStatus } = state; 

    return (
        <div>
            {roomConnectionStatus === "connecting" && <span>Connecting...</span>}
            {roomConnectionStatus === "room_locked" && (
                <div style={{ color: "red" }}>
                    <span>Room locked, please knock....</span>
                    <button onClick={() => actions.knock()}>Knock</button>
                </div>
            )}
            {roomConnectionStatus === "knocking" && <span>Knocking...</span>}
            {roomConnectionStatus === "rejected" && <span>Rejected :(</span>}
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