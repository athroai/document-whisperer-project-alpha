
import { AthroSubject, AthroMessage, ExamBoard } from '@/types/athro';
import { mathsModelAnswers } from '@/data/athro-maths/model-answers';
import { mathsPastPapers } from '@/data/athro-maths/past-papers';
import { englishModelAnswers } from '@/data/athro-english/model-answers';
import { englishPastPapers } from '@/data/athro-english/past-papers';
import { welshModelAnswers } from '@/data/athro-welsh/model-answers';
import { welshPastPapers } from '@/data/athro-welsh/past-papers';
import { biologyModelAnswers } from '@/data/athro-science/model-answers-biology';
import { biologyPastPapers } from '@/data/athro-science/past-papers-biology';
import { chemistryModelAnswers } from '@/data/athro-science/model-answers-chemistry';
import { chemistryPastPapers } from '@/data/athro-science/past-papers-chemistry';
import { physicsModelAnswers } from '@/data/athro-science/model-answers-physics';
import { physicsPastPapers } from '@/data/athro-science/past-papers-physics';
import { historyModelAnswers } from '@/data/athro-history/model-answers';
import { historyPastPapers } from '@/data/athro-history/past-papers';
import { geographyModelAnswers } from '@/data/athro-geography/model-answers';
import { geographyPastPapers } from '@/data/athro-geography/past-papers';
import { languagesModelAnswers } from '@/data/athro-languages/model-answers';
import { languagesPastPapers } from '@/data/athro-languages/past-papers';
import { reModelAnswers } from '@/data/athro-re/model-answers';
import { rePastPapers } from '@/data/athro-re/past-papers';

// Utility to generate unique IDs for messages
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
};

// Mock history of chat sessions
const chatHistory: Record<string, AthroMessage[]> = {};

// Get past papers based on subject
export const getPastPapersBySubject = (subject: AthroSubject, examBoard: ExamBoard = 'wjec') => {
  switch (subject) {
    case 'Mathematics':
      return mathsPastPapers;
    case 'English':
      return englishPastPapers;
    case 'Science':
      return [...biologyPastPapers, ...chemistryPastPapers, ...physicsPastPapers];
    case 'Welsh':
      return welshPastPapers;
    case 'History':
      return historyPastPapers;
    case 'Geography':
      return geographyPastPapers;
    case 'Languages':
      return languagesPastPapers;
    case 'Religious Education':
      return rePastPapers;
    default:
      return [];
  }
};

// Get model answers based on subject
export const getModelAnswersBySubject = (subject: AthroSubject) => {
  switch (subject) {
    case 'Mathematics':
      return mathsModelAnswers;
    case 'English':
      return englishModelAnswers;
    case 'Science':
      return [...biologyModelAnswers, ...chemistryModelAnswers, ...physicsModelAnswers];
    case 'Welsh':
      return welshModelAnswers;
    case 'History':
      return historyModelAnswers;
    case 'Geography':
      return geographyModelAnswers;
    case 'Languages':
      return languagesModelAnswers;
    case 'Religious Education':
      return reModelAnswers;
    default:
      return [];
  }
};

// Find a specific past paper question
export const findPastPaperQuestion = (questionId: string, subject: AthroSubject) => {
  const pastPapers = getPastPapersBySubject(subject);
  
  for (const paper of pastPapers) {
    for (const question of paper.questions) {
      if (question.id === questionId) {
        return {
          question,
          paper
        };
      }
    }
  }
  
  return null;
};

// Find a model answer for a specific question
export const findModelAnswer = (questionId: string, subject: AthroSubject) => {
  const modelAnswers = getModelAnswersBySubject(subject);
  return modelAnswers.find(answer => answer.questionId === questionId) || null;
};

// Generate a response based on the student's message
export const mockAthroResponse = async (
  message: string,
  subject: AthroSubject,
  examBoard: ExamBoard = 'wjec',
  context?: any
): Promise<AthroMessage> => {
  // Create a message ID
  const messageId = generateId();
  
  // Check if message appears to be asking about a past paper
  const isPastPaperQuery = /past paper|exam question|mark scheme/i.test(message);
  
  // Check if message appears to be a math query
  const isMathQuery = subject === 'Mathematics' && /solve|calculate|equation|formula|graph|triangle|circle|algebra/i.test(message);
  
  // Generate a response based on the context
  let response: string;
  let markScheme: string | undefined;
  let referencedResources: string[] | undefined;
  
  // If we need to respond with subject-specific content
  if (subject === 'Science' && context?.subjectSection) {
    response = generateScienceResponse(message, context.subjectSection);
  } else if (subject === 'Languages' && context?.subjectSection) {
    response = generateLanguageResponse(message, context.subjectSection);
  } else if (isPastPaperQuery) {
    const pastPaperResponse = generatePastPaperResponse(message, subject, examBoard);
    response = pastPaperResponse.response;
    markScheme = pastPaperResponse.markScheme;
    referencedResources = pastPaperResponse.referencedResources;
  } else if (isMathQuery) {
    response = generateMathResponse(message);
  } else {
    response = generateGenericResponse(message, subject);
  }
  
  // Return the message
  return {
    id: messageId,
    senderId: `athro-${subject.toLowerCase()}`,
    content: response,
    timestamp: new Date().toISOString(),
    markScheme,
    referencedResources
  };
};

