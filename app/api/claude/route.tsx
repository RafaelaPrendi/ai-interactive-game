import { NextRequest, NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
    try {
        const { transcript, history } = await req.json();
        console.log("Received transcript:", transcript);
        // Return default response if no transcript provided
        if (!transcript || transcript.trim() === "") {
            return NextResponse.json({
                story: "The adventure begins...",
                choices: ["Start your journey", "Wait and listen"]
            });
        }

        const prompt = `
    You are the narrator of a fantasy adventure game.
    Keep the paragraphs concise and engaging, and always provide 2-3 clear choices for the player to pick from.
    The story should adapt based on the player's choices and previous story history.
    Keep paraghraphs to 2 sentences and choices to 2-3 options.
    Keep descriptions vivid but concise, and make sure the choices are distinct and interesting.
    Keep descriptions short.
    Always respond **ONLY with JSON** in this exact format:

    {
    "story": "<your story text>",
    "choices": ["Choice 1", "Choice 2"]
    }

    Do not include any explanation outside the JSON.
    Player said: "${transcript}"
    Story so far: "${history || "The adventure begins."}"

    Respond with JSON only in this exact format:
    { "story": "<story text>", "choices": ["Choice 1", "Choice 2"] }`;

        const response = await claude.messages.create({
            model: "claude-opus-4-6",
            max_tokens: 500,
            temperature: 0.7,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        let parsed;
        try {
            const content = response.content[0];
            if (content.type === "text") {
                let raw = content.text;
                raw = raw.replace(/```json\s*|```/g, "").trim();
                parsed = JSON.parse(raw);
            } else {
                parsed = { story: "Unable to generate story", choices: ["Try again", "Continue"] };
            }
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            const content = response.content[0];
            const text = content.type === "text" ? content.text : "Unable to generate story";
            parsed = { story: text, choices: ["Try again", "Continue"] };
        }
        return NextResponse.json(parsed);
    } catch (error) {
        console.error("Claude API error:", error);
        return NextResponse.json(
            { story: "An error occurred. Please try again.", choices: ["Retry", "Start over"] },
            { status: 200 }
        );
    }
}