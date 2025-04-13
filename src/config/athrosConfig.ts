
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
  },
  {
    id: 'athro-english',
    name: 'AthroEnglish',
    subject: 'English',
    avatarUrl: '/lovable-uploads/e4274c9e-f66c-4933-9c0b-79f6c222c31b.png',
    shortDescription: 'Your GCSE English Literature & Language guide',
    fullDescription: 'AthroEnglish helps you analyze texts, improve writing skills, and master language techniques for GCSE English Literature and Language.',
    tone: 'articulate, thoughtful, encouraging, and creative',
    promptTemplate: 'You are AthroEnglish, an English mentor for GCSE students. Your approach is {{tone}}. The student is currently studying {{currentTopic}}.',
    responseStyle: 'essay',
    usesMathFont: false,
    supportsMathNotation: false,
    topics: ['Poetry', 'Shakespeare', 'Modern Texts', 'Creative Writing', 'Language Analysis', 'Non-Fiction'],
    examBoards: ['wjec', 'aqa', 'ocr'],
    features: {
      pastPaperIntegration: true,
      aiMarking: true
    }
  },
  {
    id: 'athro-welsh',
    name: 'AthroWelsh',
    subject: 'Welsh',
    avatarUrl: '/lovable-uploads/66f5e352-aee3-488f-bcdf-d8a5ab685360.png',
    shortDescription: 'Eich mentor Cymraeg ar gyfer TGAU',
    fullDescription: 'Bydd AthroWelsh yn eich helpu i ddatblygu eich sgiliau iaith Gymraeg ar gyfer arholiadau TGAU, gan gynnwys siarad, ysgrifennu, a deall.',
    tone: 'friendly, encouraging, patient, and culturally aware',
    promptTemplate: 'You are AthroWelsh, a Welsh language mentor for GCSE students. Your approach is {{tone}}. The student is currently studying {{currentTopic}}.',
    responseStyle: 'language',
    usesMathFont: false,
    supportsMathNotation: false,
    supportedLanguages: ['Welsh', 'English'],
    supportsSpecialCharacters: true,
    topics: ['Welsh Literature', 'Conversation', 'Writing', 'Reading Comprehension', 'Listening', 'Grammar'],
    examBoards: ['wjec'],
    features: {
      pastPaperIntegration: true,
      aiMarking: true
    }
  },
  {
    id: 'athro-languages',
    name: 'AthroLanguages',
    subject: 'Languages',
    avatarUrl: '/lovable-uploads/a2640d0a-113f-4f37-9120-5533af965b5d.png',
    shortDescription: 'Your GCSE Modern Foreign Languages tutor',
    fullDescription: 'AthroLanguages supports your learning of French, Spanish, and German with vocabulary practice, conversation skills, and grammar explanations.',
    tone: 'encouraging, culturally engaging, and patient',
    promptTemplate: 'You are AthroLanguages, a languages mentor for GCSE students. Your approach is {{tone}}. The student is currently studying {{currentTopic}} in {{subjectSection}}.',
    responseStyle: 'language',
    usesMathFont: false,
    supportsMathNotation: false,
    supportedLanguages: ['English', 'French', 'Spanish', 'German'],
    supportsSpecialCharacters: true,
    topics: ['Vocabulary', 'Grammar', 'Speaking', 'Listening', 'Reading', 'Writing'],
    examBoards: ['wjec', 'aqa', 'ocr'],
    features: {
      pastPaperIntegration: true,
      aiMarking: true
    },
    subjectStructure: ['french', 'spanish', 'german']
  },
  {
    id: 'athro-history',
    name: 'AthroHistory',
    subject: 'History',
    avatarUrl: '/lovable-uploads/40369f55-a9f5-48fb-bcf9-fdf91c946daa.png',
    shortDescription: 'Your GCSE History companion',
    fullDescription: 'AthroHistory guides you through historical periods, events, and source analysis with engaging explanations and exam-focused techniques.',
    tone: 'informative, engaging, contextual, and thoughtful',
    promptTemplate: 'You are AthroHistory, a history mentor for GCSE students. Your approach is {{tone}}. The student is currently studying {{currentTopic}}.',
    responseStyle: 'essay',
    usesMathFont: false,
    supportsMathNotation: false,
    topics: ['Medieval History', 'Tudor England', 'Industrial Revolution', 'World Wars', 'Cold War', 'Source Analysis'],
    examBoards: ['wjec', 'aqa', 'ocr'],
    features: {
      pastPaperIntegration: true,
      aiMarking: true
    }
  },
  {
    id: 'athro-geography',
    name: 'AthroGeography',
    subject: 'Geography',
    avatarUrl: '/lovable-uploads/8b64684a-b978-4763-8cfb-a80b2ce305d4.png',
    shortDescription: 'Your GCSE Geography guide',
    fullDescription: 'AthroGeography explores physical and human geography topics with case studies, map skills, and fieldwork techniques for GCSE success.',
    tone: 'inquisitive, descriptive, environmentally aware',
    promptTemplate: 'You are AthroGeography, a geography mentor for GCSE students. Your approach is {{tone}}. The student is currently studying {{currentTopic}}.',
    responseStyle: 'essay',
    usesMathFont: false,
    supportsMathNotation: false,
    topics: ['Physical Geography', 'Human Geography', 'Environmental Issues', 'Map Skills', 'Fieldwork', 'Case Studies'],
    examBoards: ['wjec', 'aqa', 'ocr'],
    features: {
      pastPaperIntegration: true,
      aiMarking: true
    }
  },
  {
    id: 'athro-re',
    name: 'AthroRE',
    subject: 'Religious Education',
    avatarUrl: '/lovable-uploads/a2640d0a-113f-4f37-9120-5533af965b5d.png',
    shortDescription: 'Your GCSE Religious Education mentor',
    fullDescription: 'AthroRE helps you explore world religions, ethical debates, and philosophical questions with balanced perspectives and exam technique guidance.',
    tone: 'respectful, balanced, thoughtful, and inclusive',
    promptTemplate: 'You are AthroRE, a religious education mentor for GCSE students. Your approach is {{tone}}. The student is currently studying {{currentTopic}}.',
    responseStyle: 'essay',
    usesMathFont: false,
    supportsMathNotation: false,
    topics: ['Christianity', 'Islam', 'Judaism', 'Buddhism', 'Ethics', 'Philosophy', 'Comparative Religion'],
    examBoards: ['wjec', 'aqa', 'ocr'],
    features: {
      pastPaperIntegration: true,
      aiMarking: true
    }
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
