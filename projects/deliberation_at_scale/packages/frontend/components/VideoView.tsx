import { debounce } from 'radash';
import { useEffect, useRef } from "react";

interface VideoViewSelfProps {
    stream: MediaStream;
    muted?: boolean;
    style?: React.CSSProperties;
    onResize?: ({ width, height, stream }: { width: number; height: number; stream: MediaStream }) => void;
}

type VideoViewProps = VideoViewSelfProps &
    React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;

export default function VideoView({ muted, stream, onResize, ...rest }: VideoViewProps) {
    const videoEl = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoEl.current || !onResize) {
            return;
        }

        const resizeObserver = new ResizeObserver(
            debounce(
                { delay: 1000 },
                () => {
                    if (videoEl.current && stream?.id) {
                        onResize({
                            width: videoEl.current.clientWidth,
                            height: videoEl.current.clientHeight,
                            stream,
                        });
                    }
                },
            )
        );

        resizeObserver.observe(videoEl.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [stream, onResize]);

    useEffect(() => {
        if (!videoEl.current) {
            return;
        }

        if (videoEl.current.srcObject !== stream) {
            videoEl.current.srcObject = stream;
        }

        // Handle muting programatically, not as video attribute
        // https://stackoverflow.com/questions/14111917/html5-video-muted-but-still-playing
        if (videoEl.current.muted !== muted) {
            videoEl.current.muted = Boolean(muted);
        }
    }, [muted, stream, videoEl]);

    return <video ref={videoEl} autoPlay playsInline {...rest} />;
}
