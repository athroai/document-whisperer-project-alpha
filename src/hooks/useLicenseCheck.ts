
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/auth';

interface LicenseCheckResult {
  isLicensed: boolean;
  redirectTo: (path: string) => void;
}

/**
 * Custom hook to check if a user has valid license access
 * @param user The current user object
 * @returns Object containing license status and redirect function
 */
export const useLicenseCheck = (user: User | null): LicenseCheckResult => {
  const [isLicensed, setIsLicensed] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setIsLicensed(false);
      return;
    }

    // License is valid if user is exempt or has a schoolId
    const hasValidLicense = user.licenseExempt || 
                            Boolean(user.schoolId) || 
                            user.email.endsWith('@nexastream.co.uk');
    
    setIsLicensed(hasValidLicense);
  }, [user]);

  const redirectTo = (path: string) => {
    navigate(path);
  };

  return { isLicensed, redirectTo };
};
