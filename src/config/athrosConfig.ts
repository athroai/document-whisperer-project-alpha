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
    examBoards: ['wjec', 'aqa', 'ocr', 'edexcel']
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
    examBoards: ['wjec', 'aqa', 'ocr', 'edexcel']
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
    examBoards: ['wjec', 'aqa', 'ocr', 'edexcel']
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
    examBoards: ['wjec', 'aqa', 'ocr', 'edexcel']
  },
  {
    id: 'athro-welsh',
    name: 'AthroWelsh',
    subject: 'Welsh',
    avatarUrl: '/lovable-uploads/66f5e352-aee3-488f-bcdf-d8a5ab685360.png',
    shortDescription: 'Your GCSE Welsh language mentor',
    fullDescription: 'AthroWelsh helps you develop reading, writing and speaking skills in Welsh, covering both first and second language curricula.',
    tone: 'friendly, patient, encouraging of language exploration',
    supportsSpecialCharacters: true,
    topics: ['Reading', 'Writing', 'Speaking', 'Listening', 'Grammar', 'Literature'],
    examBoards: ['wjec']
  },
  {
    id: 'athro-geography',
    name: 'AthroGeography',
    subject: 'Geography',
    avatarUrl: '/lovable-uploads/8b64684a-b978-4763-8cfb-a80b2ce305d4.png',
    shortDescription: 'Your GCSE Geography guide',
    fullDescription: 'AthroGeography helps you understand physical and human geography concepts, supporting you with case studies and geographical skills.',
    tone: 'exploratory, analytical, environmentally conscious',
    topics: ['Physical Geography', 'Human Geography', 'Environmental Challenges', 'Fieldwork', 'Map Skills', 'Sustainability'],
    examBoards: ['wjec', 'aqa', 'ocr', 'edexcel']
  },
  {
    id: 'athro-languages',
    name: 'AthroLanguages',
    subject: 'Languages',
    avatarUrl: '/lovable-uploads/66f5e352-aee3-488f-bcdf-d8a5ab685360.png',
    shortDescription: 'Your GCSE Modern Foreign Languages tutor',
    fullDescription: 'AthroLanguages helps you develop your skills in French, Spanish, and German for GCSE exams.',
    tone: 'encouraging, pronunciation-focused, culturally aware',
    supportsSpecialCharacters: true,
    supportedLanguages: ['French', 'Spanish', 'German'],
    topics: ['Vocabulary', 'Grammar', 'Reading', 'Writing', 'Listening', 'Speaking', 'Cultural Understanding'],
    examBoards: ['wjec', 'aqa', 'ocr', 'edexcel']
  },
  {
    id: 'athro-re',
    name: 'AthroRE',
    subject: 'Religious Education',
    avatarUrl: '/lovable-uploads/8b64684a-b978-4763-8cfb-a80b2ce305d4.png',
    shortDescription: 'Your GCSE Religious Studies mentor',
    fullDescription: 'AthroRE helps you explore religious beliefs, teachings and practices, ethical themes, and philosophical questions.',
    tone: 'respectful, balanced, thoughtful, encouraging of critical thinking',
    topics: ['Christianity', 'Islam', 'Judaism', 'Hinduism', 'Buddhism', 'Ethics', 'Philosophy of Religion'],
    examBoards: ['wjec', 'aqa', 'ocr', 'edexcel']
  },
  {
    id: 'athro-ai',
    name: 'AthroAI',
    subject: 'AthroAI',
    avatarUrl: '/lovable-uploads/e4274c9e-f66c-4933-9c0b-79f6c222c31b.png',
    shortDescription: 'The master system brain and general-purpose mentor',
    fullDescription: 'AthroAI is your all-purpose study companion who can help with any subject and general study skills.',
    tone: 'helpful, knowledgeable, encouraging',
    supportsMathNotation: true,
    supportsSpecialCharacters: true,
    topics: ['Study Skills', 'Exam Preparation', 'Time Management', 'Research Skills', 'Critical Thinking'],
    examBoards: ['wjec', 'aqa', 'ocr', 'edexcel']
  },
  {
    id: 'athro-timekeeper',
    name: 'Timekeeper',
    subject: 'Timekeeper',
    avatarUrl: '/lovable-uploads/a2640d0a-113f-4f37-9120-5533af965b5d.png',
    shortDescription: 'Manages your revision schedule and study sessions',
    fullDescription: 'Timekeeper helps you plan your revision timetable, manage Pomodoro study sessions, and track your study progress.',
    tone: 'organized, motivating, disciplined',
    topics: ['Time Management', 'Pomodoro Technique', 'Revision Planning', 'Study Scheduling', 'Progress Tracking'],
    examBoards: ['none']
  },
  {
    id: 'athro-system',
    name: 'SystemBrain',
    subject: 'System',
    avatarUrl: '/lovable-uploads/e4274c9e-f66c-4933-9c0b-79f6c222c31b.png',
    shortDescription: 'Handles settings, notifications and feedback',
    fullDescription: 'SystemBrain manages your app settings, notification preferences, and helps you provide feedback on your study experience.',
    tone: 'professional, efficient, helpful',
    topics: ['Settings', 'Notifications', 'Feedback', 'Account Management', 'System Updates'],
    examBoards: ['none']
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
