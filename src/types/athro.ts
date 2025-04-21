
export type ExamBoard = 'AQA' | 'WJEC' | 'EDEXCEL' | 'OCR' | 'SQA' | 'CCEA';

export interface AthroCharacter {
  id: string;
  name: string;
  subject: string;
  tone: string;
  shortDescription: string;
  fullDescription: string;
  avatarUrl: string;
  supportsMathNotation?: boolean;
  supportsSpecialCharacters?: boolean;
  examBoards: ExamBoard[];
  topics: string[];
  supportedLanguages?: string[];
}

export interface AthroMessage {
  id: string;
  role: 'user' | 'assistant';
  senderId: string; // user id or athro id
  content: string;
  timestamp: string;
  referencedResources?: string[]; // Add missing property
}

// Add these missing types that are referenced in the code
export type AthroSubject = 'Mathematics' | 'Science' | 'English' | 'History' | 'Geography' | 'Welsh' | 'Languages' | 'Religious Education';
export type AthroLanguage = 'en' | 'cy' | 'fr' | 'es' | 'de';
