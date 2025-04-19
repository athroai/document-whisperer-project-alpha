
import React from 'react';

interface AuthVerificationProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  authVerified: boolean;
}

export const AuthVerification: React.FC<AuthVerificationProps> = ({ 
  isAuthenticated, 
  isLoading, 
  authVerified 
}) => {
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-amber-800">
          You need to be signed in to generate a study plan. Please refresh the page or sign in again.
        </p>
      </div>
    );
  }

  if (!authVerified && isAuthenticated) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-amber-800">
          Supabase authentication not verified. Please refresh the page or sign in again.
        </p>
      </div>
    );
  }

  return null;
};
