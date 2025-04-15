
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AthroCharacter, AthroMessage, AthroSubject } from '@/types/athro';
import { getOpenAIResponse } from '@/lib/openai';
import { athroCharacters, getAthroById } from '@/config/athrosConfig';

// Define the shape of our context
interface AthroContextType {
  activeCharacter: AthroCharacter | null;
  setActiveCharacter: (character: AthroCharacter | null) => void;
  characters: AthroCharacter[];
  messages: AthroMessage[];
  sendMessage: (content: string) => void;
  isTyping: boolean;
  studentProgress: Record<AthroSubject, {
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
  studentProgress: {} as Record<AthroSubject, {
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
  const [messages, setMessages] = useState<AthroMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Mock student progress data (would normally come from an API)
  const [studentProgress, setStudentProgress] = useState<Record<AthroSubject, {
    confidenceScores: Record<string, number>;
    quizScores: Array<{ topic: string; score: number; date: string }>;
  }>>({
    Mathematics: {
      confidenceScores: {
        'Algebra': 7,
        'Geometry': 5,
        'Statistics': 8,
        'Trigonometry': 4
      },
      quizScores: [
        { topic: 'Algebra', score: 85, date: '2025-04-10' },
        { topic: 'Geometry', score: 72, date: '2025-04-08' },
        { topic: 'Statistics', score: 90, date: '2025-04-05' }
      ]
    },
    Science: {
      confidenceScores: {
        'Biology': 6,
        'Chemistry': 8,
        'Physics': 7
      },
      quizScores: [
        { topic: 'Biology', score: 78, date: '2025-04-12' },
        { topic: 'Chemistry', score: 85, date: '2025-04-09' }
      ]
    },
    English: {
      confidenceScores: {},
      quizScores: []
    },
    History: {
      confidenceScores: {},
      quizScores: []
    },
    Welsh: {
      confidenceScores: {},
      quizScores: []
    },
    Geography: {
      confidenceScores: {},
      quizScores: []
    },
    Languages: {
      confidenceScores: {},
      quizScores: []
    },
    RE: {
      confidenceScores: {},
      quizScores: []
    }
  });

  // Load all characters on mount
  useEffect(() => {
    // Use the athroCharacters array directly instead of calling getAllAthros
    setCharacters(athroCharacters);

    // If there's at least one character, set it as active by default
    if (athroCharacters.length > 0) {
      setActiveCharacter(athroCharacters[0]);
    }
  }, []);

  // Function to get suggested topics based on subject
  const getSuggestedTopics = (subject: AthroSubject): string[] => {
    const character = characters.find(c => c.subject === subject);
    if (!character) return [];
    
    // Return topics with lower confidence scores first
    const subjectProgress = studentProgress[subject];
    if (!subjectProgress) return character.topics.slice(0, 5);
    
    return character.topics
      .sort((a, b) => {
        const scoreA = subjectProgress.confidenceScores[a] || 5;
        const scoreB = subjectProgress.confidenceScores[b] || 5;
        return scoreA - scoreB;
      })
      .slice(0, 5);
  };

  const sendMessage = async (content: string) => {
    if (!activeCharacter || !content.trim()) return;

    // Add user message
    const userMessage: AthroMessage = {
      id: Date.now().toString(),
      senderId: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Temporary hardcoded OpenAI API key for direct usage
      const openAIApiKey = "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";
      
      // Call OpenAI with the API key
      const response = await getOpenAIResponse({
        systemPrompt: `You are ${activeCharacter.name}, an AI mentor for ${activeCharacter.subject}. Respond helpfully and professionally.`,
        userMessage: content,
        apiKey: openAIApiKey
      });
      
      const athroResponse: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter.id,
        content: response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, athroResponse]);
    } catch (error) {
      console.error("Error getting Athro response:", error);
      
      // Add fallback message
      const errorMessage: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter.id,
        content: "I'm having trouble connecting right now. Could you try again in a moment?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
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
