'use client';

interface SimulationMetersProps {
    distance: number; // 1-10
    temperature: number; // 1-10
    onMoveCloser: () => void;
    onStepBack: () => void;
}

export default function SimulationMeters({
    distance,
    temperature,
    onMoveCloser,
    onStepBack,
}: SimulationMetersProps) {
    const getTemperatureColor = (temp: number) => {
        if (temp >= 8) return '#ef4444'; // Red - very agitated
        if (temp >= 6) return '#f59e0b'; // Orange - tense
        if (temp >= 4) return '#fbbf24'; // Yellow - uneasy
        return 'var(--accent-primary)'; // Green - calm
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

    return (
        <div
            className="flex items-center gap-6 px-5 py-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
            {/* Distance Meter */}
            <div className="flex items-center gap-3">
                <div>
                    <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        DISTANCE
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-2" style={{ background: 'var(--bg-input)' }}>
                            <div
                                className="h-full transition-all duration-300"
                                style={{
                                    width: `${distance * 10}%`,
                                    background: distance <= 2 ? '#ef4444' : 'var(--accent-primary)',
                                }}
                            />
                        </div>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                            {getDistanceLabel(distance)}
                        </span>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={onMoveCloser}
                        disabled={distance <= 1}
                        className="px-2 py-1 text-xs font-medium disabled:opacity-30"
                        style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                        }}
                    >
                        ← CLOSER
                    </button>
                    <button
                        onClick={onStepBack}
                        disabled={distance >= 10}
                        className="px-2 py-1 text-xs font-medium disabled:opacity-30"
                        style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                        }}
                    >
                        BACK →
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8" style={{ background: 'var(--border-color)' }} />

            {/* Temperature Meter */}
            <div>
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    TENSION
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-2" style={{ background: 'var(--bg-input)' }}>
                        <div
                            className="h-full transition-all duration-300"
                            style={{
                                width: `${temperature * 10}%`,
                                background: getTemperatureColor(temperature),
                            }}
                        />
                    </div>
                    <span
                        className="text-xs font-mono"
                        style={{ color: getTemperatureColor(temperature) }}
                    >
                        {getTemperatureLabel(temperature)}
                    </span>
                </div>
            </div>
        </div>
    );
}
