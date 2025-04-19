
export interface AthroCharacter {
  id: string;
  name: string;
  subject: string;
  shortDescription: string;
  fullDescription: string;
  avatarUrl: string;
  tone: string;
  supportsMathNotation: boolean;
  supportsSpecialCharacters: boolean;
  supportedLanguages: string[];
  examBoards: string[];
  topics: string[];
}

export interface AthroMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date | string;
  senderId?: string;
  referencedResources?: string[];
  attachments?: string[];
  metadata?: Record<string, any>;
}

export interface AthroSubject {
  id: string;
  name: string;
  topics: string[];
  examBoards: ExamBoard[];
}

export type AthroLanguage = 'en' | 'fr' | 'es' | 'de';

export type ExamBoard = 'AQA' | 'Edexcel' | 'OCR' | 'WJEC' | 'CCEA' | 'none';
