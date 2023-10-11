'use client';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';

import { useWhisper } from "@/hooks/useWhisper";
import { DEFAULT_TRANSCRIPTION_CHUNK_DURATION_MS, DEFAULT_TRANSCRIPTION_TIME_SLICE_MS, ENABLE_AUTO_START_TRANSCRIPTION, NEXT_PUBLIC_TRANSCRIBE_API_URL, ONE_SECOND_MS } from '@/utilities/constants';
import { UseWhisperConfig, UseWhisperTranscript } from './useWhisper/types';
import useRoom from './useRoom';
import useProfile from './useProfile';

interface UseTranscribeOptions {
    whisperOptions?: UseWhisperConfig;
    chunkDurationMs?: number;
}

export default function useTranscribe(options?: UseTranscribeOptions) {
    const { whisperOptions, chunkDurationMs = DEFAULT_TRANSCRIPTION_CHUNK_DURATION_MS } = options ?? {};
    const { roomId, participantId } = useRoom();
    const { authSession } = useProfile();
    const [chunkStartTime, setChunkStartTime] = useState<Dayjs>(dayjs());
    const onTranscribe = useRef<(blob: Blob) => Promise<UseWhisperTranscript> | undefined>();
    const { transcript, startRecording, pauseRecording, resetRecordings } = useWhisper({
        streaming: true,
        autoStart: ENABLE_AUTO_START_TRANSCRIPTION,
        removeSilence: true,
        timeSlice: DEFAULT_TRANSCRIPTION_TIME_SLICE_MS,
        ...whisperOptions,
        onTranscribe: (blob: Blob) => {
            const emptyResult = new Promise<UseWhisperTranscript>((resolve) => {
                resolve({
                    blob,
                    text: '',
                });
            });

            return onTranscribe.current?.(blob) ?? emptyResult;
        },
    });

    // handle automatic chunking
    useEffect(() => {

        // disable chunking if chunkDurationMs is not set
        if (!chunkDurationMs) {
            return;
        }

        const chunkInterval = setInterval(() => {
            setChunkStartTime(dayjs());
            resetRecordings();
        }, chunkDurationMs);

        return () => {
            clearInterval(chunkInterval);
        };
    }, [chunkDurationMs, resetRecordings, setChunkStartTime]);

    // handle changes to the callback depending on variables
    useEffect(() => {
        onTranscribe.current = async (blob: Blob) => {
            const base64Content = await new Promise<string | ArrayBuffer | null>(
                (resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                }
            );
            const accessToken = authSession?.access_token;

            // guard: check if all required variables are present
            if (!accessToken || !roomId || !participantId || !chunkStartTime) {
                return {
                    blob,
                    text: '',
                };
            }

            const body = {
                content: base64Content,
                roomId,
                participantId,
                chunkStartTime: chunkStartTime.toISOString(),
            };
            const options = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            };

            const response = await axios.post(
                NEXT_PUBLIC_TRANSCRIBE_API_URL,
                body,
                options
            );
            const {
                text = '',
                error
            } = await response.data;

            if (error) {
                // eslint-disable-next-line no-console
                console.error(`An error occurred while transcribing:`, error);
            }

            return {
                blob,
                text,
            };
        };
    }, [roomId, participantId, authSession, chunkStartTime]);

    return {
        transcript,
        startRecording,
        pauseRecording,
        resetRecordings,
    };
}
