// Existing types file - append or modify as needed

export type AthroSubject = 'Mathematics' | 'Science' | 'English' | 'History' | 'Geography' | 'Computer Science' | 'Welsh' | 'Languages' | 'Religious Education';
export type AthroLanguage = 'English' | 'Welsh' | 'French' | 'Spanish' | 'German';
export type ExamBoard = 'wjec' | 'aqa' | 'ocr' | 'none';
export type ModernLanguage = 'french' | 'german' | 'spanish';

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
  grammarTip?: string;
  culturalNote?: string;
  translation?: string;
}

export interface AthroSession {
  id: string;
  userId: string;
  characterId: string;
  messages: AthroMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface PastPaper {
  id: string;
  subject: string;
  unit: string;
  title: string;
  examBoard: ExamBoard;
  year: string;
  season: string;
  questions: PastPaperQuestion[];
}

export interface PastPaperQuestion {
  id: string;
  topic: string;
  subtopic: string;
  text: string;
  marks: number;
  difficulty: number;
}

export interface ModelAnswer {
  questionId: string;
  workingSteps: string[];
  markScheme: string;
  marks: number;
  latexNotation: string;
  translation?: string;
  grammarExplanation?: string;
  culturalNote?: string;
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
