'use client';

import { type SimulationConfig } from './PackSelector';
import SubjectAvatar from './SubjectAvatar';

interface BehaviorStripProps {
    config: SimulationConfig;
    behaviorDescription: string;
    isLoading: boolean;
}

export default function BehaviorStrip({ config, behaviorDescription, isLoading }: BehaviorStripProps) {
    const defaultBehavior = `${config.subject.physicalDescription}. Displaying signs of ${config.subjectPack.condition.toLowerCase()}.`;

    return (
        <div
            className="px-5 py-3 flex items-center gap-4"
            style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)',
            }}
        >
            {/* Subject Avatar */}
            <SubjectAvatar
                subjectId={config.subject.id}
                subjectName={config.subject.name}
                size="small"
            />

            <div className="flex-1">
                <span className="text-xs uppercase tracking-wider mr-2" style={{ color: 'var(--text-muted)' }}>
                    {config.subject.name}:
                </span>
                <span
                    className={`text-sm italic ${isLoading ? 'animate-pulse' : ''}`}
                    style={{ color: isLoading ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                >
                    {behaviorDescription || defaultBehavior}
                </span>
            </div>
        </div>
    );
}
