import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import {
    buildSystemPrompt,
    type ProfileConfig
} from '@/lib/profiles/traits';
import { buildScenarioContext, getTraitFromBehavior } from '@/lib/scenarios/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Cache profiles per session
const sessionProfiles: Map<string, { profile: ProfileConfig; scenarioContext: string }> = new Map();

interface ScenarioSelection {
    timeOfDay: string;
    location: string;
    situation: string;
    subjectBehavior: string;
}

function getIntoxicationFromSituation(situationId: string): 'mild' | 'moderate' | 'severe' {
    if (situationId === 'welfare-check') return 'severe';
    if (situationId === 'suspicious-person') return Math.random() > 0.5 ? 'severe' : 'moderate';
    return 'moderate';
}

function createProfileFromSelection(selection: ScenarioSelection): { profile: ProfileConfig; scenarioContext: string } {
    const scenarioContext = buildScenarioContext(selection);
    const trait = getTraitFromBehavior(selection.subjectBehavior);
    const intoxicationLevel = getIntoxicationFromSituation(selection.situation);

    const names = ['Jake Thompson', 'Marcus Williams', 'Dave Miller', 'Tony Reyes', 'Chris Johnson'];
    const jobs = ['construction worker', 'bartender', 'sales rep', 'between jobs', 'teacher'];
    const reasons = ['friend\'s birthday', 'rough day at work', 'fight with spouse', 'celebrating', 'just one of those nights'];
    const destinations = ['home', 'friend\'s place', 'nowhere specific', 'getting food'];

    const randomPick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    return {
        profile: {
            intoxicationLevel,
            scenarioContext,
            traits: [trait],
            backstory: {
                name: randomPick(names),
                occupation: randomPick(jobs),
                reason: randomPick(reasons),
                destination: randomPick(destinations),
            },
        },
        scenarioContext,
    };
}

export async function POST(request: NextRequest) {
    try {
        const { messages, sessionId = `session-${Date.now()}`, scenarioSelection } = await request.json();

        let cached = sessionProfiles.get(sessionId);

        if (!cached && scenarioSelection) {
            cached = createProfileFromSelection(scenarioSelection as ScenarioSelection);
            sessionProfiles.set(sessionId, cached);
        }

        if (!cached) {
            return new Response(JSON.stringify({ error: 'No scenario selection provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const systemPrompt = buildSystemPrompt(cached.profile);

        const formattedMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...messages.map((msg: { role: string; content: string }) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
        ];

        // STREAMING RESPONSE
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o',
            max_tokens: 500,
            messages: formattedMessages,
            temperature: 0.85,
            presence_penalty: 0.4,
            frequency_penalty: 0.5,
            top_p: 0.95,
            stream: true,
        });

        // Create a readable stream
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                // Send metadata first
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: 'meta',
                    sessionId,
                    scenarioContext: cached!.scenarioContext,
                    intoxicationLevel: cached!.profile.intoxicationLevel,
                }) + '\n'));

                // Stream the content
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(encoder.encode(JSON.stringify({
                            type: 'content',
                            content,
                        }) + '\n'));
                    }
                }

                controller.enqueue(encoder.encode(JSON.stringify({ type: 'done' }) + '\n'));
                controller.close();
            },
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function DELETE() {
    sessionProfiles.clear();
    return new Response(JSON.stringify({ cleared: true }), {
        headers: { 'Content-Type': 'application/json' },
    });
}
