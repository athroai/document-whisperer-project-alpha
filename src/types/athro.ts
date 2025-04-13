
// If this file doesn't exist yet, we need to create it with the complete type definitions

export type AthroSubject = 
  | 'Mathematics' 
  | 'Science' 
  | 'English' 
  | 'Welsh' 
  | 'Languages' 
  | 'History' 
  | 'Geography' 
  | 'Religious Education';

export type AthroExamBoard = 'WJEC' | 'AQA' | 'OCR' | 'Edexcel' | 'CCEA';

export interface AthroCharacter {
  id: string;
  name: string;
  subject: AthroSubject;
  description: string;
  examBoards: AthroExamBoard[];
  avatar?: string;
  promptPersona?: string;
}

export interface AthroMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  attachments?: AthroAttachment[];
}

export interface AthroAttachment {
  id: string;
  type: 'image' | 'file' | 'audio';
  url: string;
  name: string;
  contentType?: string;
}

export interface AthroSession {
  id: string;
  studentId: string;
  subject: AthroSubject;
  messages: AthroMessage[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface AthroContextData {
  activeCharacter: AthroCharacter | null;
  setActiveCharacter: (character: AthroCharacter) => void;
  characters: AthroCharacter[];
  currentScienceSubject?: string;
  setCurrentScienceSubject?: (subject: string) => void;
}

// This type can be used for mock data and other character-related functionality
export interface AthroConfig {
  id: string;
  name: string;
  subject: AthroSubject;
  description: string;
  examBoards: AthroExamBoard[];
  avatar?: string;
  promptPersona?: string;
  feedback?: {
    style?: string;
    encouragementPhrases?: string[];
  };
  specializations?: string[];
}
