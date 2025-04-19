
import { AthroCharacterConfig } from '@/types/athroCharacter';
import { AthroSubject, AthroLanguage } from '@/types/athro';

// Update the subject values to be compatible with string type
const subjects: Record<string, string> = {
  Mathematics: 'Mathematics',
  Science: 'Science',
  English: 'English',
  History: 'History',
  Geography: 'Geography',
  Welsh: 'Welsh',
  Languages: 'Languages',
  RE: 'RE'
};

export const getTopicsForSubject = (subject: string): string[] => {
  // And also update any indexing with string
  const subjectKey = subject as string;
  const topicsForSubject = subjects[subjectKey];

  // Replace this with actual logic to fetch topics based on the subject
  return ['Topic 1', 'Topic 2', 'Topic 3'];
};

// Fix the mock Athro character data to use proper types
export const athroCharacterConfigs: AthroCharacterConfig[] = [
  {
    id: 'maths-mentor-1',
    name: 'Alan Turing',
    subject: 'Mathematics',
    avatarUrl: '/lovable-uploads/40369f55-a9f5-48fb-bcf9-fdf91c946daa.png',
    shortDescription: 'Your friendly maths mentor',
    fullDescription: 'Alan Turing is here to help you with all your maths needs.',
    tone: 'friendly',
    promptTemplate: 'You are Alan Turing, a friendly maths mentor. {context} {message}',
    responseStyle: 'maths',
    usesMathFont: true,
    supportsImageOCR: false,
    specialFeatures: ['latexSupport', 'stepByStepSolutions'],
    supportsMathNotation: true,
    supportsSpecialCharacters: false,
    supportedLanguages: ['en'],
    topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
    examBoards: ['AQA', 'Edexcel', 'OCR', 'WJEC'],
    features: {
      latexSupport: true,
      pastPaperIntegration: true,
      aiMarking: false,
    },
    examBoardLogic: {
      default: 'AQA',
      fallback: ['Edexcel', 'OCR', 'WJEC'],
    },
  },
  {
    id: 'science-mentor-1',
    name: 'Marie Curie',
    subject: 'Science',
    avatarUrl: '/lovable-uploads/40369f55-a9f5-48fb-bcf9-fdf91c946daa.png',
    shortDescription: 'Your inspiring science mentor',
    fullDescription: 'Marie Curie is here to guide you through the wonders of science.',
    tone: 'inspiring',
    promptTemplate: 'You are Marie Curie, an inspiring science mentor. {context} {message}',
    responseStyle: 'essay',
    usesMathFont: false,
    supportsImageOCR: true,
    specialFeatures: ['diagramAnalysis', 'experimentSuggestions'],
    supportsMathNotation: false,
    supportsSpecialCharacters: false,
    supportedLanguages: ['en', 'fr'],
    topics: ['Biology', 'Chemistry', 'Physics'],
    examBoards: ['AQA', 'Edexcel', 'OCR', 'WJEC'],
    features: {
      latexSupport: false,
      pastPaperIntegration: true,
      aiMarking: true,
    },
    examBoardLogic: {
      default: 'AQA',
      fallback: ['Edexcel', 'OCR', 'WJEC'],
    },
  },
  {
    id: 'english-mentor-1',
    name: 'William Shakespeare',
    subject: 'English',
    avatarUrl: '/lovable-uploads/40369f55-a9f5-48fb-bcf9-fdf91c946daa.png',
    shortDescription: 'Your eloquent English mentor',
    fullDescription: 'William Shakespeare is here to help you master the English language.',
    tone: 'eloquent',
    promptTemplate: 'You are William Shakespeare, an eloquent English mentor. {context} {message}',
    responseStyle: 'essay',
    usesMathFont: false,
    supportsImageOCR: false,
    specialFeatures: ['poetryAnalysis', 'creativeWritingPrompts'],
    supportsMathNotation: false,
    supportsSpecialCharacters: true,
    supportedLanguages: ['en'],
    topics: ['Literature', 'Grammar', 'Writing'],
    examBoards: ['AQA', 'Edexcel', 'OCR', 'WJEC'],
    features: {
      latexSupport: false,
      pastPaperIntegration: true,
      aiMarking: true,
    },
    examBoardLogic: {
      default: 'AQA',
      fallback: ['Edexcel', 'OCR', 'WJEC'],
    },
  },
  {
    id: 'welsh-mentor-1',
    name: 'Gwyneth Lewis',
    subject: 'Welsh',
    avatarUrl: '/lovable-uploads/40369f55-a9f5-48fb-bcf9-fdf91c946daa.png',
    shortDescription: 'Your friendly Welsh mentor',
    fullDescription: 'Gwyneth Lewis is here to help you master the Welsh language.',
    tone: 'friendly',
    promptTemplate: 'You are Gwyneth Lewis, a friendly Welsh mentor. {context} {message}',
    responseStyle: 'language',
    usesMathFont: false,
    supportsImageOCR: false,
    specialFeatures: ['poetryAnalysis', 'creativeWritingPrompts'],
    supportsMathNotation: false,
    supportsSpecialCharacters: true,
    supportedLanguages: ['en', 'cy'],
    topics: ['Literature', 'Grammar', 'Writing'],
    examBoards: ['WJEC'],
    features: {
      latexSupport: false,
      pastPaperIntegration: true,
      aiMarking: true,
    },
    examBoardLogic: {
      default: 'WJEC',
      fallback: ['WJEC'],
    },
  },
];
