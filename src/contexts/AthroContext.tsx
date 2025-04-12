import React, { createContext, useContext, useState, useEffect } from 'react';
import { AthroCharacter, AthroMessage } from '@/types/athro';
import { AthroCharacterConfig, SubjectData } from '@/types/athroCharacter';
import { athroCharacters } from '@/config/athrosConfig';
import { pastPapers } from '@/data/athro-maths/past-papers';
import { modelAnswers } from '@/data/athro-maths/model-answers';

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
}

const AthroContext = createContext<AthroContextProps | undefined>(undefined);

const MAX_CONVERSATION_MEMORY = 5;

export const AthroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  
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

  const setActiveCharacter = (character: AthroCharacter | AthroCharacterConfig) => {
    setMessages([]);
    
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
      
      addWelcomeMessage(convertedChar);
    } else {
      setActiveCharacterState(character);
      
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
    if (subject !== 'Mathematics') return null;
    
    const keywords = query.toLowerCase().split(/\s+/);
    
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
      }
      
      return { response, markScheme, referencedResources: [question.id] };
    } else {
      const hasContext = messages.length >= 2;
      
      if (hasContext) {
        const previousTopics = new Set<string>();
        
        messages.forEach(msg => {
          if (msg.senderId !== 'user') {
            const content = msg.content.toLowerCase();
            if (content.includes('algebra')) previousTopics.add('Algebra');
            if (content.includes('geometry')) previousTopics.add('Geometry');
            if (content.includes('trigonometry')) previousTopics.add('Trigonometry');
          }
        });
        
        if (previousTopics.size > 0) {
          const topicsArray = Array.from(previousTopics);
          const recentTopic = topicsArray[topicsArray.length - 1];
          
          response = `Building on our discussion about ${recentTopic}, let me address your question.\n\n`;
        }
      }
      
      if (userQuery.toLowerCase().includes('help')) {
        response += `I'd be happy to help! I can explain math concepts, walk through problems step-by-step, or help you prepare for your GCSE exams. What specific topic are you working on?`;
      } else if (userQuery.toLowerCase().includes('example')) {
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
      } else {
        response += `That's a good question about ${subject}. Let me explain:\n\n`;
        
        if (subject === 'Mathematics') {
          response += `In mathematics, it's important to break problems down step-by-step. `;
          response += `I can help you with topics like algebra, geometry, trigonometry, statistics, and more. `;
          response += `Would you like me to explain a specific concept or provide practice problems?`;
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
