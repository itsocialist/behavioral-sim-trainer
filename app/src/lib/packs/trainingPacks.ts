// Training Pack System for SimuTrain
// Hierarchical: Training Packs → Subject Packs + Scenario Packs

export interface SubjectProfile {
    id: string;
    name: string;
    age: string;
    occupation: string;
    backstory: string;
    personalityTraits: string[];
    physicalDescription: string;
}

export interface ScenarioPack {
    id: string;
    name: string;
    description: string;
    context: string;
    initialDistance: number; // 1-10 scale, 10 = far
    initialTemperature: number; // 1-10 scale, 10 = very agitated
}

export interface SubjectPack {
    id: string;
    name: string;
    condition: string; // e.g., "Alcohol Intoxication", "Mental Health Crisis"
    conditionLevel: 'mild' | 'moderate' | 'severe';
    subjects: SubjectProfile[];
    behaviorPrompt: string;
}

export interface TrainingPack {
    id: string;
    name: string;
    icon: string;
    description: string;
    targetRole: string; // Who is being trained
    subjectPacks: SubjectPack[];
    scenarioPacks: ScenarioPack[];
}

// ============================================
// LAW ENFORCEMENT TRAINING PACK
// ============================================

const lawEnforcementSubjects: SubjectPack[] = [
    {
        id: 'le-alcohol',
        name: 'Alcohol Intoxication',
        condition: 'Alcohol Intoxication',
        conditionLevel: 'moderate',
        behaviorPrompt: `Speech: Noticeably slurred, repetitive, loses track of thoughts
Cognition: Struggles with time/numbers, forgets what was just said
Emotions: Mood swings between friendly and frustrated
Physical: Unsteady, needs support, slow reactions`,
        subjects: [
            {
                id: 'le-alc-1',
                name: 'Jake Thompson',
                age: '38',
                occupation: 'Construction worker',
                backstory: 'Divorced, drinks to cope. Was at a bar watching the game.',
                personalityTraits: ['defensive', 'talks about his kids'],
                physicalDescription: 'Work boots, flannel shirt, unshaven',
            },
            {
                id: 'le-alc-2',
                name: 'Marcus Williams',
                age: '29',
                occupation: 'Warehouse worker',
                backstory: 'Long shift, coworkers convinced him to go out.',
                personalityTraits: ['overly-friendly', 'apologetic'],
                physicalDescription: 'Tired looking, polo shirt, jeans',
            },
        ],
    },
    {
        id: 'le-mental',
        name: 'Mental Health Crisis',
        condition: 'Acute Anxiety/Paranoia',
        conditionLevel: 'moderate',
        behaviorPrompt: `Speech: Rapid, sometimes incoherent, jumps topics
Cognition: Hypervigilant, sees threats that aren't there
Emotions: Fearful, paranoid, may cry or become agitated
Physical: Pacing, can't stay still, startles easily`,
        subjects: [
            {
                id: 'le-mh-1',
                name: 'David Chen',
                age: '34',
                occupation: 'IT professional',
                backstory: 'Off medication for a week, hasn\'t slept in days.',
                personalityTraits: ['paranoid', 'talks fast'],
                physicalDescription: 'Disheveled, wrinkled clothes, darting eyes',
            },
        ],
    },
];

const lawEnforcementScenarios: ScenarioPack[] = [
    {
        id: 'le-traffic',
        name: 'Traffic Stop',
        description: 'Late night traffic stop for erratic driving',
        context: 'You\'ve pulled over a vehicle on a residential street. It\'s around 11:30 PM. The driver is still in the car.',
        initialDistance: 3,
        initialTemperature: 4,
    },
    {
        id: 'le-welfare',
        name: 'Welfare Check',
        description: 'Person reported disoriented in public',
        context: 'You\'re responding to a call about someone stumbling in a parking lot. It\'s evening. The person is sitting on a curb.',
        initialDistance: 5,
        initialTemperature: 3,
    },
    {
        id: 'le-disturbance',
        name: 'Noise Complaint',
        description: 'Yelling reported at an apartment complex',
        context: 'Neighbors called about loud arguing. You arrive to find someone standing outside an apartment building.',
        initialDistance: 4,
        initialTemperature: 6,
    },
];

// ============================================
// SOCIAL WORKER TRAINING PACK
// ============================================

