'use client';

import { useState } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface FeedbackScreenProps {
    messages: Message[];
    scenarioName: string;
    onRestart: () => void;
    onNewScenario: () => void;
}

export default function FeedbackScreen({
    messages,
    scenarioName,
    onRestart,
    onNewScenario,
}: FeedbackScreenProps) {
    const [ratings, setRatings] = useState({
        realism: 0,
        wouldUse: 0,
        learned: 0,
    });
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleRating = (category: keyof typeof ratings, value: number) => {
        setRatings((prev) => ({ ...prev, [category]: value }));
    };

    const handleSubmit = () => {
        // In production, this would send to analytics
        console.log('Session feedback:', {
            scenarioName,
            messageCount: messages.length,
            ratings,
            feedback,
        });
        setSubmitted(true);
    };

    const RatingStars = ({
        category,
        label,
        description,
    }: {
        category: keyof typeof ratings;
        label: string;
        description: string;
    }) => (
        <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-white font-medium">{label}</p>
                    <p className="text-sm text-slate-400">{description}</p>
                </div>
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                        key={value}
                        onClick={() => handleRating(category, value)}
                        className={`w-12 h-12 rounded-lg text-lg font-medium transition-all ${ratings[category] >= value
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                    >
                        {value}
                    </button>
                ))}
            </div>
        </div>
    );

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
                <div className="max-w-lg text-center">
                    <p className="text-green-400 text-sm font-medium mb-2">✓ Submitted</p>
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Thanks for the feedback
                    </h2>
                    <p className="text-slate-400 mb-8">
                        We'll use this to make the training more realistic.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={onRestart}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={onNewScenario}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                        >
                            New Scenario
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 px-6 py-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Session Complete
                    </h2>
                    <p className="text-slate-400">
                        {scenarioName} • {messages.length} messages exchanged
                    </p>
                </div>

                {/* Ratings */}
                <div className="bg-slate-800 rounded-lg p-6 mb-6">
                    <h3 className="text-base font-medium text-white mb-6">
                        Rate this session
                    </h3>

                    <RatingStars
                        category="realism"
                        label="How realistic did this feel?"
                        description="Did it feel like a real encounter you'd have in the field?"
                    />

                    <RatingStars
                        category="wouldUse"
                        label="Would you use this for training?"
                        description="Would you recommend this to your department?"
                    />

                    <RatingStars
                        category="learned"
                        label="Did you learn something?"
                        description="Did you notice indicators you might miss in real life?"
                    />
                </div>

                {/* Open Feedback */}
                <div className="bg-slate-800 rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Additional Feedback
                    </h3>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="What could make this training more realistic or useful?"
                        className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={ratings.realism === 0}
                        className="flex-1 px-6 py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium text-lg transition-colors"
                    >
                        Submit Feedback
                    </button>
                    <button
                        onClick={onNewScenario}
                        className="px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Skip
                    </button>
                </div>
            </div>
        </div>
    );
}
