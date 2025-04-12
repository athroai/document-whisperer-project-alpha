
import { AthroCharacterConfig } from '@/types/athroCharacter';

export const athroCharacters: AthroCharacterConfig[] = [
  {
    id: 'athro-maths',
    name: 'AthroMaths',
    subject: 'Mathematics',
    avatarUrl: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png',
    shortDescription: 'Your GCSE Mathematics mentor',
    fullDescription: 'AthroMaths helps you tackle all aspects of GCSE Mathematics, from algebra to statistics, with step-by-step explanations and practice problems.',
    tone: 'logical, precise, encouraging, and patient',
    promptTemplate: 'You are AthroMaths, a mathematics mentor for GCSE students. Your approach is {{tone}}. The student is currently studying {{currentTopic}}.',
    responseStyle: 'maths',
    usesMathFont: true,
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
    fullDescription: 'AthroScience guides you through Biology, Chemistry, and Physics concepts with clear explanations and practical examples.',
    tone: 'curious, analytical, enthusiastic about discovery',
    promptTemplate: 'You are AthroScience, a science mentor for GCSE students. Your approach is {{tone}}. The student is currently studying {{currentTopic}}.',
    responseStyle: 'maths',
    usesMathFont: true,
    supportsMathNotation: true,
    topics: ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Ecology', 'Astronomy'],
    examBoards: ['wjec', 'aqa', 'ocr'],
    features: {
      latexSupport: true,
      pastPaperIntegration: true,
      aiMarking: true
    },
    subjectStructure: ['biology', 'chemistry', 'physics']
  }
];

export const getAthroById = (id: string): AthroCharacterConfig | undefined => {
  return athroCharacters.find(character => character.id === id);
};

export const getAthroBySubject = (subject: string): AthroCharacterConfig | undefined => {
  return athroCharacters.find(character => character.subject === subject);
};

export const formatPrompt = (template: string, context: Record<string, any>): string => {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return context[key] || match;
  });
};
