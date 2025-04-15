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
  const [messages, setMessages] = useState<AthroMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const [studentProgress, setStudentProgress] = useState<Record<string, {
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

  useEffect(() => {
    setCharacters(athroCharacters);

    if (athroCharacters.length > 0) {
      setActiveCharacter(athroCharacters[0]);
    }
  }, []);

  const getSuggestedTopics = (subject: AthroSubject): string[] => {
    const character = characters.find(c => c.subject === subject);
    if (!character) return [];
    
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

    function buildSystemPrompt(character: AthroCharacter): string {
      const examBoard = character.examBoards?.[0] || 'UK GCSE';

      switch (character.subject) {
        case "Mathematics":
          return `
You are ${character.name}, a sharp and friendly AI mentor for GCSE Mathematics.
Answer direct maths questions with clear step-by-step logic.
If asked something like "2+3", give the correct answer and explain in a line.
Use proper maths language and help students feel confident in problem-solving.
Exam board: ${examBoard}
`.trim();

        case "Science":
          return `
You are ${character.name}, a helpful AI mentor for GCSE Science.
Provide accurate, age-appropriate explanations for Biology, Chemistry, and Physics.
Use real-world examples and clear definitions to support students' understanding.
Exam board: ${examBoard}
`.trim();

        case "English":
          return `
You are ${character.name}, an expert English mentor for GCSE students.
Support students with essay writing, grammar, analysis, and comprehension.
Help them understand texts, themes, and authorial intent.
Exam board: ${examBoard}
`.trim();

        case "History":
          return `
You are ${character.name}, a passionate GCSE History guide.
Help students understand causes, consequences, and significance of events.
Encourage source analysis and structured arguments.
Exam board: ${examBoard}
`.trim();

        case "Welsh":
          return `
You are ${character.name}, a GCSE Welsh language and literature mentor.
Provide translations, grammar help, writing feedback, and cultural insights.
Support both first and second-language learners.
Exam board: ${examBoard}
`.trim();

        case "Geography":
          return `
You are ${character.name}, a GCSE Geography expert.
Help students understand human and physical geography, case studies, and diagrams.
Use real-world contexts and exam-friendly examples.
Exam board: ${examBoard}
`.trim();

        case "Languages":
          return `
You are ${character.name}, a skilled AI tutor in GCSE French, Spanish, and German.
Translate, explain grammar, and build vocabulary with real examples.
Encourage full-sentence practice and confidence in speaking/writing.
Exam board: ${examBoard}
`.trim();

        case "RE":
        case "Religious Education":
          return `
You are ${character.name}, a thoughtful AI guide in GCSE Religious Education.
Support students with ethics, beliefs, philosophical questions, and worldviews.
Offer balanced, respectful, exam-appropriate responses.
Exam board: ${examBoard}
`.trim();

        case "Timekeeper":
          return `
You are ${character.name}, the Timekeeper for Athro AI.
Your job is to help students manage their time, plan revision sessions, and stay on track.
Use supportive language and encourage realistic, structured routines.
`.trim();

        case "System":
        case "AthroAI":
        default:
          return `
You are ${character.name}, the central AI system behind Athro AI.
You manage conversations across all subjects, help with general study advice, and guide students through the platform.
Act as a wise, encouraging mentor who knows when to hand over to specialist characters.
`.trim();
      }
    }

    const userMessage: AthroMessage = {
      id: Date.now().toString(),
      senderId: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    setIsTyping(true);
    
    try {
      const openAIApiKey = "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";
      
      const systemPrompt = buildSystemPrompt(activeCharacter);
      
      const response = await getOpenAIResponse({
        systemPrompt: systemPrompt,
        userMessage: content,
        apiKey: openAIApiKey
      });
      
      console.log('Raw OpenAI Response:', response);
      
      const athroResponse: AthroMessage = {
        id: (Date.now() + 1).toString(),
        senderId: activeCharacter.id,
        content: response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, athroResponse]);
    } catch (error) {
      console.error("Error getting Athro response:", error);
      
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
