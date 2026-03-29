import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });

// Map roles to ElevenLabs voice IDs
const roleVoiceMap: Record<string, string> = {
    "hero": "21m00Tcm4TlvDq8ikWAM", // Default voice for hero
    "villain": "cgSgspJ2msm4xlv1Fj0K", // Deep voice for villain
    "narrator": "EXAVITQu4vr4xnSDxMaL", // Neutral voice for narrator
    "ally": "TxGEqnHWrfWFTfGW9XjX", // Friendly voice for ally
    "default": "21m00Tcm4TlvDq8ikWAM", // Fallback voice
};

export async function POST(req: NextRequest) {
    const { text, role = "default" } = await req.json();

    // Get voice ID based on role
    const voiceId = roleVoiceMap[role.toLowerCase()] || roleVoiceMap["default"];

    try {
        const audio = await elevenlabs.textToSpeech.convert(voiceId, {
            text: text,
        });

        return NextResponse.json({ audio_url: audio });
    } catch (error) {
        console.error("Error converting text to speech:", error);
        return NextResponse.json(
            { error: "Failed to convert text to speech" },
            { status: 500 }
        );
    }
}