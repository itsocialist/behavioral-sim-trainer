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

async function analyzeSentimentAndAgitation(
    messages: { role: string; content: string }[],
    currentDistance: number,
    currentTemperature: number
): Promise<{ temperatureChange: number; distanceChange: number; reason: string }> {
    const recentMessages = messages.slice(-6);
    const transcript = recentMessages
        .map(m => `${m.role === 'user' ? 'TRAINEE' : 'SUBJECT'}: ${m.content}`)
        .join('\n');

    const analysisPrompt = `Analyze this interaction:
1. How should the subject's agitation change? (-2 to +2)
2. Should the subject move closer or further? (-1, 0, +1)

Distance: ${currentDistance}/10, Agitation: ${currentTemperature}/10

${transcript}

JSON only: {"temperatureChange": number, "distanceChange": number, "reason": "brief"}`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 80,
            messages: [{ role: 'user', content: analysisPrompt }],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });

        const result = JSON.parse(response.choices[0]?.message?.content || '{}');
        return {
            temperatureChange: Math.max(-2, Math.min(2, result.temperatureChange || 0)),
            distanceChange: Math.max(-1, Math.min(1, result.distanceChange || 0)),
            reason: result.reason || '',
        };
    } catch {
        return { temperatureChange: 0, distanceChange: 0, reason: '' };
    }
}

function buildSystemPrompt(config: SimulateConfig): string {
    const distanceContext = config.distance <= 2 ? 'The person is very close - you feel cornered.' :
        config.distance <= 4 ? 'The person is at normal talking distance.' :
            config.distance <= 7 ? 'The person is keeping reasonable distance.' :
                'The person is far away, which helps.';

    const temperatureContext = config.temperature >= 8 ? 'You are extremely agitated. Voice raised, possibly yelling or crying.' :
        config.temperature >= 6 ? 'You are noticeably tense and defensive.' :
            config.temperature >= 4 ? 'You are uneasy and wary.' :
                'You are relatively calm.';

    return `You ARE ${config.subject.name}, ${config.subject.age} years old.

WHO YOU ARE:
- Occupation: ${config.subject.occupation}
- Background: ${config.subject.backstory}
- Personality: ${config.subject.personalityTraits.join(', ')}

YOUR CONDITION:
${config.subjectPack.condition} (${config.subjectPack.conditionLevel})
${config.subjectPack.behaviorPrompt}

SITUATION:
${config.scenarioPack.context}
${distanceContext}
${temperatureContext}

Interacting with: ${config.trainingPack.targetRole}

RESPONSE FORMAT:
Your response MUST be valid JSON with exactly this structure:
{
  "behavior": "Detailed description of your physical state, actions, and body language",
  "statements": ["First thing you say", "Second thing", "Third thing", "..."]
}

BEHAVIOR: Be specific - mention facial expressions, posture, movements, physical signs of your condition.
Examples: "Swaying on feet, squinting at the light, fumbling in pockets", "Eyes darting around, backing toward the wall, hands trembling", "Crossing arms defensively, jaw tight, avoiding eye contact"

STATEMENTS: You MUST say 2-5 separate things. Each should be:
- Realistic dialogue with "uh", "um", pauses "...", stutters, incomplete thoughts
- Reflect your emotional state and condition
- Show your personality
- React to what was just said to you

Stay in character as ${config.subject.name}. Never break character.`;
}

export async function POST(request: NextRequest) {
    try {
        const { messages, sessionId, config } = await request.json() as {
            messages: { role: string; content: string }[];
            sessionId: string;
            config: SimulateConfig;
        };

        let sentimentAnalysis = { temperatureChange: 0, distanceChange: 0, reason: '' };
        if (messages.length >= 2) {
            sentimentAnalysis = await analyzeSentimentAndAgitation(
                messages,
                config.distance,
                config.temperature
            );
        }

        const systemPrompt = buildSystemPrompt(config);

        const formattedMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...messages.map((msg) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            })),
        ];

        // Non-streaming for JSON response
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            max_tokens: 700,
            messages: formattedMessages,
            temperature: 0.85,
            presence_penalty: 0.4,
            frequency_penalty: 0.5,
            response_format: { type: 'json_object' },
        });

        const responseText = response.choices[0]?.message?.content || '{}';
        let parsed: { behavior?: string; statements?: string[] };

        try {
            parsed = JSON.parse(responseText);
        } catch {
            // Fallback if JSON parsing fails
            parsed = { behavior: 'Looking uncertain', statements: [responseText] };
        }

        const behavior = parsed.behavior || 'No visible change';
        const statements = parsed.statements || ['...'];

        // Stream the response
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                // Send metadata
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: 'meta',
                    sessionId,
                    temperatureChange: sentimentAnalysis.temperatureChange,
                    distanceChange: sentimentAnalysis.distanceChange,
                    behavior,
                }) + '\n'));

                // Stream each statement with a small delay between them
                for (let i = 0; i < statements.length; i++) {
                    const statement = statements[i];

                    // Stream characters for this statement
                    for (const char of statement) {
                        controller.enqueue(encoder.encode(JSON.stringify({
                            type: 'content',
                            content: char,
                        }) + '\n'));
                        // Small delay for streaming effect (simulated)
                    }

                    // Add paragraph break between statements
                    if (i < statements.length - 1) {
                        controller.enqueue(encoder.encode(JSON.stringify({
                            type: 'content',
                            content: '\n\n',
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
