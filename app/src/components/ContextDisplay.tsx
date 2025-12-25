'use client';

import { type SimulationConfig } from './PackSelector';

interface ContextDisplayProps {
    config: SimulationConfig;
}

export default function ContextDisplay({ config }: ContextDisplayProps) {
    return (
        <div
            className="px-5 py-4"
            style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}
        >
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-4 gap-6 text-sm">
                    {/* Scenario */}
                    <div>
                        <div className="label-accent text-xs">SCENARIO</div>
                        <div className="mt-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                            {config.scenarioPack.name}
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <div className="label-accent text-xs">SUBJECT</div>
                        <div className="mt-1" style={{ color: 'var(--text-primary)' }}>
                            <span className="font-medium">{config.subject.name}</span>
                            <span style={{ color: 'var(--text-muted)' }}> ({config.subject.age})</span>
                        </div>
                    </div>

                    {/* Condition */}
                    <div>
                        <div className="label-accent text-xs">CONDITION</div>
                        <div className="mt-1" style={{ color: 'var(--text-primary)' }}>
                            {config.subjectPack.condition}
                            <span
                                className="ml-2 text-xs px-1.5 py-0.5"
                                style={{
                                    background: config.subjectPack.conditionLevel === 'severe' ? 'rgba(239,68,68,0.2)' :
                                        config.subjectPack.conditionLevel === 'moderate' ? 'rgba(245,158,11,0.2)' : 'rgba(63,212,151,0.2)',
                                    color: config.subjectPack.conditionLevel === 'severe' ? '#ef4444' :
                                        config.subjectPack.conditionLevel === 'moderate' ? '#f59e0b' : 'var(--accent-primary)',
                                }}
                            >
                                {config.subjectPack.conditionLevel.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Your Role */}
                    <div>
                        <div className="label-accent text-xs">YOUR ROLE</div>
                        <div className="mt-1 font-medium" style={{ color: 'var(--accent-primary)' }}>
                            {config.trainingPack.targetRole}
                        </div>
                    </div>
                </div>

                {/* Scenario Context */}
                <div className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {config.scenarioPack.context}
                </div>
            </div>
        </div>
    );
}
