'use client';

import { type SimulationConfig } from './PackSelector';

interface BehaviorStripProps {
    config: SimulationConfig;
    behaviorDescription: string;
    isLoading: boolean;
}

export default function BehaviorStrip({ config, behaviorDescription, isLoading }: BehaviorStripProps) {
    const defaultBehavior = `${config.subject.physicalDescription}. Displaying signs of ${config.subjectPack.condition.toLowerCase()}.`;

    return (
        <div
            className="px-5 py-3 flex items-center gap-3"
            style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)',
            }}
        >
            <div
                className="w-6 h-6 flex items-center justify-center text-xs"
                style={{
                    background: isLoading ? 'var(--accent-primary)' : 'var(--bg-input)',
                    color: isLoading ? '#000' : 'var(--text-muted)',
                    transition: 'all 0.3s ease',
                }}
            >
                👤
            </div>
            <div className="flex-1">
                <span className="text-xs uppercase tracking-wider mr-2" style={{ color: 'var(--text-muted)' }}>
                    SUBJECT:
                </span>
                <span
                    className="text-sm italic"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {behaviorDescription || defaultBehavior}
                </span>
            </div>
        </div>
    );
}
