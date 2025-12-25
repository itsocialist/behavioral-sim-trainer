'use client';

import { useState } from 'react';
import {
    TRAINING_PACKS,
    type TrainingPack,
    type SubjectPack,
    type ScenarioPack,
    type SubjectProfile,
    getRandomSubject
} from '@/lib/packs/trainingPacks';

export interface SimulationConfig {
    trainingPack: TrainingPack;
    subjectPack: SubjectPack;
    scenarioPack: ScenarioPack;
    subject: SubjectProfile;
}

interface PackSelectorProps {
    onStart: (config: SimulationConfig) => void;
}

export default function PackSelector({ onStart }: PackSelectorProps) {
    const [selectedTrainingPack, setSelectedTrainingPack] = useState<TrainingPack | null>(null);
    const [selectedSubjectPack, setSelectedSubjectPack] = useState<SubjectPack | null>(null);
    const [selectedScenarioPack, setSelectedScenarioPack] = useState<ScenarioPack | null>(null);

    const handleTrainingPackSelect = (pack: TrainingPack) => {
        setSelectedTrainingPack(pack);
        setSelectedSubjectPack(null);
        setSelectedScenarioPack(null);
    };

    const handleStart = () => {
        if (!selectedTrainingPack || !selectedSubjectPack || !selectedScenarioPack) return;

        const subject = getRandomSubject(selectedSubjectPack);
        onStart({
            trainingPack: selectedTrainingPack,
            subjectPack: selectedSubjectPack,
            scenarioPack: selectedScenarioPack,
            subject,
        });
    };

    const canStart = selectedTrainingPack && selectedSubjectPack && selectedScenarioPack;

    return (
        <div className="min-h-screen px-6 py-10" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <span className="label-accent">SIMUTRAIN</span>
                    <h1 className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                        Select Training Pack
                    </h1>
                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                        Choose your role, subject type, and scenario
                    </p>
                </div>

                {/* Training Pack Selection */}
                <div className="mb-8">
                    <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                        Training Pack
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        {TRAINING_PACKS.map((pack) => (
                            <button
                                key={pack.id}
                                onClick={() => handleTrainingPackSelect(pack)}
                                className="p-5 text-left transition-all"
                                style={{
                                    background: selectedTrainingPack?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                    border: `1px solid ${selectedTrainingPack?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                }}
                            >
                                <div className="text-2xl mb-2">{pack.icon}</div>
                                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pack.name}</div>
                                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pack.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subject Pack Selection */}
                {selectedTrainingPack && (
                    <div className="mb-8">
                        <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                            Subject Type
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {selectedTrainingPack.subjectPacks.map((pack) => (
                                <button
                                    key={pack.id}
                                    onClick={() => setSelectedSubjectPack(pack)}
                                    className="p-5 text-left transition-all"
                                    style={{
                                        background: selectedSubjectPack?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                        border: `1px solid ${selectedSubjectPack?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                    }}
                                >
                                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pack.name}</div>
                                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pack.condition}</div>
                                    <div
                                        className="text-xs mt-2 inline-block px-2 py-0.5"
                                        style={{
                                            background: pack.conditionLevel === 'severe' ? 'rgba(239,68,68,0.2)' :
                                                pack.conditionLevel === 'moderate' ? 'rgba(245,158,11,0.2)' : 'rgba(63,212,151,0.2)',
                                            color: pack.conditionLevel === 'severe' ? '#ef4444' :
                                                pack.conditionLevel === 'moderate' ? '#f59e0b' : 'var(--accent-primary)',
                                        }}
                                    >
                                        {pack.conditionLevel.toUpperCase()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Scenario Pack Selection */}
                {selectedSubjectPack && (
                    <div className="mb-8">
                        <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                            Scenario
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {selectedTrainingPack?.scenarioPacks.map((pack) => (
                                <button
                                    key={pack.id}
                                    onClick={() => setSelectedScenarioPack(pack)}
                                    className="p-5 text-left transition-all"
                                    style={{
                                        background: selectedScenarioPack?.id === pack.id ? 'var(--bg-card)' : 'var(--bg-secondary)',
                                        border: `1px solid ${selectedScenarioPack?.id === pack.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pack.name}</div>
                                            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{pack.description}</div>
                                        </div>
                                        <div className="text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                                            <div>Distance: {pack.initialDistance}/10</div>
                                            <div>Tension: {pack.initialTemperature}/10</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Preview */}
                {canStart && (
                    <div className="p-5 mb-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <span className="label-accent">SIMULATION PREVIEW</span>
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Role</div>
                                <div style={{ color: 'var(--text-primary)' }}>{selectedTrainingPack?.targetRole}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Subject Condition</div>
                                <div style={{ color: 'var(--text-primary)' }}>{selectedSubjectPack?.condition}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Scenario</div>
                                <div style={{ color: 'var(--text-primary)' }}>{selectedScenarioPack?.name}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Start Button */}
                <button
                    onClick={handleStart}
                    disabled={!canStart}
                    className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {canStart ? 'START SIMULATION →' : 'SELECT ALL OPTIONS TO START'}
                </button>
            </div>
        </div>
    );
}
