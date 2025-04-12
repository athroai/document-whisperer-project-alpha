
export interface AIMark {
  score: number;
  outOf: number;
  comment: string;
}

export interface TeacherMark {
  score: number | null;
  outOf: number;
  comment: string | null;
  override: boolean;
}

export interface MarkingRecord {
  id: string;
  submittedBy: string;
  assignedBy: string | null;
  subject: string;
  topic: string | null;
  source: 'quiz' | 'task' | 'athro_chat';
  originalPrompt: string;
  studentAnswer: string;
  aiMark: AIMark;
  teacherMark: TeacherMark | null;
  finalFeedback: string;
  visibility: 'student' | 'teacher' | 'admin';
  timestamp: string;
}

export interface MarkingRequest {
  prompt: string;
  answer: string;
  subject: string;
  topic?: string;
  examBoard?: string;
  sourceType?: 'quiz' | 'task' | 'athro_chat';
  userId?: string;
  teacherId?: string;
}

export interface MarkingResult {
  score: number;
  outOf: number;
  explanation: string;
  suggestedImprovement?: string;
  timestamp: string;
}

export type MarkingStyle = "encouraging" | "detailed" | "headline-only";

export interface MarkingFilter {
  teacherId?: string;
  studentId?: string;
  subject?: string;
  status?: 'ai_only' | 'teacher_reviewed';
  dateFrom?: string;
  dateTo?: string;
}
