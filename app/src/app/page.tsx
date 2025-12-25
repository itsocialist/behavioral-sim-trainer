'use client';

import { useState } from 'react';
import PackSelector, { type SimulationConfig } from '@/components/PackSelector';
import SimulationChat from '@/components/SimulationChat';
import DebriefScreen from '@/components/DebriefScreen';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type AppState = 'select' | 'chat' | 'debrief';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('select');
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [scenarioContext, setScenarioContext] = useState('');
  const [intoxicationLevel, setIntoxicationLevel] = useState('moderate');

  const handleStartSimulation = (config: SimulationConfig) => {
    setSimulationConfig(config);
    setSessionMessages([]);
    setScenarioContext(config.scenarioPack.context);
    setIntoxicationLevel(config.subjectPack.conditionLevel);
    setAppState('chat');
  };

  const handleEndSession = (messages: Message[], context?: string, level?: string) => {
    setSessionMessages(messages);
    if (context) setScenarioContext(context);
    if (level) setIntoxicationLevel(level);
    setAppState('debrief');
  };

  const handleRestart = () => {
    setSessionMessages([]);
    setAppState('chat');
  };

  const handleNewScenario = () => {
    setSimulationConfig(null);
    setSessionMessages([]);
    setAppState('select');
  };

  // Pack Selection
  if (appState === 'select') {
    return <PackSelector onStart={handleStartSimulation} />;
  }

  // Simulation Chat
  if (appState === 'chat' && simulationConfig) {
    return (
      <SimulationChat
        config={simulationConfig}
        onEndSession={handleEndSession}
      />
    );
  }

  // Debrief
  if (appState === 'debrief' && simulationConfig) {
    return (
      <DebriefScreen
        messages={sessionMessages}
        scenarioContext={scenarioContext}
        intoxicationLevel={intoxicationLevel}
        onRestart={handleRestart}
        onNewScenario={handleNewScenario}
      />
    );
  }

  return null;
}
