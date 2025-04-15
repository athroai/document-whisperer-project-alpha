
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AthroCharacter, AthroMessage, AthroSubject } from '@/types/athro';
import { athroCharacters, getAthroById } from '@/config/athrosConfig';
import { useAthroMessages } from '@/hooks/useAthroMessages';
import { useStudentProgress } from '@/hooks/useStudentProgress';

// Define the shape of our context
interface AthroContextType {
  activeCharacter: AthroCharacter | null;
  setActiveCharacter: (character: AthroCharacter | null) => void;
  characters: AthroCharacter[];
  messages: AthroMessage[];
  sendMessage: (content: string) => void;
  isTyping: boolean;
  studentProgress: Record<string, {
    confidenceScores: Record<string, number>;
    quizScores: Array<{ topic: string; score: number; date: string }>;
  }>;
  getSuggestedTopics: (subject: AthroSubject) => string[];
}

// Create context with default values
const AthroContext = createContext<AthroContextType>({
  activeCharacter: null,
  setActiveCharacter: () => {},
  characters: [],
  messages: [],
  sendMessage: () => {},
  isTyping: false,
  studentProgress: {} as Record<string, {
    confidenceScores: Record<string, number>;
    quizScores: Array<{ topic: string; score: number; date: string }>;
  }>,
  getSuggestedTopics: () => [],
});

// Custom hook to use the context
export const useAthro = () => useContext(AthroContext);

interface AthroProviderProps {
  children: ReactNode;
}

export const AthroProvider: React.FC<AthroProviderProps> = ({ children }) => {
  const [activeCharacter, setActiveCharacter] = useState<AthroCharacter | null>(null);
  const [characters, setCharacters] = useState<AthroCharacter[]>([]);
  const { messages, isTyping, sendMessage: sendAthroMessage } = useAthroMessages();
  const { studentProgress, getSuggestedTopics: getTopics } = useStudentProgress();
  
  useEffect(() => {
    setCharacters(athroCharacters);

    if (athroCharacters.length > 0) {
      setActiveCharacter(athroCharacters[0]);
    }
  }, []);

  const getSuggestedTopics = (subject: AthroSubject): string[] => {
    const character = characters.find(c => c.subject === subject);
    if (!character) return [];
    
    return getTopics(subject, character.topics);
  };

  const sendMessage = (content: string) => {
    console.log("✅ sendMessage fired");
    
    if (!activeCharacter) return;
    sendAthroMessage(content, activeCharacter);
  };

  return (
    <AthroContext.Provider
      value={{
        activeCharacter,
        setActiveCharacter,
        characters,
        messages,
        sendMessage,
        isTyping,
        studentProgress,
        getSuggestedTopics
      }}
    >
      {children}
    </AthroContext.Provider>
  );
};
