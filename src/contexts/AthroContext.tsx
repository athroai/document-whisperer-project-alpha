
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { AthroCharacter, AthroSubject, AthroMessage, AthroResource, AthroStudySession } from '@/types/athro';

interface AthroContextType {
  activeCharacter: AthroCharacter | null;
  setActiveCharacter: (character: AthroCharacter) => void;
  characters: AthroCharacter[];
  messages: AthroMessage[];
  addMessage: (message: Omit<AthroMessage, 'id' | 'timestamp'>) => void;
  resources: AthroResource[];
  addResource: (resource: Omit<AthroResource, 'id' | 'uploadDate'>) => void;
  currentSession: AthroStudySession | null;
  startSession: (characterId: string, subject: AthroSubject, topic?: string) => void;
  endSession: () => void;
  isLoading: boolean;
  error: string | null;
}

const AthroContext = createContext<AthroContextType | undefined>(undefined);

export const AthroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  const [activeCharacter, setActiveCharacter] = useState<AthroCharacter | null>(null);
  const [characters, setCharacters] = useState<AthroCharacter[]>([]);
  const [messages, setMessages] = useState<AthroMessage[]>([]);
  const [resources, setResources] = useState<AthroResource[]>([]);
  const [currentSession, setCurrentSession] = useState<AthroStudySession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load characters on initialization
  useEffect(() => {
    const loadCharacters = async () => {
      setIsLoading(true);
      try {
        // This would be a Firestore/API call in production
        const mockCharacters: AthroCharacter[] = [
          {
            id: 'athro-maths',
            name: 'AthroMaths',
            subject: 'Mathematics',
            avatarUrl: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png',
            shortDescription: 'Your GCSE Maths mentor',
            fullDescription: 'AthroMaths helps you understand mathematical concepts, solve problems, and prepare for your GCSE exams with personalized guidance.',
            tone: 'logical, clear, and encouraging',
            supportsMathNotation: true,
            topics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Probability', 'Number Theory'],
            examBoards: ['wjec', 'aqa', 'ocr']
          }
          // More characters will be added as they are developed
        ];
        
        setCharacters(mockCharacters);
        
        // Set default active character if none is set
        if (!activeCharacter && mockCharacters.length > 0) {
          setActiveCharacter(mockCharacters[0]);
        }
      } catch (err) {
        setError('Failed to load Athro characters');
        console.error('Error loading Athro characters:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, []);

  // Start a new study session
  const startSession = (characterId: string, subject: AthroSubject, topic?: string) => {
    const character = characters.find(c => c.id === characterId);
    
    if (!character) {
      setError('Character not found');
      return;
    }

    if (!authState.user) {
      setError('User not authenticated');
      return;
    }

    const newSession: AthroStudySession = {
      id: `session-${Date.now()}`,
      studentId: authState.user.id,
      characterId,
      subject,
      topic,
      examBoard: authState.user.examBoard || 'none',
      messages: [],
      startTime: new Date().toISOString(),
      confidenceStart: undefined
    };

    setCurrentSession(newSession);
    setMessages([]);
    
    // Add welcome message from character
    const welcomeMessage: AthroMessage = {
      id: `msg-${Date.now()}`,
      senderId: characterId,
      content: `Hello! I'm ${character.name}, your ${subject} mentor. ${topic ? `Let's work on ${topic} today.` : 'How can I help you with your studies today?'}`,
      timestamp: new Date().toISOString()
    };
    
    setMessages([welcomeMessage]);
  };

  // End current study session
  const endSession = () => {
    if (currentSession) {
      const endedSession = {
        ...currentSession,
        endTime: new Date().toISOString(),
        messages: [...messages]
      };
      
      // Here you would save the session to Firestore/backend
      console.log('Session ended:', endedSession);
      
      setCurrentSession(null);
    }
  };

  // Add a message to the current session
  const addMessage = (messageData: Omit<AthroMessage, 'id' | 'timestamp'>) => {
    const newMessage: AthroMessage = {
      ...messageData,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    
    // If it's a user message, simulate Athro response
    if (messageData.senderId === 'user' && activeCharacter) {
      // This would be replaced with an actual API call to the LLM
      simulateAthroResponse(newMessage.content);
    }
  };

  // Simulate Athro response (for development)
  const simulateAthroResponse = (userMessage: string) => {
    if (!activeCharacter) return;
    
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const responseMessage: AthroMessage = {
        id: `msg-${Date.now()}`,
        senderId: activeCharacter.id,
        content: generateMockResponse(userMessage, activeCharacter),
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, responseMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Mock response generator (temporary, would be replaced with actual AI)
  const generateMockResponse = (userMessage: string, character: AthroCharacter): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (character.subject === 'Mathematics') {
      if (lowerMessage.includes('algebra')) {
        return "Algebra is about using letters to represent numbers in equations. Let's work through some examples together. What specific algebraic concept are you struggling with?";
      } else if (lowerMessage.includes('geometry')) {
        return "Geometry involves shapes, sizes, and the properties of space. Would you like to focus on 2D shapes like circles and triangles, or 3D shapes like spheres and prisms?";
      } else if (lowerMessage.includes('help')) {
        return "I'm here to help with your mathematics studies! We can work on specific problems, review concepts, or practice past paper questions. What would you like to focus on?";
      }
    }
    
    return `I understand you're asking about ${userMessage}. Let's explore that topic together. What specific aspects would you like to understand better?`;
  };

  // Add a resource
  const addResource = (resourceData: Omit<AthroResource, 'id' | 'uploadDate'>) => {
    const newResource: AthroResource = {
      ...resourceData,
      id: `resource-${Date.now()}`,
      uploadDate: new Date().toISOString()
    };

    setResources(prev => [...prev, newResource]);
  };

  const value = {
    activeCharacter,
    setActiveCharacter,
    characters,
    messages,
    addMessage,
    resources,
    addResource,
    currentSession,
    startSession,
    endSession,
    isLoading,
    error
  };

  return <AthroContext.Provider value={value}>{children}</AthroContext.Provider>;
};

export const useAthro = () => {
  const context = useContext(AthroContext);
  if (context === undefined) {
    throw new Error('useAthro must be used within an AthroProvider');
  }
  return context;
};
