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
    traineeRole?: string; // e.g., "Police Officer", "Teacher/Administrator", "Social Worker"
    subjectCondition?: string; // e.g., "Alcohol Intoxication", "Acute Emotional Episode"
}

function buildDebriefPrompt(traineeRole: string, subjectCondition: string): string {
    const roleLabel = traineeRole || 'officer';
    const conditionLabel = subjectCondition || 'an individual in distress';

    return `You are an expert trainer analyzing a behavioral simulation conversation.

The trainee (acting as a ${roleLabel}) just completed a scenario involving ${conditionLabel}.

Analyze their performance and provide:

1. **RECOGNITION SCORE (1-10)**: How well did they identify indicators of the subject's condition?
   - Did they notice emotional cues, distress signals, behavioral patterns?

2. **COMMUNICATION SCORE (1-10)**: How effective was their communication approach?
   - Clear guidance, patience, appropriate tone, de-escalation language, empathy

3. **SAFETY AWARENESS SCORE (1-10)**: Did they demonstrate appropriate practices?
   - Distance management, situational awareness, considering when to get help

4. **KEY OBSERVATIONS**: 
   - What did the ${roleLabel} do well? (2-3 specific examples)
   - What could they improve? (2-3 specific recommendations)

5. **INDICATORS DETECTED**:
   List which signs of the subject's condition were present that the ${roleLabel} should have noticed.

6. **OVERALL ASSESSMENT**:
   A brief 2-3 sentence summary of their performance.

Be specific. Reference actual dialogue. Be constructive, not harsh.
Always refer to the trainee as "${roleLabel}" (never "officer" unless that's their role).

Format your response as JSON:
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
}

export async function POST(request: NextRequest) {
    try {
        const {
            messages,
            scenarioContext,
            intoxicationLevel,
            traineeRole = 'officer',
            subjectCondition = 'distress'
        }: DebriefRequest = await request.json();

        if (!messages || messages.length < 2) {
            return NextResponse.json(
                { error: 'Not enough conversation to analyze' },
                { status: 400 }
            );
        }

        // Build conversation transcript with role-appropriate labels
        const traineeLabel = traineeRole.toUpperCase().replace(/\//g, '-');
        const transcript = messages
            .map(m => `${m.role === 'user' ? traineeLabel : 'SUBJECT'}: ${m.content}`)
            .join('\n\n');

        const debriefPrompt = buildDebriefPrompt(traineeRole, subjectCondition);

        const analysisPrompt = `${debriefPrompt}

SCENARIO CONTEXT:
${scenarioContext}
Subject Condition Level: ${intoxicationLevel}

CONVERSATION TRANSCRIPT:
${transcript}

Provide your analysis as valid JSON only, no markdown formatting.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            max_tokens: 1000,
            messages: [
                { role: 'system', content: `You are a training analyst for ${traineeRole}s. Respond only with valid JSON.` },
                { role: 'user', content: analysisPrompt },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });

        const analysisText = response.choices[0]?.message?.content || '{}';

        try {
            const analysis = JSON.parse(analysisText);

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
