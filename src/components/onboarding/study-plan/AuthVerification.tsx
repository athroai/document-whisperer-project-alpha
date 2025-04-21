
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>Verifying authentication...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Alert className="mb-6">
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          <p className="mb-3">You need to be logged in to set up your study plan.</p>
          <Button onClick={() => navigate('/login')}>
            Log In
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (authVerified === false) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p className="mb-3">There was an issue verifying your authentication. Please try again.</p>
          <Button variant="outline" onClick={() => navigate('/login')}>
            Log In Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};
