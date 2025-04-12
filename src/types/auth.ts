
export interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  schoolId?: string;
  licenseExempt?: boolean;
  examBoard?: 'wjec' | 'ocr' | 'aqa' | 'none';
  confidenceScores?: Record<string, number>;
  rememberMe?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface UploadedFile {
  id: string;
  uploadedBy: string;
  subject: string;
  fileType: 'paper' | 'notes' | 'quiz';
  visibility: 'public' | 'private';
  filename: string;
  storagePath: string;
  timestamp: string;
  label?: string;
}
