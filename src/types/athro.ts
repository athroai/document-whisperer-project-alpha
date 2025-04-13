// Existing types file - append or modify as needed

export type AthroSubject = 'Mathematics' | 'Science' | 'English' | 'History' | 'Geography' | 'Computer Science' | 'Welsh' | 'Languages' | 'Religious Education';
export type AthroLanguage = 'English' | 'Welsh' | 'French' | 'Spanish' | 'German';
export type ExamBoard = 'wjec' | 'aqa' | 'ocr' | 'none';

export interface AthroCharacter {
  id: string;
  name: string;
  subject: AthroSubject;
  avatarUrl: string;
  shortDescription: string;
  fullDescription: string;
  tone: string;
  supportsMathNotation?: boolean;
  supportsSpecialCharacters?: boolean;
  supportedLanguages?: AthroLanguage[];
  topics: string[];
  examBoards: ExamBoard[];
}

export interface AthroMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  markScheme?: string;
  referencedResources?: string[];
}

export interface AthroSession {
  id: string;
  userId: string;
  characterId: string;
  messages: AthroMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AthroFileReference {
  id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  subject: AthroSubject;
  topics: string[];
  examBoard?: ExamBoard;
  uploadedAt: string;
}

// Input processor for future API integration
export interface InputProcessor {
  name: string;
  processInput: (input: string, context: any) => Promise<string>;
  supportedInputTypes: string[];
  enabled: boolean;
}
