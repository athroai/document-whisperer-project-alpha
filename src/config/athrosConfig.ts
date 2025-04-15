
import { AthroCharacter } from '@/types/athro';

export const athroCharacters: AthroCharacter[] = [
  {
    id: 'athro-maths',
    name: 'AthroMaths',
    subject: 'Mathematics',
    avatarUrl: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png',
    shortDescription: 'Your GCSE Mathematics mentor',
    fullDescription: 'AthroMaths helps you tackle all aspects of GCSE Mathematics, from algebra to statistics, with step-by-step explanations and practice problems.',
    tone: 'logical, precise, encouraging, and patient',
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
    supportsMathNotation: true,
    topics: ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Ecology', 'Astronomy'],
    examBoards: ['wjec', 'aqa', 'ocr']
  },
  {
    id: 'athro-english',
    name: 'AthroEnglish',
    subject: 'English',
    avatarUrl: '/lovable-uploads/66f5e352-aee3-488f-bcdf-d8a5ab685360.png',
    shortDescription: 'Your GCSE English Literature & Language guide',
    fullDescription: 'AthroEnglish helps you analyze texts, improve your writing, and develop critical thinking skills for GCSE English.',
    tone: 'articulate, expressive, encouraging of creative and critical thinking',
    topics: ['Literature', 'Poetry', 'Creative Writing', 'Grammar', 'Text Analysis', 'Shakespeare'],
    examBoards: ['wjec', 'aqa', 'ocr']
  },
  {
    id: 'athro-history',
    name: 'AthroHistory',
    subject: 'History',
    avatarUrl: '/lovable-uploads/8b64684a-b978-4763-8cfb-a80b2ce305d4.png',
    shortDescription: 'Your guide through historical events and analysis',
    fullDescription: 'AthroHistory helps you understand key historical events, figures, and their impact, while developing analytical skills for GCSE History.',
    tone: 'informative, contextual, balanced in perspective',
    topics: ['World Wars', 'Ancient Civilizations', 'Medieval History', 'Industrial Revolution', 'Cold War'],
    examBoards: ['wjec', 'aqa', 'ocr']
  }
];

export const getAthroById = (id: string): AthroCharacter | undefined => {
  return athroCharacters.find(character => character.id === id);
};

export const getAthroBySubject = (subject: string): AthroCharacter | undefined => {
  return athroCharacters.find(character => character.subject === subject);
};

export const formatPrompt = (template: string, context: Record<string, any>): string => {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return context[key] || match;
  });
};
