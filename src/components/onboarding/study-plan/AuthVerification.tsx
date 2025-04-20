
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader, AlertCircle } from 'lucide-react';

interface AuthVerificationProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  authVerified: boolean | null;
}

export const AuthVerification: React.FC<AuthVerificationProps> = ({ 
  isAuthenticated, 
  isLoading,
  authVerified 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Verifying authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You need to be logged in to generate a study plan.
        </AlertDescription>
      </Alert>
    );
  }

  if (authVerified === false) {
    return (
      <Alert variant="warning" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          We're having trouble verifying your account. Your plan may be saved locally only.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
