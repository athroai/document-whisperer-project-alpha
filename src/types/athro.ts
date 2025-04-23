
export type ExamBoard = 'AQA' | 'EDEXCEL' | 'OCR' | 'WJEC' | 'SQA' | 'CCEA';

export interface AthroCharacter {
  id: string;
  name: string;
  subject: string;
  avatar_url: string;
  short_description: string;
  full_description?: string;
  tone?: string;
  exam_boards?: ExamBoard[];
  topics?: string[];
  supported_languages?: string[];
  supports_math_notation?: boolean;
  supports_special_characters?: boolean;
}

export interface AthroMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  senderId: string;
  content: string;
  timestamp: string;
  referencedResources?: any[];
}

export interface AthroCharacterAdapter {
  id: string;
  name: string;
  subject: string;
  avatarUrl: string;
  shortDescription: string;
  fullDescription?: string;
  tone?: string;
  examBoards?: ExamBoard[];
  topics?: string[];
  supportedLanguages?: string[];
  supportsMathNotation?: boolean;
  supportsSpecialCharacters?: boolean;
}
