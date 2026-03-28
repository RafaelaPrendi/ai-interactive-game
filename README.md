AI Voice Story Game

Description:
This is an interactive AI-powered voice story game where players make choices by speaking. The game uses ElevenLabs for speech-to-text (STT) and text-to-speech (TTS), and Claude (Anthropic) as the AI “brain” to generate dynamic story content and choices.

This project was started as a hackathon project for the SCSU IdeaForge Hackathon.

Features
Voice-controlled story gameplay
Real-time speech-to-text conversion via ElevenLabs Scribe
AI-driven story generation using Claude
Text-to-speech narration via ElevenLabs
Multiple choices dynamically generated based on player input


Prerequisites
Node.js 18+
pnpm or npm
ElevenLabs API key
Anthropic Claude API key

Create a .env.local file in the project root:

ELEVENLABS_API_KEY=your_elevenlabs_api_key
ANTHROPIC_API_KEY=your_claude_api_key

Install & Run Locally
Clone the repository:
git clone <your-repo-url>
cd <project-folder>
Install dependencies:
pnpm install
Run the development server with Vercel:
vercel dev
Open the game in your browser:
http://localhost:3000


Usage
Click Start Recording to speak your choice.
The speech is converted to text and sent to Claude for story progression.
The AI generates new story content and possible choices.
Listen to narration via TTS and make your next choice by voice.
Repeat until the story concludes.