
export interface StudySession {
  id: string;
  student_id: string;
  subject: string;
  topic?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  confidence_before?: number;
  confidence_after?: number;
  notes?: string;
  summary?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  needs_review?: boolean;
  created_at: string;
  transcript?: any;
}
