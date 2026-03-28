""
import React, { useState, useRef } from "react";

interface VoiceRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        setRecording(true);
        audioChunksRef.current = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                onRecordingComplete(blob); // send blob to parent
            };

            mediaRecorderRef.current.start();
        } catch (err) {
            console.error("Microphone access denied:", err);
        }
    };

    const stopRecording = () => {
        setRecording(false);
        mediaRecorderRef.current?.stop();
    };

    return (
        <div>
            {!recording ? (
                <button
                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
                    onClick={startRecording}
                >
                    Start
                </button>


            ) : (
                <button
                    className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded"
                    onClick={stopRecording}
                >
                    Pause
                </button>

            )}
        </div>
    );
};

export default VoiceRecorder;