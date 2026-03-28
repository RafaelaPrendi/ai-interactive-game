"use client";

import { useState, useRef, useEffect } from "react";
import VoiceRecorder from "./components/voiceRecorder";
import { sendRecording } from "./lib/utils";

type Choice = string;

export default function Home() {
  const [story, setStory] = useState<string>(""); // AI narration
  const [choices, setChoices] = useState<Choice[]>([]); // current choices
  const [history, setHistory] = useState<string>(""); // full story history
  const [gameRunning, setGameRunning] = useState<boolean>(false);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>(""); // STT transcript from recording

  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!audioURL) return;

    if (typeof window !== "undefined") {
      const audio = new Audio(audioURL);
      audio.play();
    }
  }, [audioURL]);

  // Function to start or resume game
  const startGame = () => {
    setGameRunning(true);
    setStory("The story begins... Make your first choice!");
    setChoices(["Explore the forest", "Enter the cave", "Return home"]);
  };

  // Pause audio and game
  const pauseGame = () => {
    setGameRunning(false);
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
  };

  // Stop game completely
  const stopGame = () => {
    setGameRunning(false);
    setStory("");
    setChoices([]);
    setHistory("");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioPlaying(false);
    }
  };

  // Handle choice click
  const handleChoice = async (choice: Choice) => {
    if (!gameRunning) return;

    const response = await fetch("http://localhost:8000/api/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice, history }),
    });

    const data = await response.json();

    // Update story and history
    setStory(data.story);
    setHistory((prev) => prev + "\n" + choice + "\n" + data.story);

    // Extract choices from story if formatted with CHOICES:
    const splitChoices = data.story.split("CHOICES:")[1];
    if (splitChoices) {
      const newChoices = splitChoices
        .split("\n")
        .map((line: string) => line.replace(/^\d+\.\s*/, "").trim())
        .filter((line: string) => line !== "");
      setChoices(newChoices);
    } else {
      setChoices([]);
    }

    // Play audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = data.audio_url;
      audioRef.current.play();
      setAudioPlaying(true);
    }
  };
  //////////////
  const handleRecordingComplete = async (blob: Blob) => {
    console.log("Recording complete, sending to STT...");
    const formData = new FormData();
    formData.append("file", blob, "recording.wav");

    const res = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setStory((prev) => prev + "\n\n[You said]: " + data.text); // show transcript in story box
    setTranscript(data.text); // save transcript for sending to Claude
    console.log("Transcript:", data.text);

    // 👉 THIS is what you send to Claude next
  };

  return (
    <div className="min-h-screen text-white p-6 flex flex-col items-center justify-start gap-6"

      style={{ backgroundImage: "url('./gameBG.png')" }}
    >
      <h1 className="text-3xl font-bold mb-4">AI Voice Story Game</h1>

      {/* Story Box */}
      <div className="w-full max-w-2xl h-48 p-4 bg-gray-800 rounded-lg overflow-y-auto">
        <h2 className="font-semibold mb-2">Narrator:</h2>
        <p className="whitespace-pre-line">{story}</p>
      </div>

      {/* Choices Box */}
      <div className="w-full max-w-2xl h-32 p-4 bg-gray-700 rounded-lg overflow-y-auto flex flex-col gap-2">
        <h2 className="font-semibold mb-2">Choices:</h2>
        {choices.length > 0 ? (
          choices.map((choice, idx) => (
            <button
              key={idx}
              className="bg-blue-600 hover:bg-blue-500 rounded px-4 py-2 text-white"
              onClick={() => handleChoice(choice)}
            >
              {choice}
            </button>
          ))
        ) : (
          <p className="italic">No choices available yet...</p>
        )}
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} />

      {/* Control Buttons */}
      <div className="flex gap-4 mt-4">
        <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        <button
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded"
          onClick={stopGame}
        >
          End Game
        </button>
      </div>

      {/* Optional: show audio status */}
      <div className="mt-2 text-gray-400">
        <p>Audio: {audioPlaying ? "Playing" : "Paused"}</p>

        {audioURL && (
          <div style={{ marginTop: "20px" }}>
            <audio controls src={audioURL}></audio>
          </div>
        )}
      </div>
    </div>
  );
}