
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