const socialWorkerSubjects: SubjectPack[] = [
    {
        id: 'sw-substance',
        name: 'Substance Use Disorder',
        condition: 'Active Substance Use',
        conditionLevel: 'moderate',
        behaviorPrompt: `Speech: Variable - may be slow or rapid depending on substance
Cognition: Focus issues, may be manipulative or evasive
Emotions: Defensive about use, may become hostile if confronted
Physical: Signs of use, poor hygiene, may be seeking resources`,
        subjects: [
            {
                id: 'sw-sub-1',
                name: 'Michelle Torres',
                age: '32',
                occupation: 'Unemployed',
                backstory: 'Single mother, kids are with grandparents. Trying to get clean.',
                personalityTraits: ['defensive', 'ashamed', 'wants help'],
                physicalDescription: 'Thin, nervous movements, picks at skin',
            },
        ],
    },
    {
        id: 'sw-housing',
        name: 'Housing Crisis',
        condition: 'Acute Stress',
        conditionLevel: 'moderate',
        behaviorPrompt: `Speech: Emotional, may ramble about problems
Cognition: Overwhelmed, difficulty prioritizing, forgetful
Emotions: Desperate, may cry, can become frustrated
Physical: Tired, may have belongings with them`,
        subjects: [
            {
                id: 'sw-hs-1',
                name: 'Robert James',
                age: '45',
                occupation: 'Former retail manager',
                backstory: 'Lost job, then apartment. Been couch surfing for weeks.',
                personalityTraits: ['embarrassed', 'proud', 'frustrated'],
                physicalDescription: 'Worn clothes, backpack, tired eyes',
            },
        ],
    },
];

const socialWorkerScenarios: ScenarioPack[] = [
    {
        id: 'sw-office',
        name: 'Office Visit',
        description: 'Client comes to office for scheduled appointment',
        context: 'The client has arrived for a scheduled check-in. They seem more agitated than usual.',
        initialDistance: 4,
        initialTemperature: 5,
    },
    {
        id: 'sw-home',
        name: 'Home Visit',
        description: 'Visiting client at their residence',
        context: 'You\'re conducting a home visit. The client answered the door but seems reluctant to let you in.',
        initialDistance: 3,
        initialTemperature: 5,
    },
];

// ============================================
// TEACHER TRAINING PACK
// ============================================

const teacherSubjects: SubjectPack[] = [
    {
        id: 'tc-behavior',
        name: 'Behavioral Challenges',
        condition: 'Oppositional Behavior',
        conditionLevel: 'moderate',
        behaviorPrompt: `Speech: Defiant, may use inappropriate language, challenges authority
Cognition: Actually understands, choosing not to comply
Emotions: Angry, embarrassed (underneath), testing limits
Physical: Crossed arms, avoiding eye contact, may throw things`,
        subjects: [
            {
                id: 'tc-bh-1',
                name: 'Tyler',
                age: '14',
                occupation: 'Student',
                backstory: 'Parents going through divorce. Acting out at school.',
                personalityTraits: ['defiant', 'actually vulnerable', 'seeks attention'],
                physicalDescription: 'Headphones around neck, hoodie up, slouching',
            },
        ],
    },
    {
        id: 'tc-emotional',
        name: 'Emotional Distress',
        condition: 'Acute Emotional Episode',
        conditionLevel: 'moderate',
        behaviorPrompt: `Speech: May refuse to speak, or speak through tears
Cognition: Overwhelmed, can't focus on academics right now
Emotions: Sad, scared, possibly having panic attack
Physical: Crying, shaking, may hide face`,
        subjects: [
            {
                id: 'tc-em-1',
                name: 'Emma',
                age: '16',
                occupation: 'Student',
                backstory: 'Bullying situation, feels isolated. Having a breakdown.',
                personalityTraits: ['anxious', 'wants to be liked', 'withdrawing'],
                physicalDescription: 'Head down, tears, hugging herself',
            },
        ],
    },
];

const teacherScenarios: ScenarioPack[] = [
    {
        id: 'tc-classroom',
        name: 'Classroom Disruption',
        description: 'Student disrupting class',
        context: 'A student is refusing to comply with instructions and other students are watching. You need to de-escalate without embarrassing anyone.',
        initialDistance: 3,
        initialTemperature: 6,
    },
    {
        id: 'tc-hallway',
        name: 'Hallway Situation',
        description: 'Found student alone in distress',
        context: 'You found a student sitting alone in the hallway, clearly upset. Class is in session.',
        initialDistance: 5,
        initialTemperature: 4,
    },
];

// ============================================
// EXPORT ALL TRAINING PACKS
// ============================================

export const TRAINING_PACKS: TrainingPack[] = [
    {
        id: 'law-enforcement',
        name: 'Law Enforcement',
        icon: '🚔',
        description: 'Traffic stops, welfare checks, public disturbances',
        targetRole: 'Police Officer',
        subjectPacks: lawEnforcementSubjects,
        scenarioPacks: lawEnforcementScenarios,
    },
    {
        id: 'social-work',
        name: 'Social Work',
        icon: '🤝',
        description: 'Crisis intervention, home visits, client management',
        targetRole: 'Social Worker',
        subjectPacks: socialWorkerSubjects,
        scenarioPacks: socialWorkerScenarios,
    },
    {
        id: 'education',
        name: 'Education',
        icon: '📚',
        description: 'Student behavioral and emotional crises',
        targetRole: 'Teacher/Administrator',
        subjectPacks: teacherSubjects,
        scenarioPacks: teacherScenarios,
    },
];

// Helper functions
export function getTrainingPack(packId: string): TrainingPack | undefined {
    return TRAINING_PACKS.find(p => p.id === packId);
}

export function getRandomSubject(subjectPack: SubjectPack): SubjectProfile {
    return subjectPack.subjects[Math.floor(Math.random() * subjectPack.subjects.length)];
}
