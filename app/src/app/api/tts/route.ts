import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Voice mapping for different subject types
const VOICE_MAP: Record<string, 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'> = {
    // Male voices
    'male-young': 'echo',
    'male-middle': 'onyx',
    'male-older': 'fable',
    // Female voices
    'female-young': 'shimmer',
    'female-middle': 'nova',
    'female-older': 'alloy',
    // Default
    'default': 'onyx',
};

function selectVoice(subjectName: string, subjectAge: string): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' {
    // Simple heuristic based on name patterns and age
    const age = parseInt(subjectAge) || 30;

    // Common female first names
    const femaleNames = ['sarah', 'michelle', 'maria', 'emma', 'jasmine', 'alex'];
    const firstName = subjectName.split(' ')[0].toLowerCase();
    const isFemale = femaleNames.some(n => firstName.includes(n));

    if (isFemale) {
        if (age < 25) return 'shimmer';
        if (age < 45) return 'nova';
        return 'alloy';
    } else {
        if (age < 25) return 'echo';
        if (age < 45) return 'onyx';
        return 'fable';
    }
}

export async function POST(request: NextRequest) {
    try {
        const { text, subjectName, subjectAge } = await request.json();

        if (!text || text.trim().length === 0) {
            return new Response(JSON.stringify({ error: 'No text provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Select voice based on subject
        const voice = selectVoice(subjectName || 'default', subjectAge || '30');

        // Generate speech
        const response = await openai.audio.speech.create({
            model: 'tts-1', // Use tts-1-hd for higher quality (more expensive)
            voice,
            input: text,
            response_format: 'mp3',
            speed: 1.0,
        });

        // Get the audio data as a buffer
        const audioBuffer = await response.arrayBuffer();

        // Return audio as binary
        return new Response(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error('TTS API error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate speech' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
