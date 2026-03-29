"use client";
import { useState, useRef } from "react";

interface VoiceRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
}

export default function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        setRecording(true);
        audioChunksRef.current = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
            onRecordingComplete(blob);
        };

        mediaRecorderRef.current.start();
    };

    const stopRecording = () => {
        setRecording(false);
        mediaRecorderRef.current?.stop();
    };

    return (
        <div>
            {!recording ? (
                <button onClick={startRecording} className="px-6 py-3 font-bold text-white uppercase hover:brightness-110 transition-all cursor-pointer active:scale-95" style={{ backgroundColor: "rgba(40, 40, 40, 0.5)", border: "6px solid #2a2a2a", borderRadius: "0", boxShadow: "inset 0 0 8px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.6)" }}>Record</button>
            ) : (
                <button onClick={stopRecording} className="px-6 py-3 font-bold text-white uppercase hover:brightness-110 transition-all cursor-pointer active:scale-95" style={{ backgroundColor: "rgba(40, 40, 40, 0.5)", border: "6px solid #2a2a2a", borderRadius: "0", boxShadow: "inset 0 0 8px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.6)" }}>Stop</button>
            )}
        </div>
    );
}