'use client';
import { useRoomConnection } from '@/components/RoomConnection/context';
import { useLocalMedia } from '@/hooks/useLocalMedia';

export default function Participants() {
    const connection = useRoomConnection();
    const localMedia = useLocalMedia();

    if (!connection) {
        return null;
    }

    const { remoteParticipants, localParticipant } = connection.state;
    const { VideoView } = connection.components;

    return (
        <div>
            {remoteParticipants.map((participant) => participant && (
                <div key={participant.id} className="aspect-video relative">
                    {participant.stream && (
                        <VideoView
                            stream={participant.stream}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    )}
                    <div className="absolute left-2 bottom-2 backdrop-blur-lg p-2 flex justify-center rounded gap-4 bg-gray-800/90 text-white">
                        <span>{participant.displayName || 'Guest'}</span>
                    </div>
                </div>
            ))}
            <div className="flex justify-center gap-2 relative">
                {localParticipant?.stream && (
                    <VideoView
                        muted
                        stream={localParticipant.stream}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                )}
                <div className="absolute left-2 bottom-2 backdrop-blur-lg p-2 flex justify-center rounded gap-4 bg-gray-800/90 text-white">
                    <span>{localParticipant?.displayName || 'You'}</span>
                </div>
            </div>
            <div>
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
        </div>
    );
}