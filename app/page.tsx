"use client";
import { useState, useRef, useEffect } from "react";
import VoiceRecorder from "./components/voiceRecorder";
export default function Home() {
  const [story, setStory] = useState("The adventure begins...");
  const [choices, setChoices] = useState<string[]>(["Start journey", "Wait here"]);
  const [history, setHistory] = useState("");
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioURL && audioRef.current) audioRef.current.play();
  }, [audioURL]);

  const handleRecordingComplete = async (blob: Blob) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", blob, "recording.wav");
    const sttRes = await fetch("/api/transcribe", { method: "POST", body: formData });
    const { text: transcript } = await sttRes.json();
    const claudeRes = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: transcript && transcript?.length > 0 ? transcript : "", history }),
    });
    const claudeData = await claudeRes.json();

    setStory(claudeData.story);
    setChoices(claudeData.choices || []);
    setHistory((prev) => prev + "\nPlayer: " + transcript + "\nAI: " + claudeData.story);

    // const ttsRes = await fetch("/api/readtext", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ text: claudeData.story, role: "narrator" }),
    // });
    // const ttsData = await ttsRes.json();
    // setAudioURL(ttsData.audio_url);
    setIsLoading(false);
  };
  const onRestartGame = () => {
    setStory("The adventure begins...");
    setChoices(["Start journey", "Wait here"]);
    setHistory("");
    setAudioURL(null);
  }
  return (
    <div className="min-h-screen p-3 sm:p-6 text-white flex flex-col items-center" style={{ backgroundImage: "url('gameBG.png')", fontFamily: "'Space Mono', 'Courier New', monospace" }}>
      <h1 className="text-2xl sm:text-3xl font-bold mt-6 sm:mt-8 mb-1">You, the Hero</h1>
      <small className="text-center text-yellow-200 mb-4 text-xs sm:text-sm">
        {isLoading ? "Story is progressing..." : "Let Claude and ElevenLabs narrate this epic adventure..."}
      </small>
      <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-6xl mt-6 sm:mt-8 px-2 sm:px-0">

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="w-full sm:flex-1 h-40 sm:h-48 p-3 sm:p-4 overflow-y-auto text-yellow-200 font-bold text-sm" style={{ backgroundColor: "rgba(40, 40, 40, 0.5)", border: "6px sm:border-8 solid #2a2a2a", borderRadius: "0", boxShadow: "inset 0 0 10px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.6)" }}>{story}</div>
          <div className="w-full sm:flex-1 h-40 sm:h-48 p-3 sm:p-4 overflow-y-auto font-bold text-sm" style={{ backgroundColor: "rgba(40, 40, 40, 0.5)", border: "6px sm:border-8 solid #2a2a2a", borderRadius: "0", boxShadow: "inset 0 0 10px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.6)" }}>
            {choices.map((choice, i) => {
              const colors = ["text-red-400", "text-blue-400", "text-green-400", "text-yellow-400", "text-purple-400", "text-pink-400"];
              const color = colors[i % colors.length];
              return (
                <div key={i} className={`${color} mb-2 text-xs sm:text-sm`}>
                  [{i + 1}]: {choice}
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-full p-2 sm:p-3 text-xs sm:text-sm text-yellow-200 font-bold" style={{ backgroundColor: "rgba(45, 45, 45, 0.5)", border: "4px sm:border-6 solid #2a2a2a", borderRadius: "0", boxShadow: "inset 0 0 8px rgba(0,0,0,0.6)" }}>
          Rules: Click {`"Record"`} and speak your action. The story evolves based on your decisions. Click {`"Restart Game"`} to start over.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center mt-6 sm:mt-8">
        <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        <button
          onClick={onRestartGame}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 font-bold text-white uppercase hover:brightness-110 transition-all cursor-pointer active:scale-95 text-sm sm:text-base"
          style={{ backgroundColor: "rgba(40, 40, 40, 0.5)", border: "4px sm:border-6 solid #2a2a2a", borderRadius: "0", boxShadow: "inset 0 0 8px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.6)" }}>Restart Game</button>
      </div>
      <audio ref={audioRef} src={audioURL || undefined} style={{ display: "none" }} />
    </div>
  );
}