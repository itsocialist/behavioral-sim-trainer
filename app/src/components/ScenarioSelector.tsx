'use client';

import { SCENARIO_OPTIONS, type SelectedScenario } from '@/lib/scenarios/config';

interface ScenarioSelectorProps {
    selection: SelectedScenario;
    onChange: (selection: SelectedScenario) => void;
    onStart: () => void;
}

export default function ScenarioSelector({ selection, onChange, onStart }: ScenarioSelectorProps) {
    const handleChange = (field: keyof SelectedScenario, value: string) => {
        onChange({ ...selection, [field]: value });
    };

    const SelectField = ({
        label,
        field,
        options
    }: {
        label: string;
        field: keyof SelectedScenario;
        options: typeof SCENARIO_OPTIONS.timeOfDay;
    }) => (
        <div className="mb-5">
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                {label}
            </label>
            <select
                value={selection[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                className="input w-full px-4 py-3"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
                {options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="min-h-screen px-6 py-12" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <span className="label-accent">SIMUTRAIN</span>
                    <h1 className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                        Configure Scenario
                    </h1>
                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                        Set the conditions for this training encounter
                    </p>
                </div>

                {/* Selection Form */}
                <div className="card p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <SelectField
                        label="Time of Day"
                        field="timeOfDay"
                        options={SCENARIO_OPTIONS.timeOfDay}
                    />
                    <SelectField
                        label="Location"
                        field="location"
                        options={SCENARIO_OPTIONS.location}
                    />
                    <SelectField
                        label="Situation / Call Type"
                        field="situation"
                        options={SCENARIO_OPTIONS.situation}
                    />
                    <SelectField
                        label="Subject Behavior"
                        field="subjectBehavior"
                        options={SCENARIO_OPTIONS.subjectBehavior}
                    />
                </div>

                {/* Preview */}
                <div className="p-5 mb-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <span className="label-accent">SCENARIO PREVIEW</span>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {SCENARIO_OPTIONS.timeOfDay.find(o => o.id === selection.timeOfDay)?.value}.
                        You're {SCENARIO_OPTIONS.location.find(o => o.id === selection.location)?.value}.
                        {SCENARIO_OPTIONS.situation.find(o => o.id === selection.situation)?.value}.
                    </p>
                </div>

                {/* Start Button */}
                <button
                    onClick={onStart}
                    className="btn-primary w-full py-4 text-lg font-semibold"
                >
                    START SCENARIO →
                </button>
            </div>
        </div>
    );
}
