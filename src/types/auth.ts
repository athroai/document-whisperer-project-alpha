
import { ExamBoard } from './athro';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  exam_board?: ExamBoard;
  preferred_language?: string;
  confidence_scores?: Record<string, number>;
  school_id?: string;
  welsh_eligible?: boolean;
  created_at?: string;
  role: string;
}

export interface AuthState {
  session: any | null;
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  error?: string;
}

export interface UserUpdateData {
  full_name?: string;
  exam_board?: ExamBoard;
  email?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  created_at?: string;
  role?: string;
  school_id?: string;
  license_exempt?: boolean;
  exam_board?: ExamBoard;
}
