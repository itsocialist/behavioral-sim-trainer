'use client';

interface SimulationMetersProps {
    distance: number; // 1-10
    temperature: number; // 1-10 (subject agitation)
    officerTone: number; // 1-10 (trainee's approach)
    onMoveCloser: () => void;
    onStepBack: () => void;
}

export default function SimulationMeters({
    distance,
    temperature,
    officerTone,
    onMoveCloser,
    onStepBack,
}: SimulationMetersProps) {
    const getTemperatureColor = (temp: number) => {
        if (temp >= 8) return '#ef4444';
        if (temp >= 6) return '#f59e0b';
        if (temp >= 4) return '#fbbf24';
        return 'var(--accent-primary)';
    };

    const getTemperatureLabel = (temp: number) => {
        if (temp >= 8) return 'HOSTILE';
        if (temp >= 6) return 'AGITATED';
        if (temp >= 4) return 'UNEASY';
        if (temp >= 2) return 'CALM';
        return 'RELAXED';
    };

    const getDistanceLabel = (dist: number) => {
        if (dist >= 8) return 'FAR';
        if (dist >= 5) return 'SAFE';
        if (dist >= 3) return 'CLOSE';
        return 'VERY CLOSE';
    };

    const getOfficerToneColor = (tone: number) => {
        if (tone >= 8) return '#ef4444'; // Aggressive
        if (tone >= 6) return '#f59e0b'; // Firm
        if (tone >= 4) return '#fbbf24'; // Neutral
        return 'var(--accent-primary)'; // Calm
    };

    const getOfficerToneLabel = (tone: number) => {
        if (tone >= 8) return 'AGGRESSIVE';
        if (tone >= 6) return 'FIRM';
        if (tone >= 4) return 'NEUTRAL';
        if (tone >= 2) return 'CALM';
        return 'EMPATHETIC';
    };

    const MeterBar = ({ value, color, label, labelColor }: { value: number; color: string; label: string; labelColor?: string }) => (
        <div className="flex items-center gap-2">
            <div className="w-20 h-2" style={{ background: 'var(--bg-input)' }}>
                <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${value * 10}%`, background: color }}
                />
            </div>
            <span className="text-xs font-mono w-16" style={{ color: labelColor || color }}>
                {label}
            </span>
        </div>
    );

    return (
        <div
            className="flex items-center gap-5 px-4 py-2.5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
            {/* Distance Controls */}
            <div className="flex items-center gap-2">
                <div>
                    <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                        DISTANCE
                    </div>
                    <MeterBar
                        value={distance}
                        color={distance <= 2 ? '#ef4444' : 'var(--accent-primary)'}
                        label={getDistanceLabel(distance)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <button
                        onClick={onMoveCloser}
                        disabled={distance <= 1}
                        className="px-2 py-0.5 text-xs disabled:opacity-30"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                        ←
                    </button>
                    <button
                        onClick={onStepBack}
                        disabled={distance >= 10}
                        className="px-2 py-0.5 text-xs disabled:opacity-30"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="w-px h-10" style={{ background: 'var(--border-color)' }} />

            {/* Subject Agitation */}
            <div>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    SUBJECT
                </div>
                <MeterBar
                    value={temperature}
                    color={getTemperatureColor(temperature)}
                    label={getTemperatureLabel(temperature)}
                />
            </div>

            {/* Divider */}
            <div className="w-px h-10" style={{ background: 'var(--border-color)' }} />

            {/* Officer Tone */}
            <div>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                    YOUR TONE
                </div>
                <MeterBar
                    value={officerTone}
                    color={getOfficerToneColor(officerTone)}
                    label={getOfficerToneLabel(officerTone)}
                />
            </div>
        </div>
    );
}
