'use client';
import VideoView from '@/components/VideoView';
import { useLocalMedia } from '@/hooks/useLocalMedia';
import useTheme, { ThemeColors } from '@/hooks/useTheme';
import { faMicrophoneAlt, faMicrophoneAltSlash, faSpinner, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

const bgColorMap: Record<ThemeColors, string> = {
    'blue': 'text-blue-400 bg-blue-800/50',
    'green': 'text-green-400 bg-green-800/50',
    'orange': 'text-orange-400 bg-orange-800/50',
};

interface Props {
    request: boolean;
}

export default function RequestPermissions(props: Props) {
    const { request } = props;
    const { state, actions } = useLocalMedia({ request, redirect: false });
    const theme = useTheme();

    if (!request) {
        return null;
    }

    return (
        <div className='max-w-[500px] w-full mx-auto absolute top-0 left-0 right-0 my-8 z-20 px-4'>
            <div className="relative aspect-video w-full bg-gray-100 overflow-hidden shadow-xl rounded-lg">
                {state?.localStream ? (
                    <VideoView muted stream={state?.localStream} className="w-full h-full object-cover" />
                ) : (
                    <div className="border w-full h-full text-gray-300 text-4xl flex items-center justify-center">
                        <FontAwesomeIcon icon={faSpinner} spin />
                    </div>
                )}
                {/* <div className="absolute left-0 right-0 bottom-0 backdrop-blur-lg p-2 flex justify-center gap-4 bg-gray-800/90 text-white">
                    <span>{state?.isVideoEnabled ? '✅' : '🚫'} Camera</span>
                    <span>{state?.isAudioEnabled ? '✅' : '🚫'} Microphone</span>
                </div> */}
            </div>
            <div className="absolute bottom-[-36px] left-0 right-0 flex justify-center gap-2 p-3 text-xl">
                <button
                    className={classNames(
                        "w-12 rounded-lg aspect-square flex justify-center items-center backdrop-blur-lg border-none bg-gray-600/50",
                        state?.isAudioEnabled
                            ? bgColorMap[theme]
                            : 'text-gray-400 bg-gray-600/50',
                    )}
                    onClick={() => actions?.toggleMicrophoneEnabled()}
                >
                    <FontAwesomeIcon
                        icon={state?.isAudioEnabled ? faMicrophoneAlt : faMicrophoneAltSlash} 
                        fixedWidth 
                    />
                </button>
                <button
                    className={classNames(
                        "w-12 rounded-lg aspect-square flex justify-center items-center backdrop-blur-lg border-none",
                        state?.isVideoEnabled
                            ? bgColorMap[theme]
                            : 'text-gray-400 bg-gray-600/50',
                    )}
                    onClick={() => actions?.toggleCameraEnabled()}
                >
                    <FontAwesomeIcon
                        icon={state?.isVideoEnabled ? faVideo : faVideoSlash} 
                        fixedWidth 
                    />
                </button>
            </div>
            {/* <div className="mt-4 flex items-center justify-center gap-2">
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
            </div> */}
        </div>
    );
}
