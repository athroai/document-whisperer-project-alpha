
import { AthroSubject, AthroLanguage, ExamBoard } from './athro';

export interface AthroCharacterConfig {
  id: string;
  name: string;
  subject: AthroSubject;
  avatarUrl: string;
  shortDescription: string;
  fullDescription: string;
  tone: string;
  promptTemplate: string;
  responseStyle: 'maths' | 'essay' | 'language' | 'summary';
  usesMathFont?: boolean;
  supportsImageOCR?: boolean;
  specialFeatures?: string[];
  supportsMathNotation?: boolean;
  supportsSpecialCharacters?: boolean;
  supportedLanguages?: AthroLanguage[];
  topics: string[];
  examBoards: ExamBoard[];
}

export interface AthroPromptContext {
  studentName?: string;
  recentTopics?: string[];
  confidenceScores?: Record<string, number>;
  examBoard?: ExamBoard;
  currentTopic?: string;
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
