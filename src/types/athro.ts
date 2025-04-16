
export type ExamBoard = 'wjec' | 'ocr' | 'aqa' | 'none' | 'edexcel';

export type AthroSubject = 
  | 'Mathematics' 
  | 'Science' 
  | 'English' 
  | 'Welsh' 
  | 'History' 
  | 'Geography' 
  | 'Languages'
  | 'Religious Education'
  | 'Timekeeper'
  | 'AthroAI'
  | 'System'
  | 'RE'; // Keeping 'RE' for backwards compatibility

export type AthroLanguage = 'Spanish' | 'French' | 'German';

export interface AthroCharacter {
  id: string;
  name: string;
  subject: AthroSubject;
  avatarUrl: string; // Changed from 'avatar' to 'avatarUrl'
  shortDescription: string;
  fullDescription: string;
  tone: string; // Describes the character's tone for AI prompting
  supportsMathNotation?: boolean;
  supportsSpecialCharacters?: boolean;
  supportedLanguages?: AthroLanguage[];
  topics: string[]; // Subject-specific topics
  examBoards: ExamBoard[];
}

export interface AthroMessage {
  id: string;
  senderId: string; // 'user' or character ID
  content: string;
  timestamp: string;
  referencedResources?: {
    id: string;
    name: string;
    type: string;
  }[];
}

export interface AthroAttachment {
  id: string;
  type: 'image' | 'pdf' | 'mathml' | 'latex' | 'resource';
  url: string;
  caption?: string;
  thumbnailUrl?: string;
}

export interface AthroStudySession {
  id: string;
  studentId: string;
  characterId: string;
  subject: AthroSubject;
  topic?: string;
  examBoard: ExamBoard;
  messages: AthroMessage[];
  startTime: string;
  endTime?: string;
  confidenceStart?: number;
  confidenceEnd?: number;
}

export interface AthroResource {
  id: string;
  title: string;
  type: 'past-paper' | 'notes' | 'quiz' | 'topic-sheet' | 'marking-scheme';
  subject: AthroSubject;
  examBoard: ExamBoard;
  uploaderId: string;
  url: string;
  uploadDate: string;
  topics: string[];
  visibility: 'private' | 'class' | 'school' | 'public';
  classId?: string;
}

export interface AthroStudentProgress {
  studentId: string;
  subject: AthroSubject;
  confidenceScores: {
    [topic: string]: number; // 1-10 scale
  };
  completedQuizzes: {
    quizId: string;
    score: number;
    date: string;
  }[];
  studyTime: {
    [topic: string]: number; // in minutes
  };
  lastStudySession?: string; // timestamp
}

export interface AthroPrompt {
  systemPrompt: string;
  userPrompt?: string;
  examples?: {
    userMessage: string;
    athroResponse: string;
  }[];
  characterOverrides?: {
    [key in AthroSubject]?: string;
  };
}

// Interface for MathML or LaTeX rendering options
export interface MathNotationOptions {
  displayMode: boolean; // inline or block
  leqno: boolean; // left equation numbering
  fleqn: boolean; // flush equations left
  throwOnError: boolean; // throw error for invalid syntax
  errorColor: string; // color for error text
  macros: Record<string, string>; // custom macros
  minRuleThickness: number; // minimum thickness for rules
  colorIsTextColor: boolean; // use given color as text color
  strict: boolean; // strict parsing of TeX
}
