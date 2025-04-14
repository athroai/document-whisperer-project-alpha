
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
    avatarUrl: '/lovable-uploads/0accc1f4-8161-4ea5-8d60-9a94e1db17de.png',
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
    avatarUrl: '/lovable-uploads/891171f3-8ed2-4ad8-866a-7231ba98adce.png',
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
    avatarUrl: '/lovable-uploads/377f4249-a58d-47d5-b240-762ab0af12d9.png',
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
    avatarUrl: '/lovable-uploads/82369830-1434-4d7c-9838-bff77223b5b7.png',
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
    avatarUrl: '/lovable-uploads/b2f74659-0dcb-418a-812c-8e724c28714f.png',
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
  },
  {
    id: 'athro-geography',
    name: 'AthroGeography',
    subject: 'Geography',
    avatar: '/assets/images/athro-geography.png',
    avatarUrl: '/lovable-uploads/65f91034-fc56-45d7-9cfe-896243dafdcb.png',
    description: 'Your personal geography mentor, exploring physical and human geography topics.',
    shortDescription: 'Discover geographical concepts with expert guidance',
    greeting: 'Hello! I\'m AthroGeography, ready to explore our fascinating world with you. What would you like to learn about?',
    topics: [
      'Physical Geography',
      'Human Geography',
      'Environmental Issues',
      'Map Skills',
      'Fieldwork Techniques',
      'Climate Change',
      'Sustainable Development'
    ],
    examBoards: ['WJEC', 'AQA', 'OCR', 'Edexcel']
  },
  {
    id: 'athro-religious-education',
    name: 'AthroRE',
    subject: 'Religious Education',
    avatar: '/assets/images/athro-re.png',
    avatarUrl: '/lovable-uploads/79348661-22f5-4d20-837b-0c6501cc953b.png',
    description: 'Your personal religious education mentor, exploring world religions and ethical questions.',
    shortDescription: 'Understand religious concepts with thoughtful guidance',
    greeting: 'Hello! I\'m AthroRE, here to help you explore religious beliefs, practices, and philosophical questions.',
    topics: [
      'World Religions',
      'Philosophy',
      'Ethics',
      'Religious Texts',
      'Moral Dilemmas',
      'Comparative Religion',
      'Religious Practices'
    ],
    examBoards: ['WJEC', 'AQA', 'OCR', 'Edexcel']
  },
  {
    id: 'athro-languages',
    name: 'AthroLanguages',
    subject: 'Languages',
    avatar: '/assets/images/athro-languages.png',
    avatarUrl: '/lovable-uploads/780565b4-b016-4d40-8599-3436da2a815c.png',
    description: 'Your personal modern foreign languages mentor, helping with French, German, and Spanish.',
    shortDescription: 'Master new languages with expert guidance',
    greeting: 'Bonjour! Hallo! ¡Hola! I\'m AthroLanguages, ready to help you develop your language skills.',
    supportedLanguages: ['French', 'German', 'Spanish', 'English'],
    supportsSpecialCharacters: true,
    topics: [
      'Vocabulary',
      'Grammar',
      'Conversation',
      'Reading Comprehension',
      'Writing Skills',
      'Cultural Context',
      'Exam Preparation'
    ],
    examBoards: ['WJEC', 'AQA', 'OCR', 'Edexcel']
  },
  {
    id: 'athro-time',
    name: 'AthroTime',
    subject: 'Study Skills',
    avatar: '/assets/images/athro-time.png',
    avatarUrl: '/lovable-uploads/18394c47-fe65-4a71-a0ed-fc42ad4ea326.png',
    description: 'Your personal study skills mentor, helping you manage your time and develop effective revision strategies.',
    shortDescription: 'Master the art of effective studying',
    greeting: 'Hello! I\'m AthroTime, here to help you make the most of your study time. How can I assist you today?',
    topics: [
      'Time Management',
      'Revision Techniques',
      'Note Taking',
      'Memory Skills',
      'Exam Preparation',
      'Study Planning',
      'Learning Styles'
    ],
    examBoards: ['WJEC', 'AQA', 'OCR', 'Edexcel']
  },
  {
    id: 'athro-technology',
    name: 'AthroTech',
    subject: 'Computer Science',
    avatar: '/assets/images/athro-tech.png',
    avatarUrl: '/lovable-uploads/40540d1f-04a5-475d-ab0a-feefad5308f3.png',
    description: 'Your personal computer science mentor, helping with programming, algorithms, and digital literacy.',
    shortDescription: 'Explore the digital world with expert guidance',
    greeting: 'Hello! I\'m AthroTech, here to help you navigate the world of computer science. What would you like to learn?',
    topics: [
      'Programming',
      'Algorithms',
      'Data Structures',
      'Computer Systems',
      'Networks',
      'Cyber Security',
      'Digital Literacy'
    ],
    examBoards: ['WJEC', 'AQA', 'OCR', 'Edexcel']
  }
];

export default athrosConfig;
