
import { ExamBoard } from './athro';

export interface Profile {
  id: string;
  email: string;
  name?: string;
  role: string;
  exam_board?: ExamBoard;
  preferred_language?: string;
  confidence_scores?: Record<string, number>;
  school_id?: string;
  welsh_eligible?: boolean;
  created_at?: string;
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

// Add missing types that other files are trying to import
export interface User {
  id: string;
  email: string;
  displayName?: string;
  role?: string;
  schoolId?: string;
  licenseExempt?: boolean;
  examBoard?: ExamBoard;
}

export interface UploadedFile {
  id: string;
  uploadedBy: string;
  subject: string;
  fileType: string;
  visibility: 'public' | 'class-only' | 'private';
  filename: string;
  storagePath: string;
  timestamp: string;
  label?: string;
}
