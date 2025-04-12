
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import { AthroCharacterConfig, SubjectData } from '@/types/athroCharacter';
import { athroCharacters } from '@/config/athrosConfig';

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
  setActiveCharacter: (character: AthroCharacter) => void;
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
  const [activeCharacter, setActiveCharacter] = useState<AthroCharacter | null>(null);
  const [messages, setMessages] = useState<AthroMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [studentProgress] = useState<Record<string, SubjectData>>(mockStudentProgress);

  useEffect(() => {
    // Set default character when the component mounts
    if (characters.length > 0 && !activeCharacter) {
      setActiveCharacter(characters[0]);
    }
  }, [characters, activeCharacter]);

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

  const sendMessage = (content: string) => {
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
    
    // Simulate AI response (this would call your AI service in production)
    setTimeout(() => {
      const subject = activeCharacter.subject;
      const mockResponse = generateMockResponse(content, subject);
      
      const athroMessage: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter.id,
        content: mockResponse,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, athroMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateMockResponse = (userMessage: string, subject: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! I'm your ${subject} study mentor. How can I help you today?`;
    }
    
    if (lowerMessage.includes('help')) {
      return `I'd be happy to help with your ${subject} studies. What specific topic are you working on right now?`;
    }
    
    if (subject === 'Mathematics' && (lowerMessage.includes('algebra') || lowerMessage.includes('equation'))) {
      return "Algebra is all about finding the unknown. Let's work through this problem step by step. Could you share the specific equation you're working on?";
    }
    
    if (subject === 'Science' && (lowerMessage.includes('biology') || lowerMessage.includes('cell'))) {
      return "The cell is the fundamental unit of life. Would you like to explore cell structure, function, or perhaps a specific organelle?";
    }
    
    return `That's an interesting question about ${subject}. To help you better, could you tell me what specific aspect you're studying?`;
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
