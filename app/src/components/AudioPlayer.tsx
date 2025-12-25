'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
    text: string;
    subjectName: string;
    subjectAge: string;
    autoPlay?: boolean;
    onPlayStart?: () => void;
    onPlayEnd?: () => void;
}

export default function AudioPlayer({
    text,
    subjectName,
    subjectAge,
    autoPlay = false,
    onPlayStart,
    onPlayEnd,
}: AudioPlayerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Generate audio when text changes (if autoPlay is enabled)
    useEffect(() => {
        if (autoPlay && text) {
            generateAudio();
        }
    }, [text, autoPlay]);

    // Cleanup audio URL on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    const generateAudio = async () => {
        if (!text || isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, subjectName, subjectAge }),
            });

            if (!response.ok) throw new Error('TTS failed');

            const audioBlob = await response.blob();
            const url = URL.createObjectURL(audioBlob);

            // Cleanup previous URL
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }

            setAudioUrl(url);

            // Auto-play if requested
            if (autoPlay && audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
            }
        } catch (error) {
            console.error('Failed to generate audio:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlay = async () => {
        if (!audioUrl) {
            await generateAudio();
        }

        if (audioRef.current && audioUrl) {
            audioRef.current.src = audioUrl;
            audioRef.current.play();
        }
    };

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const handleAudioPlay = () => {
        setIsPlaying(true);
        onPlayStart?.();
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        onPlayEnd?.();
    };

    return (
        <div className="inline-flex items-center gap-1">
            <audio
                ref={audioRef}
                onPlay={handleAudioPlay}
                onEnded={handleAudioEnded}
                onPause={() => setIsPlaying(false)}
            />

            <button
                onClick={isPlaying ? handleStop : handlePlay}
                disabled={isLoading}
                className="w-6 h-6 flex items-center justify-center text-xs transition-all"
                style={{
                    background: isPlaying ? 'var(--accent-primary)' : 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: isPlaying ? '#000' : 'var(--text-muted)',
                }}
                title={isPlaying ? 'Stop' : 'Play voice'}
            >
                {isLoading ? (
                    <span className="animate-pulse">●</span>
                ) : isPlaying ? (
                    '■'
                ) : (
                    '▶'
                )}
            </button>
        </div>
    );
}
