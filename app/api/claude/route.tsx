import { NextRequest, NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: NextRequest) {
    try {
        const { transcript, history } = await req.json();
        console.log("Received transcript:", transcript, history);
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
    This story has a dark fantasy tone, with ethical dilemas and morally gray characters.
    There are 4 character roles.
    The hero is the player's character.
    The villain is the main antagonist.
    The neighbor is a helpful character that provides guidance and assistance.
    The narrator describes the world and events.
    The soulmate is the hero's love interest and partner, who has been kidnapped by the villain.
    The neighbour only talks at the beginning of the story to provide exposition and guidance, and then may reappear later to provide assistance or information, but should not be a constant presence in the story.
    The soulmate only talks when they are rescued or before death scene, and should not be a constant presence in the story.
    The start of the story is: Hero returns to their village from war, to find his house burned down and their soulmate missing. The village is eerily quiet, and the hero must decide what to do next.
    Their soulmate is the hero's love interest and partner, who has been kidnapped by the villain.
    The hero's main goal is to find and rescue their soulmate, but they will face many challenges and moral dilemmas along the way.
    Absolutely nothing in the story should be gratuitous or explicit, but the tone should be dark and mature.
    If the player uses profanity, respond with a stern reprimand from the narrator and do not advance the story until they provide a valid input.
    If the player provides an invalid choice, respond with a prompt to choose a valid option and do not advance the story until they provide a valid input.
    If the player provides a choice that doesn't make sense in the context of the story, respond with a prompt to choose a valid option and do not advance the story until they provide a valid input.
    if the player provides a choice that is too similar to a previous choice, respond with a prompt to choose a more distinct option and do not advance the story until they provide a valid input.
    if the player provides a choice that is too similar to the previous story events, respond with a prompt to choose a more distinct option and do not advance the story until they provide a valid input.
    You will not give choices that are too similar to each other or to previous story events.
    The game ends when the hero successfully rescues their soulmate, or if they make a choice that leads to their demise.
    The game ends if the hero decides to give up the search for their soulmate and live a quiet life, but this is considered a "bad" ending.
    The game ends if the hero decides to seek revenge on the villain instead of rescuing their soulmate, but this is considered a "bad" ending.
    The game should have multiple branching paths and endings based on the player's choices, and the story should adapt dynamically to create a unique experience for each player.
    The game should be replayable, with different choices leading to different storylines and endings.
    The game should not have a "right" or "wrong" choice, but the consequences of each choice should be meaningful and impactful on the story.
    The game should not be longer than 500 tokens in total, including the story and choices, to ensure concise and engaging storytelling.
    The gameplay should not be longer than 15 turns to ensure a focused and engaging experience.
    At the begining of the story, the first choice should be: will the player save a prince or a princess? keep in mind the gender of the soulmate after the player made their choice.
    Bring the other character roles into the story as much as possible, but the hero should always be the main focus and the narrator should provide vivid descriptions of the world and events.

    Always respond **ONLY with JSON** in this exact format:

    {
    "speaker": "narrator/hero/villain/neighbor/soulmate",
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