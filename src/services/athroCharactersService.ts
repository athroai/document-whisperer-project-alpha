
import { AthroCharacter, AthroSubject, AthroTheme } from '@/types/athro';

/**
 * Service to manage Athro character definitions and related functionality
 */
const athroCharactersService = {
  /**
   * Get all available Athro characters
   */
  getCharacters(): AthroCharacter[] {
    return [
      {
        id: '1',
        name: 'AthroMaths',
        subject: 'Mathematics',
        avatar: '/lovable-uploads/0accc1f4-8161-4ea5-8d60-9a94e1db17de.png',
        description: 'Master geometry, algebra, and calculus with personalized help.',
        greeting: 'Hello! I\'m here to help with your maths questions.',
        topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
        examBoards: ['WJEC', 'AQA', 'OCR'],
        supportsMathNotation: true
      },
      {
        id: '2',
        name: 'AthroScience',
        subject: 'Science',
        avatar: '/lovable-uploads/891171f3-8ed2-4ad8-866a-7231ba98adce.png',
        description: 'Explore biology, chemistry, and physics concepts.',
        greeting: 'Hi there! Ready to explore scientific concepts together?',
        topics: ['Biology', 'Chemistry', 'Physics', 'Environmental Science'],
        examBoards: ['WJEC', 'AQA', 'OCR'],
      },
      {
        id: '3',
        name: 'AthroEnglish',
        subject: 'English',
        avatar: '/lovable-uploads/377f4249-a58d-47d5-b240-762ab0af12d9.png',
        description: 'Improve your writing, reading, and literature analysis.',
        greeting: 'Welcome! Let\'s dive into the world of language and literature.',
        topics: ['Literature', 'Language', 'Writing', 'Poetry'],
        examBoards: ['WJEC', 'AQA', 'OCR'],
      },
      {
        id: '4',
        name: 'AthroWelsh',
        subject: 'Welsh',
        avatar: '/lovable-uploads/82369830-1434-4d7c-9838-bff77223b5b7.png',
        description: 'Learn and improve your Welsh language skills.',
        greeting: 'Helo! Fi yw AthroWelsh. Sut alla i dy helpu di heddiw?',
        topics: ['Reading', 'Writing', 'Speaking', 'Listening'],
        examBoards: ['WJEC'],
        supportedLanguages: ['Welsh', 'English'],
      },
      {
        id: '5',
        name: 'AthroHistory',
        subject: 'History',
        avatar: '/lovable-uploads/b2f74659-0dcb-418a-812c-8e724c28714f.png',
        description: 'Explore historical events with expert guidance.',
        greeting: 'Hello! I\'m AthroHistory, here to help you explore the past.',
        topics: ['Medieval History', 'World Wars', 'Industrial Revolution', 'Cold War'],
        examBoards: ['WJEC', 'AQA', 'OCR'],
      },
      {
        id: '6',
        name: 'AthroGeography',
        subject: 'Geography',
        avatar: '/lovable-uploads/65f91034-fc56-45d7-9cfe-896243dafdcb.png',
        description: 'Discover geographical concepts with expert guidance.',
        greeting: 'Hello! I\'m AthroGeography, ready to explore our fascinating world with you.',
        topics: ['Physical Geography', 'Human Geography', 'Environmental Issues', 'Map Skills'],
        examBoards: ['WJEC', 'AQA', 'OCR'],
      },
      {
        id: '7',
        name: 'AthroRE',
        subject: 'Religious Education',
        avatar: '/lovable-uploads/79348661-22f5-4d20-837b-0c6501cc953b.png',
        description: 'Understand religious concepts with thoughtful guidance.',
        greeting: 'Hello! I\'m AthroRE, here to help you explore religious beliefs and philosophical questions.',
        topics: ['World Religions', 'Philosophy', 'Ethics', 'Religious Texts'],
        examBoards: ['WJEC', 'AQA', 'OCR'],
      },
      {
        id: '8',
        name: 'AthroLanguages',
        subject: 'Languages',
        avatar: '/lovable-uploads/780565b4-b016-4d40-8599-3436da2a815c.png',
        description: 'Master new languages with expert guidance.',
        greeting: 'Bonjour! Hallo! ¡Hola! I\'m AthroLanguages, ready to help you develop your language skills.',
        topics: ['Vocabulary', 'Grammar', 'Conversation', 'Reading Comprehension'],
        examBoards: ['WJEC', 'AQA', 'OCR'],
        supportedLanguages: ['French', 'German', 'Spanish', 'English'],
      },
      {
        id: '9',
        name: 'AthroTime',
        subject: 'Study Skills',
        avatar: '/lovable-uploads/18394c47-fe65-4a71-a0ed-fc42ad4ea326.png',
        description: 'Master the art of effective studying.',
        greeting: 'Hello! I\'m AthroTime, here to help you make the most of your study time.',
        topics: ['Time Management', 'Revision Techniques', 'Note Taking', 'Memory Skills'],
        examBoards: ['WJEC', 'AQA', 'OCR'],
      },
      {
        id: '10',
        name: 'AthroTech',
        subject: 'Computer Science',
        avatar: '/lovable-uploads/40540d1f-04a5-475d-ab0a-feefad5308f3.png',
        description: 'Explore the digital world with expert guidance.',
        greeting: 'Hello! I\'m AthroTech, here to help you navigate the world of computer science.',
        topics: ['Programming', 'Algorithms', 'Data Structures', 'Computer Systems'],
        examBoards: ['WJEC', 'AQA', 'OCR'],
      },
    ];
  },

  /**
   * Get theme colors based on subject
   */
  getThemeForSubject(subject: string): AthroTheme {
    // Default theme
    const defaultTheme = { 
      primary: 'blue-600',
      secondary: 'green-500',
      primaryHex: '#2563eb',
      secondaryHex: '#22c55e'
    };
    
    const themes: Record<string, AthroTheme> = {
      'Mathematics': {
        primary: 'blue-600',
        secondary: 'sky-500',
        primaryHex: '#2563eb',
        secondaryHex: '#0ea5e9'
      },
      'Science': {
        primary: 'green-600',
        secondary: 'emerald-500',
        primaryHex: '#16a34a',
        secondaryHex: '#10b981'
      },
      'English': {
        primary: 'purple-600',
        secondary: 'violet-500',
        primaryHex: '#9333ea',
        secondaryHex: '#8b5cf6'
      },
      'Welsh': {
        primary: 'red-600',
        secondary: 'red-400',
        primaryHex: '#dc2626',
        secondaryHex: '#f87171'
      },
      'History': {
        primary: 'amber-600',
        secondary: 'yellow-500',
        primaryHex: '#d97706',
        secondaryHex: '#eab308'
      },
      'Geography': {
        primary: 'emerald-600',
        secondary: 'teal-500',
        primaryHex: '#059669',
        secondaryHex: '#14b8a6'
      },
      'Religious Education': {
        primary: 'indigo-600',
        secondary: 'purple-400',
        primaryHex: '#4f46e5',
        secondaryHex: '#c084fc'
      },
      'Languages': {
        primary: 'rose-600',
        secondary: 'pink-500',
        primaryHex: '#e11d48',
        secondaryHex: '#ec4899'
      },
      'Study Skills': {
        primary: 'orange-600',
        secondary: 'amber-500',
        primaryHex: '#ea580c',
        secondaryHex: '#f59e0b'
      },
      'Computer Science': {
        primary: 'cyan-600',
        secondary: 'blue-400',
        primaryHex: '#0891b2',
        secondaryHex: '#60a5fa'
      }
    };
    
    return themes[subject] || defaultTheme;
  }
};

export default athroCharactersService;
