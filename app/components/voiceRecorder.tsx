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
                <button onClick={startRecording} className="px-6 py-3 font-bold text-white uppercase hover:brightness-110 transition-all cursor-pointer active:scale-95" style={{ backgroundColor: "rgba(102, 102, 102, 0.6)", background: "linear-gradient(135deg, rgba(119,119,119,0.6) 0%, rgba(85,85,85,0.6) 50%, rgba(68,68,68,0.6) 100%)", border: "6px solid #2a2a2a", borderRadius: "0", boxShadow: "inset 0 0 8px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.5)" }}>Record</button>
            ) : (
                <button onClick={stopRecording} className="px-6 py-3 font-bold text-white uppercase hover:brightness-110 transition-all cursor-pointer active:scale-95" style={{ backgroundColor: "rgba(102, 102, 102, 0.6)", background: "linear-gradient(135deg, rgba(119,119,119,0.6) 0%, rgba(85,85,85,0.6) 50%, rgba(68,68,68,0.6) 100%)", border: "6px solid #2a2a2a", borderRadius: "0", boxShadow: "inset 0 0 8px rgba(255,255,255,0.1), 0 4px 8px rgba(0,0,0,0.5)" }}>Stop</button>
            )}
        </div>
    );
}