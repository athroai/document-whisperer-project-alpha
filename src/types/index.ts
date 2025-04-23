
/**
 * Core type definitions for the Athro application
 */

// Authentication types
export type UserRole = 'student' | 'teacher' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  role?: UserRole;
}

// General UI types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
