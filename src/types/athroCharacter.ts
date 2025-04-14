
import { AthroSubject, ExamBoard } from './athro';

export interface AthroCharacterConfig {
  id: string;
  name: string;
  subject: AthroSubject;
  avatarUrl: string;
  shortDescription: string;
  fullDescription: string;
  tone: string;
  promptTemplate: string;
  promptPersona: string;
  responseStyle: 'maths' | 'essay' | 'language' | 'summary';
  usesMathFont?: boolean;
  supportsImageOCR?: boolean;
  specialFeatures?: string[];
  supportsMathNotation?: boolean;
  supportsSpecialCharacters?: boolean;
  supportedLanguages?: string[];
  topics: string[];
  examBoards: ExamBoard[];
  features?: {
    latexSupport?: boolean;
    pastPaperIntegration?: boolean;
    aiMarking?: boolean;
  };
  examBoardLogic?: {
    default: ExamBoard;
    fallback: ExamBoard[];
  };
  subjectStructure?: string[];
}

export interface AthroPromptContext {
  studentName?: string;
  recentTopics?: string[];
  confidenceScores?: Record<string, number>;
  examBoard?: ExamBoard;
  currentTopic?: string;
  currentSubject?: string;
  subjectSection?: string; // For Science: 'biology', 'chemistry', 'physics'
  recentQuizScores?: {
    topic: string;
    score: number;
    date: string;
  }[];
  uploadedResources?: {
    id: string;
    title: string;
    type: string;
    subject: AthroSubject;
  }[];
}

export interface AthroResponse {
  message: string;
  suggestedTopics?: string[];
  confidence?: number;
  resources?: string[];
}

export interface SubjectData {
  recentTopics: string[];
  confidenceScores: Record<string, number>;
  studyTime: Record<string, number>;
  quizScores: {
    topic: string;
    score: number;
    date: string;
  }[];
}

export interface AthroCharacterContext extends AthroCharacterConfig {
  isActive: boolean;
  currentTopic?: string;
  confidenceScore?: number;
  lastInteraction?: string;
  sessionHistory?: {
    date: string;
    duration: number;
    topics: string[];
  }[];
}
