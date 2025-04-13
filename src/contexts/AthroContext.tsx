import React, { createContext, useContext, useState, useEffect } from 'react';
import { AthroCharacter, AthroMessage, AthroLanguage, ExamBoard } from '@/types/athro';
import { AthroCharacterConfig, SubjectData } from '@/types/athroCharacter';
import { athroCharacters } from '@/config/athrosConfig';
import { pastPapers } from '@/data/athro-maths/past-papers';
import { modelAnswers } from '@/data/athro-maths/model-answers';
import biologyPastPapers from '@/data/athro-science/past-papers-biology';
import biologyModelAnswers from '@/data/athro-science/model-answers-biology';
import { useAuth } from '@/contexts/AuthContext';
import AthroSessionFirestoreService from '@/services/firestore/athroSessionService';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
  clearMessages: () => void;
  isTyping: boolean;
  studentProgress: Record<string, SubjectData>;
  getTopicConfidence: (subject: string, topic: string) => number;
  getSuggestedTopics: (subject: string) => string[];
  currentScienceSubject?: string;
  setCurrentScienceSubject?: (subject: string) => void;
  firestoreStatus: 'loading' | 'connected' | 'offline' | 'error';
}

const AthroContext = createContext<AthroContextProps | undefined>(undefined);

const MAX_CONVERSATION_MEMORY = 5;

