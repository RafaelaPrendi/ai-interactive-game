import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as Blob;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Send to ElevenLabs Speech-to-Text
        const transcription = await elevenlabs.speechToText.convert({
            file,
            modelId: "scribe_v2",
            tagAudioEvents: false,
            languageCode: "eng",
            diarize: false,
        });

        return NextResponse.json({
            text: transcription.text,
            full: transcription, // optional: return full metadata
        });
    } catch (error) {
        console.error("Transcription error:", error);
        return NextResponse.json(
            { error: "Failed to transcribe audio" },
            { status: 500 }
        );
    }
}