// Scenario Configuration for SimuTrain
// Allows dropdown selection of time, place, situation, and behavior

export interface ScenarioSetting {
    id: string;
    label: string;
    value: string;
}

export interface ScenarioDropdowns {
    timeOfDay: ScenarioSetting[];
    location: ScenarioSetting[];
    situation: ScenarioSetting[];
    subjectBehavior: ScenarioSetting[];
}

export const SCENARIO_OPTIONS: ScenarioDropdowns = {
    timeOfDay: [
        { id: 'late-night', label: 'Late Night (11pm - 2am)', value: 'around midnight, dark out, street lights on' },
        { id: 'evening', label: 'Evening (7pm - 10pm)', value: 'early evening, just getting dark' },
        { id: 'afternoon', label: 'Afternoon (2pm - 5pm)', value: 'mid-afternoon, still daylight' },
        { id: 'morning', label: 'Morning (6am - 10am)', value: 'early morning, they\'ve been drinking since last night' },
    ],
    location: [
        { id: 'roadside', label: 'Roadside / Traffic Stop', value: 'pulled over on the side of a residential street' },
        { id: 'parking-lot', label: 'Parking Lot', value: 'in a strip mall parking lot, near their vehicle' },
        { id: 'apartment', label: 'Apartment Complex', value: 'outside an apartment building, near the entrance' },
        { id: 'bar-exterior', label: 'Bar / Restaurant Exterior', value: 'outside a bar, in the parking area' },
    ],
    situation: [
        { id: 'traffic-stop', label: 'Traffic Stop - Erratic Driving', value: 'You pulled them over for weaving between lanes and driving inconsistently' },
        { id: 'welfare-check', label: 'Welfare Check Call', value: 'Someone called concerned about a person who seemed disoriented or in distress' },
        { id: 'noise-complaint', label: 'Noise / Disturbance Call', value: 'Neighbors called about yelling or loud arguing' },
        { id: 'suspicious-person', label: 'Suspicious Person Report', value: 'Someone reported a person acting strangely in the area' },
    ],
    subjectBehavior: [
        { id: 'cooperative', label: 'Initially Cooperative', value: 'The person is trying to cooperate but clearly impaired, making mistakes despite good intentions' },
        { id: 'defensive', label: 'Defensive / Resistant', value: 'The person is defensive, questioning why they\'re being stopped, mildly confrontational' },
        { id: 'emotional', label: 'Emotional / Upset', value: 'The person is emotional, may cry or become very apologetic, personal issues surfacing' },
        { id: 'confused', label: 'Confused / Disoriented', value: 'The person is genuinely confused about what\'s happening, having trouble following the situation' },
    ],
};

export interface SelectedScenario {
    timeOfDay: string;
    location: string;
    situation: string;
    subjectBehavior: string;
}

export function buildScenarioContext(selection: SelectedScenario): string {
    const time = SCENARIO_OPTIONS.timeOfDay.find(o => o.id === selection.timeOfDay);
    const location = SCENARIO_OPTIONS.location.find(o => o.id === selection.location);
    const situation = SCENARIO_OPTIONS.situation.find(o => o.id === selection.situation);
    const behavior = SCENARIO_OPTIONS.subjectBehavior.find(o => o.id === selection.subjectBehavior);

    return `TIME: ${time?.value || 'Late night'}
LOCATION: ${location?.value || 'Roadside'}
WHAT HAPPENED: ${situation?.value || 'Traffic stop'}
THE PERSON'S DEMEANOR: ${behavior?.value || 'Cooperative but impaired'}

An officer is now approaching to make contact.`;
}

// Map behavior selection to trait
export function getTraitFromBehavior(behaviorId: string): string {
    const mapping: Record<string, string> = {
        'cooperative': 'overly-friendly',
        'defensive': 'defensive',
        'emotional': 'tearful',
        'confused': 'confused-scared',
    };
    return mapping[behaviorId] || 'confused-scared';
}
