import React, { createContext, useContext, useState, useEffect } from 'react';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import { useAthroCharacters } from '@/hooks/useAthroCharacters';
import { athroCharacters as defaultCharacters } from '@/config/athrosConfig';
import { standardizeAthroCharacters } from '@/utils/athroHelpers';

interface StudentProgressType {
  [subject: string]: {
    confidenceScores: {
      [topic: string]: number;
    };
    quizScores: {
      topic: string;
      score: number;
      date: string;
    }[];
  };
}

interface AthroContextType {
  characters: AthroCharacter[];
  selectedCharacter: AthroCharacter | null;
  setSelectedCharacter: (character: AthroCharacter | null) => void;
  isLoading: boolean;
  getCharacterById: (id: string) => AthroCharacter | null;
  getCharacterBySubject: (subject: string) => AthroCharacter | null;
  activeCharacter: AthroCharacter | null;
  setActiveCharacter: (character: AthroCharacter | null) => void;
  messages: AthroMessage[];
  sendMessage: (message: string) => void;
  isTyping: boolean;
  studentProgress: StudentProgressType;
  getSuggestedTopics: (subject: string) => string[];
  clearMessages: () => void;
}

const AthroContext = createContext<AthroContextType>({
  characters: [],
  selectedCharacter: null,
  setSelectedCharacter: () => {},
  isLoading: true,
  getCharacterById: () => null,
  getCharacterBySubject: () => null,
  activeCharacter: null,
  setActiveCharacter: () => {},
  messages: [],
  sendMessage: () => {},
  isTyping: false,
  studentProgress: {},
  getSuggestedTopics: () => [],
  clearMessages: () => {},
});

export const useAthro = () => useContext(AthroContext);

export const AthroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const convertedDefaultChars = standardizeAthroCharacters(defaultCharacters);

  const { characters: fetchedCharacters, isLoading } = useAthroCharacters();
  const [characters, setCharacters] = useState<AthroCharacter[]>(convertedDefaultChars);
  const [selectedCharacter, setSelectedCharacter] = useState<AthroCharacter | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<AthroCharacter | null>(null);
  const [messages, setMessages] = useState<AthroMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [studentProgress, setStudentProgress] = useState<StudentProgressType>({
    Mathematics: {
      confidenceScores: {
        Algebra: 7,
        Geometry: 5,
        Statistics: 6,
        Number: 8
      },
      quizScores: [
        { topic: 'Algebra', score: 80, date: '2025-04-10' },
        { topic: 'Geometry', score: 65, date: '2025-04-15' }
      ]
    },
    Science: {
      confidenceScores: {
        Biology: 6,
        Chemistry: 4,
        Physics: 7
      },
      quizScores: [
        { topic: 'Biology', score: 75, date: '2025-04-12' },
        { topic: 'Physics', score: 70, date: '2025-04-14' }
      ]
    }
  });

  useEffect(() => {
    if (fetchedCharacters.length > 0 && !isLoading) {
      setCharacters(standardizeAthroCharacters(fetchedCharacters));
      
      if (!selectedCharacter) {
        setSelectedCharacter(standardizeAthroCharacters(fetchedCharacters)[0]);
      }
    }
  }, [fetchedCharacters, isLoading, selectedCharacter]);

  const getCharacterById = (id: string): AthroCharacter | null => {
    return characters.find(character => character.id === id) || null;
  };

  const getCharacterBySubject = (subject: string): AthroCharacter | null => {
    const lowercaseSubject = subject.toLowerCase();
    return characters.find(character => character.subject.toLowerCase() === lowercaseSubject) || null;
  };

  const sendMessage = (message: string) => {
    if (!activeCharacter) return;
    
    const newMessage: AthroMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      senderId: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    setIsTyping(true);
    
    setTimeout(() => {
      const responseMessage: AthroMessage = {
        id: `athro-${Date.now()}`,
        role: 'assistant',
        senderId: activeCharacter.id,
        content: `This is a placeholder response to: "${message}". In production, this would be a real response from the ${activeCharacter.name} character.`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, responseMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  const getSuggestedTopics = (subject: string): string[] => {
    const character = getCharacterBySubject(subject);
    return character?.topics || [];
  };
  
  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <AthroContext.Provider
      value={{
        characters,
        selectedCharacter,
        setSelectedCharacter,
        isLoading,
        getCharacterById,
        getCharacterBySubject,
        activeCharacter,
        setActiveCharacter,
        messages,
        sendMessage,
        isTyping,
        studentProgress,
        getSuggestedTopics,
        clearMessages,
      }}
    >
      {children}
    </AthroContext.Provider>
  );
};
