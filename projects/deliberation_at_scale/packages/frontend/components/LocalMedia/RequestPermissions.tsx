'use client';
import VideoView from '@/components/VideoView';
import { useLocalMedia } from '@/hooks/useLocalMedia';

interface Props {
    request: boolean;
}

export default function RequestPermissions(props: Props) {
    const { request } = props;
    const { state, actions } = useLocalMedia({ request, redirect: false });

    if (!request) {
        return null;
    }

    return (
        <div className='max-w-[500px] w-full mx-auto absolute top-0 left-0 right-0 my-8 p-4 bg-white shadow-lg rounded-lg z-20'>
            <div className="relative aspect-video w-full bg-gray-100 rounded overflow-hidden">
                {state?.localStream && <VideoView muted stream={state?.localStream} className="w-full h-full object-cover" />}
                <div className="absolute left-0 right-0 bottom-0 backdrop-blur-lg p-2 flex justify-center gap-4 bg-gray-800/90 text-white">
                    <span>{state?.isVideoEnabled ? '✅' : '🚫'} Camera</span>
                    <span>{state?.isAudioEnabled ? '✅' : '🚫'} Microphone</span>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
                <button
                    className="bg-white shadow rounded py-3 px-4"
                    onClick={() => actions?.toggleCameraEnabled()}
                >
                    {state?.isVideoEnabled ? 'Disable' : 'Enable'} camera
                </button>
                <button
                    className="bg-white shadow rounded py-3 px-4"
                    onClick={() => actions?.toggleMicrophoneEnabled()}
                >
                    {state?.isAudioEnabled ? 'Disable' : 'Enable'} microphone
                </button>
            </div>
        </div>
    );
}
