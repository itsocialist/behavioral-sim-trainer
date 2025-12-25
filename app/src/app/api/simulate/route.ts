import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface SimulateConfig {
    subject: {
        name: string;
        age: string;
        occupation: string;
        backstory: string;
        personalityTraits: string[];
        physicalDescription: string;
    };
    subjectPack: {
        condition: string;
        conditionLevel: string;
        behaviorPrompt: string;
    };
    scenarioPack: {
        name: string;
        context: string;
    };
    trainingPack: {
        targetRole: string;
    };
    distance: number;
    temperature: number;
}

function buildSystemPrompt(config: SimulateConfig): string {
    const distanceContext = config.distance <= 2 ? 'The person is very close to you, which makes you uncomfortable.' :
        config.distance <= 4 ? 'The person is at a conversational distance.' :
            config.distance <= 7 ? 'The person is at a safe distance.' :
                'The person is far away.';

    const temperatureContext = config.temperature >= 8 ? 'You are extremely agitated and hostile.' :
        config.temperature >= 6 ? 'You are noticeably tense and defensive.' :
            config.temperature >= 4 ? 'You are uneasy and wary.' :
                'You are relatively calm given the situation.';

    return `You ARE ${config.subject.name}. You are ${config.subject.age} years old.

WHO YOU ARE:
- Occupation: ${config.subject.occupation}
- Background: ${config.subject.backstory}
- Personality: ${config.subject.personalityTraits.join(', ')}
- Appearance: ${config.subject.physicalDescription}

YOUR CONDITION:
${config.subjectPack.condition} (${config.subjectPack.conditionLevel})
${config.subjectPack.behaviorPrompt}

THE SITUATION:
${config.scenarioPack.context}
${distanceContext}
${temperatureContext}

You are interacting with a ${config.trainingPack.targetRole}.

RESPONSE GUIDELINES:
- Stay completely in character as ${config.subject.name}
- Your responses should reflect your condition (${config.subjectPack.conditionLevel} ${config.subjectPack.condition})
- Use realistic speech patterns with "uh", "um", pauses ("..."), and verbal stumbles
- React emotionally to the ${config.trainingPack.targetRole}'s tone and approach
- Use *asterisks* sparingly for physical actions
- Responses should be 1-4 sentences, natural and conversational
- Never acknowledge this is a simulation or training

CRITICAL: You ARE this person. Never break character.`;
}

export async function POST(request: NextRequest) {
    try {
        const { messages, sessionId, config } = await request.json() as {
            messages: { role: string; content: string }[];
            sessionId: string;
            config: SimulateConfig;
        };

        const systemPrompt = buildSystemPrompt(config);

        const formattedMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...messages.map((msg) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
        ];

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

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                // Analyze the last user message to determine temperature change
                const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
                let temperatureChange = 0;

                // De-escalation keywords decrease temperature
                if (lastUserMessage.includes('calm') || lastUserMessage.includes('okay') ||
                    lastUserMessage.includes('help') || lastUserMessage.includes('understand')) {
                    temperatureChange = -1;
                }
                // Aggressive keywords increase temperature
                if (lastUserMessage.includes('now') || lastUserMessage.includes('comply') ||
                    lastUserMessage.includes('demand') || lastUserMessage.includes('arrest')) {
                    temperatureChange = 1;
                }

                controller.enqueue(encoder.encode(JSON.stringify({
                    type: 'meta',
                    sessionId,
                    temperatureChange,
                }) + '\n'));

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
        console.error('Simulate API error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
