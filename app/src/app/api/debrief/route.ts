import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface DebriefRequest {
    messages: Message[];
    scenarioContext: string;
    intoxicationLevel: string;
}

const DEBRIEF_PROMPT = `You are an expert law enforcement trainer analyzing a training simulation conversation. 

The trainee (playing as an officer) just completed a scenario involving an intoxicated individual.

Analyze their performance and provide:

1. **RECOGNITION SCORE (1-10)**: How well did they identify impairment indicators?
   - Look for: Did they notice slurred speech, confusion, inconsistencies, emotional volatility?

2. **COMMUNICATION SCORE (1-10)**: How effective was their communication approach?
   - Look for: Clear instructions, patience, appropriate tone, de-escalation language

3. **SAFETY AWARENESS SCORE (1-10)**: Did they demonstrate appropriate safety practices?
   - Look for: Distance management, situational awareness, considering backup/medical needs

4. **KEY OBSERVATIONS**: 
   - What did they do well? (2-3 specific examples from the conversation)
   - What could they improve? (2-3 specific recommendations)

5. **IMPAIRMENT INDICATORS DETECTED**:
   List which signs of impairment were present in the subject's responses that the officer should have noticed.

6. **OVERALL ASSESSMENT**:
   A brief 2-3 sentence summary of their performance.

Be specific. Reference actual dialogue from the conversation. Be constructive, not harsh.

Format your response as JSON with this structure:
{
  "recognitionScore": number,
  "communicationScore": number,
  "safetyScore": number,
  "overallScore": number,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "indicatorsPresent": ["string", "string"],
  "indicatorsMissed": ["string", "string"],
  "summary": "string"
}`;

export async function POST(request: NextRequest) {
    try {
        const { messages, scenarioContext, intoxicationLevel }: DebriefRequest = await request.json();

        if (!messages || messages.length < 2) {
            return NextResponse.json(
                { error: 'Not enough conversation to analyze' },
                { status: 400 }
            );
        }

        // Build conversation transcript for analysis
        const transcript = messages
            .map(m => `${m.role === 'user' ? 'OFFICER' : 'SUBJECT'}: ${m.content}`)
            .join('\n\n');

        const analysisPrompt = `${DEBRIEF_PROMPT}

SCENARIO CONTEXT:
${scenarioContext}
Intoxication Level: ${intoxicationLevel}

CONVERSATION TRANSCRIPT:
${transcript}

Provide your analysis as valid JSON only, no markdown formatting.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            max_tokens: 1000,
            messages: [
                { role: 'system', content: 'You are a law enforcement training analyst. Respond only with valid JSON.' },
                { role: 'user', content: analysisPrompt },
            ],
            temperature: 0.3, // Lower for more consistent analysis
            response_format: { type: 'json_object' },
        });

        const analysisText = response.choices[0]?.message?.content || '{}';

        try {
            const analysis = JSON.parse(analysisText);

            // Calculate overall score if not provided
            if (!analysis.overallScore) {
                analysis.overallScore = Math.round(
                    (analysis.recognitionScore + analysis.communicationScore + analysis.safetyScore) / 3
                );
            }

            return NextResponse.json({
                success: true,
                analysis,
                messageCount: messages.length,
            });
        } catch {
            console.error('Failed to parse analysis JSON:', analysisText);
            return NextResponse.json({
                success: false,
                error: 'Failed to parse analysis',
                raw: analysisText,
            });
        }
    } catch (error) {
        console.error('Debrief API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate debrief' },
            { status: 500 }
        );
    }
}
