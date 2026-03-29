"use client";
import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";

interface VoiceRecorderProps {
    onRecordingComplete: (blob: Blob) => void;
    isAudioPlaying?: boolean;
}

export interface VoiceRecorderHandle {
    stop: () => void;
}

const VoiceRecorder = forwardRef<VoiceRecorderHandle, VoiceRecorderProps>(
    ({ onRecordingComplete, isAudioPlaying = false }, ref) => {
        const [recording, setRecording] = useState(false);
        const [isPlayingMusic, setIsPlayingMusic] = useState(false);

        const mediaRecorderRef = useRef<MediaRecorder | null>(null);
        const audioChunksRef = useRef<Blob[]>([]);
        const musicRef = useRef<HTMLAudioElement | null>(null);

        const MAX_VOLUME = 0.05;
        const FADE_STEP = 0.005;
        const FADE_INTERVAL = 100;

        useEffect(() => {
            if (!musicRef.current) return;
            const audio = musicRef.current;

            if (recording) {
                audio.pause();
            } else {
                if (audio.paused) audio.play().catch(() => { });
                let vol = audio.volume;
                const interval = setInterval(() => {
                    if (vol >= MAX_VOLUME) clearInterval(interval);
                    vol += FADE_STEP;
                    audio.volume = Math.min(vol, MAX_VOLUME);
                }, FADE_INTERVAL);
            }
        }, [recording]);

        useImperativeHandle(ref, () => ({
            stop: () => stopRecording(),
        }));

        const startRecording = async () => {
            if (isAudioPlaying) return;
            setRecording(true);
            audioChunksRef.current = [];
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    noiseSuppression: true,
                    echoCancellation: true,
                    autoGainControl: true,
                }
            });
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
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.requestData();
                mediaRecorderRef.current.stop();
                // Stop all audio tracks
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        };
        // Toggle music manually
        const toggleMusic = () => {
            if (!musicRef.current) return;
            const audio = musicRef.current;

            if (isPlayingMusic) {
                // Fade out and pause
                let vol = audio.volume;
                const interval = setInterval(() => {
                    if (vol <= 0.001) {
                        clearInterval(interval);
                        audio.pause();
                    }
                    vol -= FADE_STEP;
                    audio.volume = Math.max(vol, 0);
                }, FADE_INTERVAL);

                setIsPlayingMusic(false);
            } else {
                // Fade in tiny volume
                audio.volume = 0;
                audio.play();
                let vol = 0;
                const interval = setInterval(() => {
                    if (vol >= MAX_VOLUME) clearInterval(interval);
                    vol += FADE_STEP;
                    audio.volume = Math.min(vol, MAX_VOLUME);
                }, FADE_INTERVAL);

                setIsPlayingMusic(true);
            }
        };

        return (
            <div title={isAudioPlaying ? "Wait for narration to finish before recording" : ""}>
                {!recording ? (
                    <button
                        onClick={startRecording}
                        disabled={isAudioPlaying}
                        className={`px-6 py-3 font-bold text-white uppercase transition-all flex items-center gap-2 ${isAudioPlaying
                            ? "cursor-not-allowed opacity-50"
                            : "hover:brightness-110 cursor-pointer active:scale-95"
                            }`}
                        style={{ backgroundColor: "rgba(40, 40, 40, 0.5)", borderRadius: "0", boxShadow: "inset 0 0 8px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.6)" }}
                        title={isAudioPlaying ? "Wait for narration to finish before recording" : ""}
                    >
                        🎤 Record
                    </button>
                ) : (
                    <button onClick={stopRecording} className="px-6 py-3 font-bold text-white uppercase hover:brightness-110 transition-all cursor-pointer active:scale-95 flex items-center gap-2" style={{ backgroundColor: "rgba(40, 40, 40, 0.5)", borderRadius: "0", boxShadow: "inset 0 0 8px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.6)" }}>⏸️ Stop</button>
                )}
                <button
                    onClick={toggleMusic}
                    className="fixed top-4 right-4 px-3 py-2 font-bold text-white uppercase hover:brightness-110 transition-all cursor-pointer active:scale-95 text-sm sm:text-base"
                    style={{ backgroundColor: "rgba(40, 40, 40, 0.5)", border: "4px sm:border-6 solid #2a2a2a", borderRadius: "0", boxShadow: "inset 0 0 8px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.6)" }}
                >
                    {isPlayingMusic ? "Pause Music" : "Play Music"}
                </button>
                <audio ref={musicRef} src="backgroundMusic.mp3" loop style={{ display: "none" }} />
            </div>
        );
    }
);

VoiceRecorder.displayName = "VoiceRecorder";
export default VoiceRecorder;