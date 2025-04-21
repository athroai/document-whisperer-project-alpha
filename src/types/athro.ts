
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

// ADDED: AthroMessage needed by multiple components
export interface AthroMessage {
  id: string;
  role: 'user' | 'assistant';
  senderId: string; // user id or athro id
  content: string;
  timestamp: string;
}
