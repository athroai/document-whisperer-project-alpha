
import { ExamBoard } from '@/types/athro';

export interface Profile {
  full_name: string;
  avatar_url: string;
  website: string;
  examBoard: ExamBoard;
  study_subjects: string[];
  preferred_language: string;
}

export interface AuthState {
  session: any | null;
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  error?: string;
}

export interface UserUpdateData {
  displayName?: string;
  examBoard?: ExamBoard;
  email?: string;
  password?: string;
}