// Helper functions to generate responses based on context
const generateScienceResponse = (message: string, subjectSection: string): string => {
  switch (subjectSection.toLowerCase()) {
    case 'biology':
      return `As a biology specialist, I'd explain that ${message.includes('cell') ? 'cells are the fundamental units of life, containing organelles like the nucleus, mitochondria, and ribosomes' : 'biological processes are regulated by complex interactions between molecules, cells, and systems'}. Would you like me to go into more specific detail about this topic?`;
    case 'chemistry':
      return `From a chemistry perspective, ${message.includes('element') ? 'elements are arranged in the periodic table according to their atomic properties' : 'chemical reactions involve the breaking and forming of bonds between atoms'}. Let me know if you'd like me to elaborate on any specific concept.`;
    case 'physics':
      return `In physics, ${message.includes('force') ? 'forces cause objects to accelerate according to Newton\'s Second Law, F=ma' : 'energy is conserved in a closed system, but can be transformed between different forms'}. Would you like me to provide a specific example or calculation?`;
    default:
      return `As your Science Athro, I can help with biology, chemistry, or physics questions. ${message}`;
  }
};

const generateLanguageResponse = (message: string, language: string): string => {
  switch (language.toLowerCase()) {
    case 'french':
      return `Bonjour! In French, ${message.includes('verb') ? 'verbs are conjugated differently depending on the subject pronoun and tense' : 'pronunciation is critical, and many letters are silent at the end of words'}. Voulez-vous que j'explique davantage?`;
    case 'spanish':
      return `¡Hola! In Spanish, ${message.includes('verb') ? 'verb conjugation follows patterns based on -ar, -er, and -ir endings' : 'the use of gender for nouns and adjective agreement is essential'}. ¿Quieres que te explique más?`;
    case 'german':
      return `Guten Tag! In German, ${message.includes('case') ? 'there are four cases: nominative, accusative, dative, and genitive' : 'word order is flexible but follows specific rules'}. Möchten Sie, dass ich mehr erkläre?`;
    default:
      return `As your Languages Athro, I can help with French, Spanish, or German. ${message}`;
  }
};

const generatePastPaperResponse = (message: string, subject: AthroSubject, examBoard: ExamBoard) => {
  return {
    response: `For this past paper question, I would approach it methodically. First, identify what the question is asking for. Make sure to address all parts of the question in your response. Use subject-specific terminology and provide relevant examples to support your points. Structure your answer clearly with an introduction, main body with key points, and a conclusion.`,
    markScheme: `A full mark answer would: \n- Demonstrate detailed understanding of key concepts\n- Use relevant terminology accurately\n- Provide specific examples to support points\n- Present a balanced argument where required\n- Draw clear conclusions based on evidence`,
    referencedResources: [`${examBoard.toUpperCase()} ${subject} Past Paper 2022`]
  };
};

const generateMathResponse = (message: string): string => {
  return `To solve this mathematics problem, I would identify the key information and determine which formula or method to apply. Let me work through this step by step:\n\n1. First, I understand what the question is asking\n2. I'll identify the relevant formula: [appropriate formula]\n3. Then substitute the values\n4. Solve the equation systematically\n5. Check the answer makes sense in the context of the problem\n\nIs there a specific part you'd like me to explain in more detail?`;
};

const generateGenericResponse = (message: string, subject: AthroSubject): string => {
  return `As your ${subject} Athro, I'm here to help you understand key concepts and improve your skills in this subject. Let's explore this topic together. Would you like me to provide some practice questions, explain a concept, or review past paper techniques?`;
};

export default {
  mockAthroResponse,
  findPastPaperQuestion,
  findModelAnswer,
  getPastPapersBySubject,
  getModelAnswersBySubject
};
