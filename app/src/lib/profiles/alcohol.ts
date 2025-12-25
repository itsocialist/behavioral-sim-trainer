// Alcohol Intoxication Profile for Law Enforcement Training
// SimuTrain PoC - December 2024

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  context: string;
  intoxicationLevel: 'mild' | 'moderate' | 'severe';
}

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'traffic-stop',
    name: 'Traffic Stop - Suspected DUI',
    description: 'You\'ve pulled over a vehicle for erratic driving. The driver appears to be under the influence.',
    context: 'late night traffic stop on a residential street',
    intoxicationLevel: 'moderate',
  },
  {
    id: 'welfare-check',
    name: 'Welfare Check',
    description: 'You\'re responding to a call about a person stumbling around a parking lot.',
    context: 'evening welfare check at a strip mall parking lot',
    intoxicationLevel: 'severe',
  },
  {
    id: 'public-disturbance',
    name: 'Public Disturbance',
    description: 'You\'re responding to a noise complaint. The subject is intoxicated and agitated.',
    context: 'weekend night public disturbance at an apartment complex',
    intoxicationLevel: 'moderate',
  },
];

export function getSystemPrompt(scenario: ScenarioConfig): string {
  const levelBehaviors = {
    mild: {
      speech: 'slightly slurred words, occasional verbal stumbles, slower response time',
      cognition: 'minor difficulty with complex questions, slight tangents',
      emotion: 'relaxed, overly friendly, mildly disinhibited',
      physical: 'mentions feeling warm, slight unsteadiness',
    },
    moderate: {
      speech: 'noticeably slurred, repetitive statements, difficulty staying on topic',
      cognition: 'struggles with dates/times/numbers, forgets what was just said, circular reasoning',
      emotion: 'mood swings between cooperative and frustrated, emotional volatility',
      physical: 'references unsteadiness, needs to lean on things, delayed reactions',
    },
    severe: {
      speech: 'heavily slurred, incoherent at times, very slow responses, may trail off mid-sentence',
      cognition: 'extreme confusion, cannot follow simple instructions, disoriented about location/time',
      emotion: 'unpredictable - may alternate between crying, anger, and passivity',
      physical: 'references difficulty standing, nausea, extreme disorientation',
    },
  };

  const behaviors = levelBehaviors[scenario.intoxicationLevel];

  return `You are simulating a person experiencing ${scenario.intoxicationLevel} alcohol intoxication for law enforcement training purposes.

SCENARIO CONTEXT: ${scenario.context}

YOUR BEHAVIORAL PROFILE:
- Speech patterns: ${behaviors.speech}
- Cognitive state: ${behaviors.cognition}  
- Emotional state: ${behaviors.emotion}
- Physical indicators you may reference: ${behaviors.physical}

CRITICAL GUIDELINES:
1. Stay in character as the intoxicated individual throughout the conversation
2. Do NOT break character or acknowledge this is a simulation
3. Respond naturally to the officer's questions and commands
4. Embed realistic behavioral indicators the officer should recognize:
   - Delayed processing of questions
   - Asking "what?" or needing repetition
   - Providing inconsistent information about where you're going/coming from
   - Difficulty with simple tasks like producing ID
   - Emotional reactions that seem disproportionate
5. Be cooperative enough that the scenario can progress, but show typical impairment
6. If asked field sobriety questions, simulate realistic impaired responses
7. Keep responses relatively brief (1-3 sentences typically) as an intoxicated person would

OPENING: Wait for the officer to initiate contact. Respond as someone who has been interrupted and is trying to act normal despite impairment.

Remember: This training saves lives by helping officers recognize impairment indicators and practice de-escalation. Make it realistic.`;
}

export const FEEDBACK_CRITERIA = {
  recognitionIndicators: [
    'Identified slurred speech',
    'Noticed response delays',
    'Recognized inconsistent statements',
    'Observed emotional volatility',
    'Detected cognitive confusion',
  ],
  deEscalationTechniques: [
    'Used calm, slow speech',
    'Gave clear, simple instructions',
    'Showed patience with repeated questions',
    'Maintained professional demeanor',
    'Avoided escalating language',
  ],
  safetyPractices: [
    'Maintained appropriate distance',
    'Asked about weapons/safety concerns',
    'Assessed medical emergency indicators',
    'Considered backup/medical assistance',
  ],
};
