
export interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'parent';
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
