
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AthroCharacter, AthroMessage, AthroSubject } from '@/types/athro';
import { athroCharacters, getAthroById } from '@/config/athrosConfig';
import { useAthroMessages } from '@/hooks/useAthroMessages';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { toast } from '@/hooks/use-toast';

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
  const { messages, isTyping, sendMessage: sendAthroMessage, clearMessages } = useAthroMessages();
  const { studentProgress, getSuggestedTopics: getTopics } = useStudentProgress();
  
  // Initialize characters
  useEffect(() => {
    console.log('Setting up Athro characters');
    try {
      setCharacters(athroCharacters);

      if (athroCharacters.length > 0) {
        console.log('Setting active character to:', athroCharacters[0]);
        setActiveCharacter(athroCharacters[0]);
      }
    } catch (error) {
      console.error('Error setting up Athro characters:', error);
      toast({
        title: "Setup Error",
        description: "Failed to initialize Athro characters. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, []);

  // Monitor active character changes
  useEffect(() => {
    if (activeCharacter) {
      console.log('Active character changed:', activeCharacter.name);
      clearMessages(); // Clear messages when changing characters
    }
  }, [activeCharacter, clearMessages]);

  const getSuggestedTopics = (subject: AthroSubject): string[] => {
    const character = characters.find(c => c.subject === subject);
    if (!character) return [];
    
    return getTopics(subject, character.topics);
  };

  const sendMessage = (content: string) => {
    console.log("✅ SEND MESSAGE TRIGGERED with content:", content);
    console.log("Active character:", activeCharacter);
    
    if (!activeCharacter) {
      console.warn("No active character to send message to");
      toast({
        title: "No Character Selected",
        description: "Please select a subject character first.",
      });
      return;
    }
    
    try {
      sendAthroMessage(content, activeCharacter);
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast({
        title: "Message Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    }
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
