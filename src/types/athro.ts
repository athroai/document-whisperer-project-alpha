/**
 * Athro-related type definitions
 */

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

export interface AthroExplanation {
  content: string;
  character: AthroCharacter;
  confidence_level?: number;
  topic?: string;
  related_concepts?: string[];
}

export interface AthroQuiz {
  id: string;
  subject: string;
  topic?: string;
  questions: AthroQuestion[];
  difficulty_level?: 'easy' | 'medium' | 'hard';
  time_limit_minutes?: number;
}

export interface AthroQuestion {
  id: string;
  text: string;
  options?: string[];
  correct_answer: string | number | boolean;
  explanation?: string;
  topic?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
}

export type AthroSubject = 'Mathematics' | 'Science' | 'English' | 'History' | 'Geography';

export type AthroLanguage = 'en' | 'cy' | 'fr' | 'es' | 'de';
