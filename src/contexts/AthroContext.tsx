
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useStudentRecord } from './StudentRecordContext';
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
  studentPerformance: {
    confidenceByTopic: Record<string, number>;
    recentQuizScores: { date: string, score: number }[];
    suggestedTopics: string[];
  };
  referencedResources: AthroResource[];
  setReferencedResources: (resources: AthroResource[]) => void;
}

const AthroContext = createContext<AthroContextType | undefined>(undefined);

export const AthroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  const studentRecord = useStudentRecord();
  
  const [activeCharacter, setActiveCharacter] = useState<AthroCharacter | null>(null);
  const [characters, setCharacters] = useState<AthroCharacter[]>([]);
  const [messages, setMessages] = useState<AthroMessage[]>([]);
  const [resources, setResources] = useState<AthroResource[]>([]);
  const [referencedResources, setReferencedResources] = useState<AthroResource[]>([]);
  const [currentSession, setCurrentSession] = useState<AthroStudySession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [studentPerformance, setStudentPerformance] = useState({
    confidenceByTopic: {} as Record<string, number>,
    recentQuizScores: [] as { date: string, score: number }[],
    suggestedTopics: [] as string[]
  });

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
          },
          {
            id: 'athro-science',
            name: 'AthroScience',
            subject: 'Science',
            avatarUrl: '/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png',
            shortDescription: 'Your GCSE Science companion',
            fullDescription: 'AthroScience guides you through biology, chemistry, and physics concepts with clear explanations and exam-focused practice.',
            tone: 'curious, precise, and explanatory',
            supportsMathNotation: true,
            topics: ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Ecology', 'Scientific Method'],
            examBoards: ['wjec', 'aqa', 'ocr']
          }
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

  // When active character changes, update student performance data
  useEffect(() => {
    if (activeCharacter && studentRecord) {
      try {
        const subject = activeCharacter.subject.toLowerCase();
        const subjectRecord = studentRecord.studentRecord[subject];
        
        if (subjectRecord) {
          // Get confidence scores for topics in this subject
          const confidenceByTopic = subjectRecord.quizScores.length > 0
            ? { ...subjectRecord.confidenceScores }
            : activeCharacter.topics.reduce((acc, topic) => {
                acc[topic] = 5; // Default confidence if no data
                return acc;
              }, {} as Record<string, number>);
          
          // Get quiz scores
          const recentQuizScores = subjectRecord.quizScores.map((score, index) => ({
            date: new Date(Date.now() - index * 86400000).toISOString().split('T')[0], // Mock dates for demo
            score
          }));
          
          // Suggest topics with low confidence
          const suggestedTopics = Object.entries(confidenceByTopic)
            .sort(([, a], [, b]) => a - b)
            .slice(0, 3)
            .map(([topic]) => topic);
          
          setStudentPerformance({
            confidenceByTopic,
            recentQuizScores,
            suggestedTopics
          });
        }
      } catch (error) {
        console.error('Error loading student performance:', error);
      }
    }
  }, [activeCharacter, studentRecord]);

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
      } else if (lowerMessage.includes('equation')) {
        return "When solving equations, we aim to find the value(s) of the unknown variable. For example, to solve $2x + 3 = 7$, we subtract 3 from both sides to get $2x = 4$, then divide by 2 to find $x = 2$. What equation are you trying to solve?";
      }
    } else if (character.subject === 'Science') {
      if (lowerMessage.includes('chemistry')) {
        return "Chemistry is the study of matter, its properties, and the changes it undergoes. Are you looking at atomic structure, chemical reactions, or perhaps something else?";
      } else if (lowerMessage.includes('biology')) {
        return "Biology explores living organisms and their interactions with each other and the environment. What specific area of biology are you studying?";
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
    error,
    studentPerformance,
    referencedResources,
    setReferencedResources
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
