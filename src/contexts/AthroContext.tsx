
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { AthroCharacter, AthroMessage, AthroSubject } from '@/types/athro';
import { athroCharacters, getAthroById } from '@/config/athrosConfig';
import { useAthroMessages } from '@/hooks/useAthroMessages';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { toast } from '@/hooks/use-toast';

interface AthroContextType {
  activeCharacter: AthroCharacter | null;
  setActiveCharacter: (character: AthroCharacter | null) => void;
  characters: AthroCharacter[];
  messages: AthroMessage[];
  sendMessage: (content: string, character?: AthroCharacter | null) => void;
  isTyping: boolean;
  studentProgress: Record<string, {
    confidenceScores: Record<string, number>;
    quizScores: Array<{ topic: string; score: number; date: string }>;
  }>;
  getSuggestedTopics: (subject: AthroSubject) => string[];
}

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

export const useAthro = () => useContext(AthroContext);

interface AthroProviderProps {
  children: ReactNode;
}

export const AthroProvider: React.FC<AthroProviderProps> = ({ children }) => {
  const [activeCharacter, setActiveCharacter] = useState<AthroCharacter | null>(null);
  const [characters, setCharacters] = useState<AthroCharacter[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { messages, isTyping, sendMessage: sendAthroMessage, clearMessages } = useAthroMessages();
  const { studentProgress, getSuggestedTopics: getTopics } = useStudentProgress();
  const characterInitialized = useRef(false);
  
  // Debug mount/unmount cycles to detect potential issues
  useEffect(() => {
    console.log('📊 AthroProvider mounted');
    return () => {
      console.log('📊 AthroProvider unmounted');
    };
  }, []);
  
  // Initialize Athro characters only once
  useEffect(() => {
    if (isInitialized) {
      console.log('🛑 Preventing duplicate initialization of Athro characters');
      return;
    }
    
    console.log('🚀 Initializing Athro characters');
    
    try {
      // Load characters from the config
      const charactersData = athroCharacters;
      console.log('📋 Loaded characters:', charactersData.map(c => c.name).join(', '));
      setCharacters(charactersData);

      if (charactersData.length > 0) {
        console.log('🎯 Setting initial active character:', charactersData[0].name);
        setActiveCharacter(charactersData[0]);
        characterInitialized.current = true;
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('🔥 Error setting up Athro characters:', error);
      toast({
        title: "Setup Error",
        description: "Failed to initialize Athro characters. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, []);

  const memoizedClearMessages = useCallback(() => {
    console.log('🧹 Clearing messages from context');
    clearMessages();
  }, [clearMessages]);

  // Clear messages when active character changes
  useEffect(() => {
    if (activeCharacter && characterInitialized.current) {
      console.log('👤 Active character changed to:', activeCharacter.name);
      memoizedClearMessages();
    }
  }, [activeCharacter, memoizedClearMessages]);

  const getSuggestedTopics = useCallback((subject: AthroSubject): string[] => {
    const character = characters.find(c => c.subject === subject);
    if (!character) return [];
    
    return getTopics(subject, character.topics);
  }, [characters, getTopics]);

  const sendMessage = useCallback((content: string, character: AthroCharacter | null = null) => {
    console.log("✉️ SEND MESSAGE TRIGGERED with content:", content);
    
    const charToUse = character || activeCharacter;
    
    if (!charToUse) {
      console.warn("❌ No active character to send message to");
      toast({
        title: "No Character Selected",
        description: "Please select a subject character first.",
      });
      return;
    }
    
    try {
      console.log("📨 Sending message to:", charToUse.name);
      sendAthroMessage(content, charToUse);
    } catch (error) {
      console.error("💥 Error in sendMessage:", error);
      toast({
        title: "Message Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    }
  }, [activeCharacter, sendAthroMessage]);

  // Log current state for debugging
  useEffect(() => {
    console.log('Current context state:', {
      activeCharacter: activeCharacter?.name || 'None',
      characterCount: characters.length,
      messageCount: messages.length,
      isTyping,
      initialized: isInitialized
    });
  }, [activeCharacter, characters, messages, isTyping, isInitialized]);

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
