
export type AthroSubject = 'Mathematics' | 'Science' | 'English' | 'History' | 'Geography' | string;
export type ExamBoard = 'wjec' | 'aqa' | 'ocr' | string;
export type AthroLanguage = 'English' | 'Welsh' | 'French' | 'German' | 'Spanish' | string;

export interface AthroCharacter {
  id: string;
  name: string;
  subject: AthroSubject;
  topics: string[];
  examBoards: ExamBoard[];
  supportsMathNotation: boolean;
  avatarUrl: string;
  shortDescription: string;
  fullDescription: string;
  tone: string;
  supportsSpecialCharacters?: boolean;
  supportedLanguages?: AthroLanguage[];
}

export interface AthroMessage {
  id: string;
  senderId: string; // 'user' or character id
  content: string;
  timestamp: string;
  referencedResources?: string[];
}

export interface AthroSession {
  id: string;
  subject: AthroSubject;
  topic?: string;
  startTime: Date;
  endTime?: Date;
  confidenceBefore?: number;
  confidenceAfter?: number;
  messages?: AthroMessage[];
}
