
import { useState, useEffect } from 'react';
import { User } from '../types/auth';

interface RoleAccessResult {
  hasAccess: boolean;
  message?: string;
}

/**
 * Custom hook to check if a user has the required role access
 * @param user The current user object
 * @param requiredRole The role required for access
 * @returns Object containing access status and optional message
 */
export const useRoleAccess = (
  user: User | null, 
  requiredRole?: 'student' | 'teacher' | 'parent' | 'admin'
): RoleAccessResult => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setMessage('User not authenticated');
      return;
    }

    // If no specific role is required, grant access
    if (!requiredRole) {
      setHasAccess(true);
      return;
    }

    // Check if user has the required role
    if (user.role === requiredRole) {
      setHasAccess(true);
    } else {
      setHasAccess(false);
      setMessage(`Access requires ${requiredRole} role, but user has ${user.role} role`);
      console.log(`Role mismatch: Required ${requiredRole}, user has ${user.role}`);
    }
  }, [user, requiredRole]);

  return { hasAccess, message };
};
