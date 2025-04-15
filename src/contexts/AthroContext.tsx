import React, { createContext, useContext, useState, useEffect } from 'react';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import { AthroCharacterConfig, SubjectData } from '@/types/athroCharacter';
import { athroCharacters } from '@/config/athrosConfig';
import { mockAthroResponse } from '@/services/athroService';

// Mock data for student progress in different subjects
const mockStudentProgress: Record<string, SubjectData> = {
  'Mathematics': {
    recentTopics: ['Algebra', 'Trigonometry', 'Statistics'],
    confidenceScores: {
      'Algebra': 7,
      'Geometry': 5,
      'Trigonometry': 6,
      'Statistics': 4,
      'Probability': 8,
      'Number Theory': 7
    },
    studyTime: {
      'Algebra': 120,
      'Geometry': 90,
      'Trigonometry': 60,
      'Statistics': 45,
      'Probability': 30,
      'Number Theory': 15
    },
    quizScores: [
      { topic: 'Algebra', score: 80, date: '2023-02-15' },
      { topic: 'Geometry', score: 65, date: '2023-02-20' },
      { topic: 'Statistics', score: 75, date: '2023-03-05' }
    ]
  },
  'Science': {
    recentTopics: ['Biology', 'Chemistry', 'Physics'],
    confidenceScores: {
      'Biology': 6,
      'Chemistry': 4,
      'Physics': 7,
      'Earth Science': 5,
      'Ecology': 8,
      'Astronomy': 9
    },
    studyTime: {
      'Biology': 110,
      'Chemistry': 95,
      'Physics': 85,
      'Earth Science': 40,
      'Ecology': 30,
      'Astronomy': 20
    },
    quizScores: [
      { topic: 'Biology', score: 75, date: '2023-02-10' },
      { topic: 'Chemistry', score: 60, date: '2023-02-25' },
      { topic: 'Physics', score: 85, date: '2023-03-10' }
    ]
  }
};

interface AthroContextProps {
  characters: AthroCharacter[];
  activeCharacter: AthroCharacter | null;
  messages: AthroMessage[];
  setActiveCharacter: (character: AthroCharacter | AthroCharacterConfig) => void;
  sendMessage: (content: string) => void;
  isTyping: boolean;
  studentProgress: Record<string, SubjectData>;
  getTopicConfidence: (subject: string, topic: string) => number;
  getSuggestedTopics: (subject: string) => string[];
}

const AthroContext = createContext<AthroContextProps | undefined>(undefined);

export const AthroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Convert config-based characters to AthroCharacter type
  const convertedCharacters: AthroCharacter[] = athroCharacters.map(config => ({
    id: config.id,
    name: config.name,
    subject: config.subject,
    avatarUrl: config.avatarUrl,
    shortDescription: config.shortDescription,
    fullDescription: config.fullDescription,
    tone: config.tone,
    supportsMathNotation: config.supportsMathNotation || false,
    supportsSpecialCharacters: config.supportsSpecialCharacters || false,
    supportedLanguages: config.supportedLanguages || [],
    topics: config.topics,
    examBoards: config.examBoards,
  }));

  const [characters] = useState<AthroCharacter[]>(convertedCharacters);
  const [activeCharacter, setActiveCharacterState] = useState<AthroCharacter | null>(null);
  const [messages, setMessages] = useState<AthroMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [studentProgress] = useState<Record<string, SubjectData>>(mockStudentProgress);

  useEffect(() => {
    // Set default character when the component mounts
    if (characters.length > 0 && !activeCharacter) {
      setActiveCharacterState(characters[0]);
    }
  }, [characters, activeCharacter]);

  const setActiveCharacter = (character: AthroCharacter | AthroCharacterConfig) => {
    // Clear messages when changing character
    setMessages([]);
    
    // If we received a config, convert it to an AthroCharacter
    if ('promptTemplate' in character) {
      const convertedChar: AthroCharacter = {
        id: character.id,
        name: character.name,
        subject: character.subject,
        avatarUrl: character.avatarUrl,
        shortDescription: character.shortDescription,
        fullDescription: character.fullDescription,
        tone: character.tone,
        supportsMathNotation: character.supportsMathNotation || false,
        supportsSpecialCharacters: character.supportsSpecialCharacters || false,
        supportedLanguages: character.supportedLanguages || [],
        topics: character.topics,
        examBoards: character.examBoards,
      };
      setActiveCharacterState(convertedChar);
      
      // Add welcome message from this character
      addWelcomeMessage(convertedChar);
    } else {
      setActiveCharacterState(character);
      
      // Add welcome message from this character
      addWelcomeMessage(character);
    }
  };
  
  const addWelcomeMessage = (character: AthroCharacter) => {
    const welcomeMessage: AthroMessage = {
      id: Date.now().toString(),
      senderId: character.id,
      content: `Hello! I'm ${character.name}, your ${character.subject} mentor. How can I help you today?`,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([welcomeMessage]);
  };

  const getTopicConfidence = (subject: string, topic: string): number => {
    const subjectData = studentProgress[subject];
    if (!subjectData || !subjectData.confidenceScores || !subjectData.confidenceScores[topic]) {
      return 5; // Default confidence
    }
    return subjectData.confidenceScores[topic];
  };

  const getSuggestedTopics = (subject: string): string[] => {
    const subjectData = studentProgress[subject];
    if (!subjectData) {
      return [];
    }
    
    // Get topics with low confidence scores
    const lowConfidenceTopics = Object.entries(subjectData.confidenceScores || {})
      .filter(([_, score]) => typeof score === 'number' && score < 6)
      .map(([topic]) => topic)
      .slice(0, 2);
    
    // Get recent topics
    const recentTopics = subjectData.recentTopics?.slice(0, 2) || [];
    
    // Combine and deduplicate
    return [...new Set([...lowConfidenceTopics, ...recentTopics])];
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
      // Call our mock service
      const response = await mockAthroResponse(
        content,
        activeCharacter.subject,
        activeCharacter.examBoards[0]
      );
      
      setMessages(prev => [...prev, response]);
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
    <AthroContext.Provider value={{
      characters,
      activeCharacter,
      messages,
      setActiveCharacter,
      sendMessage,
      isTyping,
      studentProgress,
      getTopicConfidence,
      getSuggestedTopics,
    }}>
      {children}
    </AthroContext.Provider>
  );
};

export const useAthro = () => {
  const context = useContext(AthroContext);
  if (context === undefined) {
    throw new Error('useAthro must be used within an AthroProvider');
  }
  return context;
};
