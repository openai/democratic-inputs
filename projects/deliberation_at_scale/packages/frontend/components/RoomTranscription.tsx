'use client';
import { useLocalMedia } from "@/hooks/useLocalMedia";
import useTranscribe from "@/hooks/useTranscribe";
import { useEffect } from "react";

export default function RoomTranscription() {
    const { state } = useLocalMedia();
    const { isAudioEnabled } = state;
    const { pauseRecording, startRecording } = useTranscribe({
        whisperOptions: {
            removeSilence: true,
        },
    });

    useEffect(() => {
        if (isAudioEnabled) {
            startRecording();
        } else {
            pauseRecording();
        }
    }, [isAudioEnabled, pauseRecording, startRecording]);

    return null;
}