export const AthroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  
  const convertedCharacters: AthroCharacter[] = athroCharacters.map(config => ({
    id: config.id,
    name: config.name,
    subject: config.subject,
    avatar: config.avatarUrl,
    avatarUrl: config.avatarUrl,
    shortDescription: config.shortDescription,
    fullDescription: config.fullDescription,
    tone: config.tone,
    supportsMathNotation: config.supportsMathNotation || false,
    supportsSpecialCharacters: config.supportsSpecialCharacters || false,
    supportedLanguages: config.supportedLanguages || [],
    topics: config.topics,
    examBoards: config.examBoards,
    description: config.shortDescription,
  }));

  const [characters] = useState<AthroCharacter[]>(convertedCharacters);
  const [activeCharacter, setActiveCharacterState] = useState<AthroCharacter | null>(null);
  const [messages, setMessages] = useState<AthroMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [studentProgress] = useState<Record<string, SubjectData>>(mockStudentProgress);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const [currentScienceSubject, setCurrentScienceSubject] = useState<string>('biology');
  const [firestoreStatus, setFirestoreStatus] = useState<'loading' | 'connected' | 'offline' | 'error'>('loading');
  
  useEffect(() => {
    if (messages.length > 0) {
      const recentMessages = messages
        .slice(-MAX_CONVERSATION_MEMORY * 2)
        .map(msg => `${msg.senderId === 'user' ? 'Student' : activeCharacter?.name}: ${msg.content}`)
        .join('\n');
      
      setConversationContext([recentMessages]);
    }
  }, [messages, activeCharacter]);

  useEffect(() => {
    if (characters.length > 0 && !activeCharacter) {
      setActiveCharacterState(characters[0]);
    }
  }, [characters, activeCharacter]);

  useEffect(() => {
    const loadFirestoreSession = async () => {
      if (!activeCharacter || !authState.user?.id) return;
      
      try {
        setFirestoreStatus('loading');
        
        const historical = await AthroSessionFirestoreService.getSession(
          authState.user.id,
          activeCharacter.subject
        );
        
        if (historical && historical.length > 0) {
          console.log('[AthroContext] Loaded historical session from Firestore:', historical.length, 'messages');
          
          if (messages.length <= 1) {
            setMessages(historical);
            setFirestoreStatus('connected');
          }
        } else {
          if (messages.length === 0) {
            addWelcomeMessage(activeCharacter);
          }
          setFirestoreStatus('connected');
        }
      } catch (error) {
        console.error('[AthroContext] Error loading historical session:', error);
        
        setFirestoreStatus('error');
        
        if (messages.length === 0) {
          addWelcomeMessage(activeCharacter);
        }
      }
    };
    
    loadFirestoreSession();
  }, [activeCharacter, authState.user?.id]);

  const setActiveCharacter = (character: AthroCharacter | AthroCharacterConfig) => {
    setMessages([]);
    
    if ('promptTemplate' in character) {
      const convertedChar: AthroCharacter = {
        id: character.id,
        name: character.name,
        subject: character.subject,
        avatar: character.avatarUrl,
        avatarUrl: character.avatarUrl,
        shortDescription: character.shortDescription,
        fullDescription: character.fullDescription,
        tone: character.tone,
        supportsMathNotation: character.supportsMathNotation || false,
        supportsSpecialCharacters: character.supportsSpecialCharacters || false,
        supportedLanguages: character.supportedLanguages || [],
        topics: character.topics,
        examBoards: character.examBoards,
        description: character.shortDescription,
      };
      setActiveCharacterState(convertedChar);
    } else {
      setActiveCharacterState(character);
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
      return 5;
    }
    return subjectData.confidenceScores[topic];
  };

  const getSuggestedTopics = (subject: string): string[] => {
    const subjectData = studentProgress[subject];
    if (!subjectData) {
      return [];
    }
    
    const lowConfidenceTopics = Object.entries(subjectData.confidenceScores || {})
      .filter(([_, score]) => typeof score === 'number' && score < 6)
      .map(([topic]) => topic)
      .slice(0, 2);
    
    const recentTopics = subjectData.recentTopics?.slice(0, 2) || [];
    
    return [...new Set([...lowConfidenceTopics, ...recentTopics])];
  };

  const findMatchingPastPaperQuestion = (query: string, subject: string, examBoard?: string) => {
    const keywords = query.toLowerCase().split(/\s+/);
    
    if (subject === 'Mathematics') {
      let filteredPapers = pastPapers;
      if (examBoard && examBoard !== 'none') {
        filteredPapers = pastPapers.filter(paper => paper.examBoard === examBoard);
      }
      
      for (const paper of filteredPapers) {
        for (const question of paper.questions) {
          const questionText = question.text.toLowerCase();
          const matchesKeywords = keywords.some(keyword => 
            questionText.includes(keyword) || question.topic.toLowerCase().includes(keyword)
          );
          
          if (matchesKeywords) {
            const modelAnswer = modelAnswers.find(answer => answer.questionId === question.id);
            return { question, paper, modelAnswer };
          }
        }
      }
      
      return null;
    }
    else if (subject === 'Science') {
      let filteredPapers = biologyPastPapers;
      if (examBoard && examBoard !== 'none') {
        filteredPapers = biologyPastPapers.filter(paper => paper.examBoard === examBoard);
      }
      
      for (const paper of filteredPapers) {
        for (const question of paper.questions) {
          const questionText = question.text.toLowerCase();
          const matchesKeywords = keywords.some(keyword => 
            questionText.includes(keyword) || question.topic.toLowerCase().includes(keyword)
          );
          
          if (matchesKeywords) {
            const modelAnswer = biologyModelAnswers.find(answer => answer.questionId === question.id);
            return { question, paper, modelAnswer, subjectSection: 'biology' };
          }
        }
      }
      
      return null;
    }
    
    return null;
  };

  const createContextualResponse = (userQuery: string, matchResult: any, subject: string) => {
    let response = '';
    let markScheme = '';
    
    if (matchResult) {
      const { question, paper, modelAnswer } = matchResult;
      
      response = `Let me help you with that ${question.topic} question. This is similar to a ${paper.examBoard.toUpperCase()} past paper question:\n\n`;
      response += `"${question.text}"\n\n`;
      response += `This is a ${question.difficulty} level question worth ${question.marks} marks.\n\n`;
      
      if (modelAnswer) {
        response += `Here's how I would approach it:\n\n${modelAnswer.workingSteps.join('\n')}\n\n`;
        response += `Would you like to see more ${question.topic} questions or practice a different topic?`;
        
        markScheme = modelAnswer.markScheme;
        if (modelAnswer.latexNotation) {
          markScheme = modelAnswer.latexNotation;
        }
      } else {
        response += `I'd solve this step-by-step:\n\n`;
        
        if (subject === 'Mathematics') {
          if (question.topic === 'Algebra') {
            response += `1. Identify the variables and what we're solving for\n`;
            response += `2. Rearrange the equation as needed\n`;
            response += `3. Solve for the unknown\n`;
            response += `4. Check the solution in the original equation`;
          } else if (question.topic === 'Geometry') {
            response += `1. Draw a diagram if one isn't provided\n`;
            response += `2. Label all given measurements\n`;
            response += `3. Apply the relevant formula\n`;
            response += `4. Calculate the answer with correct units`;
          } else {
            response += `1. Understand what the question is asking\n`;
            response += `2. Identify the formula or method needed\n`;
            response += `3. Apply the correct mathematical techniques\n`;
            response += `4. Check the answer is reasonable`;
          }
        } else if (subject === 'Science') {
          if (question.topic === 'Cells') {
            response += `1. Identify the cell structure or process in question\n`;
            response += `2. Describe its physical characteristics\n`;
            response += `3. Explain its function within the cell\n`;
            response += `4. Connect to the larger cellular system`;
          } else if (question.topic === 'Respiration') {
            response += `1. Identify the type of respiration (aerobic/anaerobic)\n`;
            response += `2. Write the relevant chemical equation\n`;
            response += `3. Explain where in the cell it occurs\n`;
            response += `4. Describe the energy yield and products`;
          } else {
            response += `1. Understand the scientific concept being asked about\n`;
            response += `2. Outline the key processes involved\n`;
            response += `3. Explain using correct scientific terminology\n`;
            response += `4. Connect to real-world applications if relevant`;
          }
          
          const didYouKnowFacts = {
            'Cells': 'Did you know? The average human body contains approximately 37.2 trillion cells!',
            'Respiration': 'Did you know? Muscle cells can switch to anaerobic respiration during intense exercise when oxygen is limited.',
            'Photosynthesis': 'Did you know? The green pigment chlorophyll absorbs red and blue light but reflects green light, which is why plants appear green.',
            'Genetics': 'Did you know? If you stretched the DNA from all the cells in your body, it would reach to the sun and back over 600 times!',
            'Ecology': 'Did you know? In a typical food chain, only about 10% of energy is transferred from one trophic level to the next.'
          };
          
          if (didYouKnowFacts[question.topic]) {
            response += `\n\n${didYouKnowFacts[question.topic]}`;
          }
        }
      }
      
      return { response, markScheme, referencedResources: [question.id] };
    } else {
      const hasContext = messages.length >= 2;
      
      if (hasContext) {
        const previousTopics = new Set<string>();
        
        messages.forEach(msg => {
          if (msg.senderId !== 'user') {
            const content = msg.content.toLowerCase();
            if (subject === 'Mathematics') {
              if (content.includes('algebra')) previousTopics.add('Algebra');
              if (content.includes('geometry')) previousTopics.add('Geometry');
              if (content.includes('trigonometry')) previousTopics.add('Trigonometry');
            } else if (subject === 'Science') {
              if (content.includes('cells')) previousTopics.add('Cells');
              if (content.includes('respiration')) previousTopics.add('Respiration');
              if (content.includes('photosynthesis')) previousTopics.add('Photosynthesis');
            }
          }
        });
        
        if (previousTopics.size > 0) {
          const topicsArray = Array.from(previousTopics);
          const recentTopic = topicsArray[topicsArray.length - 1];
          
          response = `Building on our discussion about ${recentTopic}, let me address your question.\n\n`;
        }
      }
      
      if (userQuery.toLowerCase().includes('help')) {
        response += `I'd be happy to help! I can explain concepts, walk through problems step-by-step, or help you prepare for your GCSE exams. What specific topic are you working on?`;
      } else if (userQuery.toLowerCase().includes('example')) {
        if (subject === 'Mathematics') {
          response += `Here's an example to work through:\n\n`;
          response += `If we have the equation $x^2 + 3x - 4 = 0$, we can solve it using the quadratic formula:\n\n`;
          response += `$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$\n\n`;
          response += `Substituting $a=1$, $b=3$, and $c=-4$:\n\n`;
          response += `$x = \\frac{-3 \\pm \\sqrt{9 - 4(1)(-4)}}{2(1)}$\n`;
          response += `$x = \\frac{-3 \\pm \\sqrt{9 + 16}}{2}$\n`;
          response += `$x = \\frac{-3 \\pm \\sqrt{25}}{2}$\n`;
          response += `$x = \\frac{-3 \\pm 5}{2}$\n\n`;
          response += `This gives us $x = 1$ or $x = -4$\n\n`;
          response += `Would you like to try a similar problem?`;
        } else if (subject === 'Science') {
          response += `Here's an example of how photosynthesis works in plants:\n\n`;
          response += `Photosynthesis is the process by which plants convert light energy into chemical energy. The equation is:\n\n`;
          response += `$6CO_2 + 6H_2O + \\text{light energy} \\rightarrow C_6H_{12}O_6 + 6O_2$\n\n`;
          response += `This process takes place in the chloroplasts, specifically in the grana where chlorophyll captures light energy. The process has two main stages:\n\n`;
          response += `1. Light-dependent reactions: Light energy is captured and converted to ATP and NADPH\n`;
          response += `2. Light-independent reactions (Calvin cycle): ATP and NADPH are used to convert CO₂ into glucose\n\n`;
          response += `Did you know? A single leaf can contain millions of chloroplasts, each with their own set of photosynthetic enzymes!\n\n`;
          response += `Would you like me to explain any part of this process in more detail?`;
        }
      } else {
        response += `That's a good question about ${subject}. Let me explain:\n\n`;
        
        if (subject === 'Mathematics') {
          response += `In mathematics, it's important to break problems down step-by-step. `;
          response += `I can help you with topics like algebra, geometry, trigonometry, statistics, and more. `;
          response += `Would you like me to explain a specific concept or provide practice problems?`;
        } else if (subject === 'Science') {
          response += `In science, understanding the underlying principles is key. `;
          response += `I can help you with biology topics like cells, respiration, photosynthesis, genetics, and ecology. `;
          response += `Would you like to explore a specific biology concept or see some example questions?`;
          
          const scienceFacts = [
            "Did you know? The human body contains enough DNA to stretch from the Sun to Pluto and back 17 times!",
            "Did you know? The average human body contains approximately 37.2 trillion cells!",
            "Did you know? The mitochondria in your cells have their own DNA, separate from your nuclear DNA!",
            "Did you know? Plants can communicate with each other through chemical signals sent via their root systems!"
          ];
          
          const randomFact = scienceFacts[Math.floor(Math.random() * scienceFacts.length)];
          response += `\n\n${randomFact}`;
        }
      }
      
      return { response, markScheme: '', referencedResources: [] };
    }
  };

  const clearMessages = () => {
    if (activeCharacter) {
      const welcomeMessage: AthroMessage = {
        id: Date.now().toString(),
        senderId: activeCharacter.id,
        content: `Hello! I'm ${activeCharacter.name}, your ${activeCharacter.subject} mentor. How can I help you today?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
      
      if (authState.user?.id) {
        try {
          AthroSessionFirestoreService.saveSession(
            authState.user.id,
            activeCharacter.subject,
            [welcomeMessage]
          );
        } catch (error) {
          console.error('[AthroContext] Error clearing Firestore session:', error);
        }
      }
    } else {
      setMessages([]);
    }
    setConversationContext([]);
  };

  const sendMessage = async (content: string) => {
    if (!activeCharacter || !content.trim()) return;

    const userMessage: AthroMessage = {
      id: Date.now().toString(),
      senderId: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    setIsTyping(true);
    
    try {
      const match = findMatchingPastPaperQuestion(
        content, 
        activeCharacter.subject,
        activeCharacter.examBoards[0]
      );
      
      const { response, markScheme, referencedResources } = createContextualResponse(
        content, 
        match, 
        activeCharacter.subject
      );
      
      const aiMessage: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter.id,
        content: response,
        timestamp: new Date().toISOString(),
        markScheme,
        referencedResources
      };
      
      const updatedMessages = [...messages, userMessage, aiMessage];
      
      if (authState.user?.id) {
        try {
          AthroSessionFirestoreService.saveSession(
            authState.user.id,
            activeCharacter.subject,
            updatedMessages,
            match?.question?.topic
          ).catch(err => console.error('[AthroContext] Error saving session to Firestore:', err));
        } catch (error) {
          console.error('[AthroContext] Error saving session to Firestore:', error);
        }
      }
      
      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error generating Athro response:", error);
      
      const errorMessage: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter.id,
        content: "I'm having trouble processing that right now. Could you try again in a moment?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const FirestoreStatusAlert = () => {
    if (firestoreStatus === 'error' || firestoreStatus === 'offline') {
      return (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Firestore {firestoreStatus === 'error' ? 'Error' : 'Offline'}</AlertTitle>
          <AlertDescription className="text-yellow-700">
            {firestoreStatus === 'error' 
              ? "We're having trouble connecting to the database. Your session is running in local mode only."
              : "You're currently working offline. Your changes will be synced when connectivity is restored."}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <AthroContext.Provider value={{
      characters,
      activeCharacter,
      messages,
      setActiveCharacter,
      sendMessage,
      clearMessages,
      isTyping,
      studentProgress,
      getTopicConfidence,
      getSuggestedTopics,
      currentScienceSubject,
      setCurrentScienceSubject,
      firestoreStatus
    }}>
      {firestoreStatus === 'error' || firestoreStatus === 'offline' ? <FirestoreStatusAlert /> : null}
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
