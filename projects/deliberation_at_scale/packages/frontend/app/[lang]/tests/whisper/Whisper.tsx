'use client';
import useTranscribe from '@/hooks/useTranscribe';

export default function Whipser() {
    const { transcript, startRecording, pauseRecording, resetRecordings} = useTranscribe();

    return (
        <div>
            <button onClick={startRecording}>START</button>
            <button onClick={pauseRecording}>STOP</button>
            <button onClick={resetRecordings}>RESET</button>
            <p>{transcript.text}</p>
        </div>
    );
}
