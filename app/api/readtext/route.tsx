import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });

// Map roles to ElevenLabs voice IDs
const roleVoiceMap: Record<string, string> = {
    "villain": "NLst3tTLU2aW9Q87S3M1", // Deep voice for villain
    "narrator": "fATgBRI8wg5KkDFg8vBd", // Neutral voice for narrato
    "neighbour": "pFZP5JQG7iQjIQuC4Bku"
};

export async function POST(req: NextRequest) {
    const { text, role = "default" } = await req.json();

    // Get voice ID based on role
    const voiceId = roleVoiceMap[role.toLowerCase()] || roleVoiceMap["narrator"];

    try {
        if (!text || text.trim() === "") {
            return NextResponse.json(
                { error: "Failed to convert text to speech" },
                { status: 500 }
            );
        }

        const audio = await elevenlabs.textToSpeech.convert(voiceId, {
            text: text,
            modelId: "eleven_flash_v2_5",
        });

        // Convert the readable stream to buffer
        const chunks: Uint8Array[] = [];
        const reader = (audio as any).getReader?.() || (audio as any)[Symbol.asyncIterator];

        if (reader && reader.read) {
            // ReadableStreamDefaultReader
            let chunk = await reader.read();
            while (!chunk.done) {
                chunks.push(chunk.value);
                chunk = await reader.read();
            }
        } else if (reader && reader[Symbol.asyncIterator]) {
            // Async iterator
            for await (const chunk of reader) {
                chunks.push(chunk);
            }
        }

        const buffer = Buffer.concat(chunks);
        const base64Audio = buffer.toString("base64");
        const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

        return NextResponse.json({ audio_url: audioDataUrl });
    } catch (error) {
        console.error("Error converting text to speech:", error);
        return NextResponse.json(
            { error: "Failed to convert text to speech" },
            { status: 500 }
        );
    }
}