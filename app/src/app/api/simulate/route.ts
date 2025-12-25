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

// Analyze sentiment and calculate agitation change
async function analyzeSentimentAndAgitation(
    messages: { role: string; content: string }[],
    currentDistance: number,
    currentTemperature: number
): Promise<{ temperatureChange: number; distanceChange: number; reason: string }> {
    const recentMessages = messages.slice(-6); // Last 3 exchanges
    const transcript = recentMessages
        .map(m => `${m.role === 'user' ? 'OFFICER' : 'SUBJECT'}: ${m.content}`)
        .join('\n');

    const analysisPrompt = `Analyze this interaction and determine:
1. How the subject's agitation level should change (-2 to +2)
2. Whether the subject would move closer or further (-1, 0, or +1)

Consider:
- Officer's tone: commanding vs calm, aggressive vs empathetic
- Distance: currently ${currentDistance}/10 (1=very close, 10=far)
- Current agitation: ${currentTemperature}/10

Recent interaction:
${transcript}

Respond with ONLY valid JSON:
{"temperatureChange": number, "distanceChange": number, "reason": "brief explanation"}

Rules:
- Aggressive commands (+1 to +2 temperature, subject may back away +1)
- Calm, empathetic approach (-1 to -2 temperature, subject may approach -1)
- Threatening to get physical (+2, subject backs away)
- Offering help (-1 temperature, possible approach)
- If agitated subject feels cornered (distance ≤2 and temp ≥7), they may try to create distance`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Faster for analysis
            max_tokens: 100,
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
    const distanceContext = config.distance <= 2 ? 'The person is very close to you - uncomfortably so. You feel cornered.' :
        config.distance <= 4 ? 'The person is at normal talking distance.' :
            config.distance <= 7 ? 'The person is keeping a reasonable distance - that helps.' :
                'The person is far away, which makes you feel safer.';

    const temperatureContext = config.temperature >= 8 ? 'You are extremely agitated. Your voice is raised, you might be yelling or crying.' :
        config.temperature >= 6 ? 'You are noticeably tense and defensive. Snapping at them.' :
            config.temperature >= 4 ? 'You are uneasy and wary, but holding it together.' :
                'You are relatively calm given the situation.';

    const movementInstruction = config.temperature >= 7 && config.distance <= 3
        ? 'You feel trapped and may try to create space. Mention wanting to step back or feeling crowded.'
        : config.temperature <= 3 && config.distance >= 5
            ? 'You might move a bit closer as you feel more comfortable.'
            : '';

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
${movementInstruction}

You are interacting with a ${config.trainingPack.targetRole}.

MOVEMENT: If you feel threatened or cornered, you can indicate movement with *takes a step back* or *backs away*. If you're calming down, you might *relaxes slightly* or *sits back down*.

RESPONSE GUIDELINES:
- Stay completely in character as ${config.subject.name}
- Your responses should reflect your condition and current emotional state
- Use realistic speech patterns with "uh", "um", pauses ("..."), verbal stumbles
- React to the ${config.trainingPack.targetRole}'s tone - aggressive approach makes you worse
- Use *asterisks* for physical actions including movement
- Responses should be 1-4 sentences
- Never acknowledge this is a simulation

CRITICAL: You ARE this person. Never break character.`;
}

export async function POST(request: NextRequest) {
    try {
        const { messages, sessionId, config } = await request.json() as {
            messages: { role: string; content: string }[];
            sessionId: string;
            config: SimulateConfig;
        };

        // Analyze sentiment and calculate changes BEFORE generating response
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
                // Send metadata with AI-analyzed changes
                controller.enqueue(encoder.encode(JSON.stringify({
                    type: 'meta',
                    sessionId,
                    temperatureChange: sentimentAnalysis.temperatureChange,
                    distanceChange: sentimentAnalysis.distanceChange,
                    analysisReason: sentimentAnalysis.reason,
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
