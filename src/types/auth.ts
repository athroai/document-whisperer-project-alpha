
// If this file already exists, we'll add to it
// This is a simplified version, assuming the file already has some content

// Adding the User interface that was missing
export interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'parent';
  displayName: string;
  createdAt: Date;
  rememberMe: boolean;
  licenseExempt?: boolean;
  schoolId?: string;  // Added this property for LicenseCheck and ProtectedRoute
  examBoard?: 'wjec' | 'ocr' | 'aqa' | 'none';  // Properly typed exam board property
  confidenceScores?: {
    [subject: string]: number;
  };
}

// Adding the AuthState interface that was missing
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface UploadedFile {
  id: string;
  uploadedBy: string;
  subject: string;
  fileType: string; // 'paper', 'notes', 'quiz', etc.
  visibility: string; // 'public', 'private', 'class-only'
  filename: string;
  storagePath: string;
  timestamp: string;
  label?: string;
}

export interface UserPreference {
  userId: string;
  theme: string;
  notifications: boolean;
  lastUpdated: string;
}

// For the file upload structure in Firestore
export interface UploadedResource {
  id: string;
  uploadedBy: string;
  role: string;
  subject: string;
  classId?: string;
  fileUrl: string;
  fileName: string;
  uploadTime: string;
  visibility: 'public' | 'class-only' | 'private';
  type: 'topic-notes' | 'quiz' | 'past-paper' | 'notes';
}

// For teacher preferences in Firestore
export interface TeacherPreferenceRecord {
  teacherId: string;
  classId: string;
  markingStyle: 'detailed' | 'headline-only' | 'encouraging';
  lastUpdated: string;
}
