'use client';
import { useLocalMedia } from "@/hooks/useLocalMedia";
import useTranscribe from "@/hooks/useTranscribe";
import { ENABLE_TRANSCRIPTION } from "@/utilities/constants";
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
        if (!ENABLE_TRANSCRIPTION) {
            return;
        }

        if (isAudioEnabled) {
            startRecording();
        } else {
            pauseRecording();
        }
    }, [isAudioEnabled, pauseRecording, startRecording]);

    return null;
}
