
import { AthroCharacter } from '@/types/athro';

// Function to get Athro character by subject
export const getAthroBySubject = (subject: string): AthroCharacter | null => {
  const normalizedSubject = subject.toLowerCase();
  
  return athrosConfig.find(
    athro => athro.subject.toLowerCase() === normalizedSubject
  ) || null;
};

// Configuration for all Athro characters
export const athrosConfig: AthroCharacter[] = [
  {
    id: 'athro-maths',
    name: 'AthroMaths',
    subject: 'Mathematics',
    avatar: '/assets/images/athro-maths.png',
    description: 'Your personal mathematics mentor, specializing in GCSE math topics including algebra, geometry, and calculus.',
    shortDescription: 'Master mathematics with personalized guidance',
    greeting: 'Hello! I\'m AthroMaths, your personal mathematics mentor. How can I help you today?',
    supportsMathNotation: true,
    topics: [
      'Algebra', 
      'Geometry', 
      'Calculus', 
      'Statistics', 
      'Trigonometry',
      'Number Theory',
      'Probability'
    ],
    examBoards: ['WJEC', 'AQA', 'OCR', 'Edexcel']
  },
  {
    id: 'athro-science',
    name: 'AthroScience',
    subject: 'Science',
    avatar: '/assets/images/athro-science.png',
    description: 'Your personal science mentor, covering biology, chemistry, and physics at GCSE level.',
    shortDescription: 'Explore scientific concepts with expert guidance',
    greeting: 'Hello! I\'m AthroScience, ready to explore scientific concepts with you. What would you like to learn about?',
    supportsMathNotation: true,
    topics: [
      'Biology', 
      'Chemistry', 
      'Physics', 
      'Ecology', 
      'Atomic Structure',
      'Forces and Motion',
      'Organic Chemistry',
      'Cellular Biology'
    ],
    examBoards: ['WJEC', 'AQA', 'OCR', 'Edexcel']
  },
  {
    id: 'athro-english',
    name: 'AthroEnglish',
    subject: 'English',
    avatar: '/assets/images/athro-english.png',
    description: 'Your personal English mentor, specializing in literature analysis, language, and writing skills.',
    shortDescription: 'Improve your English skills with expert guidance',
    greeting: 'Hello! I\'m AthroEnglish, here to help you with literature, language, and writing. What would you like to work on today?',
    topics: [
      'Literature Analysis', 
      'Creative Writing', 
      'Poetry', 
      'Shakespeare', 
      'Language Techniques',
      'Essay Structure',
      'Comparative Analysis'
    ],
    examBoards: ['WJEC', 'AQA', 'OCR', 'Edexcel']
  },
  {
    id: 'athro-welsh',
    name: 'AthroWelsh',
    subject: 'Welsh' as any, // Type cast to bypass temporary type error
    avatar: '/assets/images/athro-welsh.png',
    description: 'Your personal Welsh language mentor, helping with reading, writing, and speaking skills.',
    shortDescription: 'Learn and improve your Welsh language skills',
    greeting: 'Helo! Fi yw AthroWelsh. Sut alla i dy helpu di heddiw?',
    supportedLanguages: ['Welsh', 'English'],
    supportsSpecialCharacters: true,
    topics: [
      'Reading', 
      'Writing', 
      'Speaking', 
      'Listening', 
      'Grammar',
      'Vocabulary',
      'Cultural Context'
    ],
    examBoards: ['WJEC']
  },
  {
    id: 'athro-history',
    name: 'AthroHistory',
    subject: 'History',
    avatar: '/assets/images/athro-history.png',
    description: 'Your personal history mentor, covering key historical periods and events for GCSE.',
    shortDescription: 'Explore historical events with expert guidance',
    greeting: 'Hello! I\'m AthroHistory, here to help you explore the past. What period or topic would you like to discuss?',
    topics: [
      'Medieval History', 
      'World Wars', 
      'Industrial Revolution', 
      'Cold War', 
      'Source Analysis',
      'Historical Interpretations',
      'Local History'
    ],
    examBoards: ['WJEC', 'AQA', 'OCR', 'Edexcel']
  }
];

export default athrosConfig;
