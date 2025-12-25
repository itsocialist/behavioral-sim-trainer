'use client';

import { useState, useRef, useEffect } from 'react';
import { type SelectedScenario, SCENARIO_OPTIONS } from '@/lib/scenarios/config';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatInterfaceProps {
    sessionId: string;
    scenarioSelection: SelectedScenario;
    onEndSession: (messages: Message[], scenarioContext: string, intoxicationLevel: string) => void;
}

export default function ChatInterface({
    sessionId,
    scenarioSelection,
    onEndSession,
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [sessionTime, setSessionTime] = useState(0);
    const [scenarioContext, setScenarioContext] = useState('');
    const [intoxicationLevel, setIntoxicationLevel] = useState('moderate');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    useEffect(() => {
        const timer = setInterval(() => setSessionTime((t) => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getScenarioLabel = () => {
        const situation = SCENARIO_OPTIONS.situation.find(o => o.id === scenarioSelection.situation);
        return situation?.label || 'Training Scenario';
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setStreamingContent('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    sessionId,
                    scenarioSelection,
                }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value);
                    const lines = text.split('\n').filter(Boolean);

                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);

                            if (data.type === 'meta') {
                                if (data.scenarioContext) setScenarioContext(data.scenarioContext);
                                if (data.intoxicationLevel) setIntoxicationLevel(data.intoxicationLevel);
                            } else if (data.type === 'content') {
                                fullContent += data.content;
                                setStreamingContent(fullContent);
                            } else if (data.type === 'done') {
                                const assistantMessage: Message = {
                                    role: 'assistant',
                                    content: fullContent,
                                    timestamp: new Date(),
                                };
                                setMessages((prev) => [...prev, assistantMessage]);
                                setStreamingContent('');
                            }
                        } catch {
                            // Skip malformed JSON
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="border-b px-6 py-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between items-center max-w-4xl mx-auto">
                    <div>
                        <span className="label-accent">ACTIVE SCENARIO</span>
                        <h1 className="text-lg font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
                            {getScenarioLabel()}
                        </h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>TIME</span>
                            <span className="ml-2 font-mono" style={{ color: 'var(--accent-primary)' }}>{formatTime(sessionTime)}</span>
                        </div>
                        <button
                            onClick={() => onEndSession(messages, scenarioContext, intoxicationLevel)}
                            className="btn-primary px-5 py-2.5 text-sm font-semibold"
                        >
                            END SESSION →
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 && !streamingContent && (
                        <div className="text-center py-16">
                            <div className="label-accent mb-3">SIMULATION READY</div>
                            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                                Initiate contact with the subject
                            </p>
                            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                                Type your opening statement as you would in the field
                            </p>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex items-start gap-3 max-w-[80%]">
                                    <div
                                        className="w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                                    >
                                        S
                                    </div>
                                    <div
                                        className="msg-assistant px-5 py-4"
                                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                                    >
                                        <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {message.role === 'user' && (
                                <div className="flex items-start gap-3 max-w-[80%]">
                                    <div
                                        className="msg-user px-5 py-4"
                                        style={{ background: 'var(--accent-primary)', color: '#000' }}
                                    >
                                        <p className="whitespace-pre-wrap leading-relaxed font-medium">
                                            {message.content}
                                        </p>
                                    </div>
                                    <div
                                        className="w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{ background: 'var(--accent-primary)', color: '#000' }}
                                    >
                                        O
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Streaming content */}
                    {streamingContent && (
                        <div className="flex justify-start">
                            <div className="flex items-start gap-3 max-w-[80%]">
                                <div
                                    className="w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0 animate-pulse-glow"
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                                >
                                    S
                                </div>
                                <div
                                    className="px-5 py-4"
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                                >
                                    <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                        {streamingContent}
                                        <span className="animate-pulse-glow" style={{ color: 'var(--accent-primary)' }}>▋</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && !streamingContent && (
                        <div className="flex justify-start">
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-8 h-8 flex items-center justify-center text-xs font-bold animate-pulse-glow"
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                                >
                                    S
                                </div>
                                <div
                                    className="px-5 py-3"
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                                >
                                    <span style={{ color: 'var(--accent-primary)' }}>●●●</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t px-6 py-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <div className="max-w-3xl mx-auto flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter your response to the subject..."
                        className="input flex-1 px-5 py-3"
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="btn-primary px-8 py-3 font-semibold"
                    >
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
}
