'use client';
import { useRoomConnection } from '@/components/RoomConnection/context';
import classNames from 'classnames';

export interface ParticipantsProps {
    variant: 'compact' | 'spacious';
}

export default function RoomParticipants({ variant }: ParticipantsProps) {
    const connection = useRoomConnection();

    if (!connection) {
        return null;
    }

    const { remoteParticipants, localParticipant } = connection.state;
    const { VideoView } = connection.components;

    return (
        <div className="max-h-[50vh] overflow-hidden relative pb-2 mb-4">
            <div
                className={classNames(
                    "flex",
                    variant === 'compact' && 'aspect-[16/9] bg-gray-100 rounded overflow-hidden border',
                    variant === 'spacious' && 'h-[50vh] relative',
                )}
            >
                {remoteParticipants.map((participant, i) => participant && (
                    <div
                        key={participant.id}
                        className={classNames(
                            'flex-grow flex-shrink min-w-0',
                            variant === 'compact' && 'relative',
                            variant === 'spacious' && 'aspect-square rounded overflow-hidden bg-gray-100 w-[52%] absolute border',
                            i === 0 && variant === 'spacious' && 'right-0 top-0 z-10',
                            i === 1 && variant === 'spacious' && 'left-0 bottom-0',
                        )}
                    >
                        {participant.stream && (
                            <VideoView
                                stream={participant.stream}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        )}
                        <div
                            className={classNames(
                                `absolute bottom-2 backdrop-blur-lg p-2 flex justify-center rounded gap-4 bg-gray-800/90 text-white z-20`,
                                variant === 'spacious' && 'left-2',
                                i === 0 && variant === 'compact' && 'left-2',
                                i > 0 && variant === 'compact' && 'right-2',
                            )}
                        >
                            <span>{participant.displayName || 'Guest'}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div
                className={classNames(
                    "flex justify-center gap-2 absolute w-1/5 bottom-0 absolute rounded overflow-hidden bg-gray-100 z-20",
                    variant === 'compact' && 'aspect-[3/4] left-1/2 translate-x-[-50%]',
                    variant === 'spacious' && 'aspect-square right-2 border',
                )}
            >
                {localParticipant?.stream && (
                    <VideoView
                        muted
                        stream={localParticipant.stream}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                )}
            </div>
            {/* <div>
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
            </div> */}
        </div>
    );
}
