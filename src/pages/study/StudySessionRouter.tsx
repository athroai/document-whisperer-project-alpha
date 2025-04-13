
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentService } from '@/services/assignmentService';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StudySessionRouter: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAssignments = async () => {
      if (!state.user) {
        navigate('/login');
        return;
      }

      try {
        // Check if the student has assigned work
        const assignments = await assignmentService.getStudentAssignments(state.user.id);
        const hasAssignedWork = assignments.some(a => !a.isPastDue && !a.hasSubmitted);
        
        if (hasAssignedWork) {
          navigate('/study/assigned');
        } else {
          navigate('/study/start');
        }
      } catch (error) {
        console.warn('Failed to fetch assignments, defaulting to self-study mode', error);
        setError('Could not check for assigned work. You will be redirected to self-study mode.');
        
        // Set a timeout before redirecting to show the error message
        setTimeout(() => {
          navigate('/study/start');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    checkAssignments();
  }, [navigate, state.user]);

  // Handle manual redirect
  const handleManualRedirect = () => {
    navigate('/study/start');
  };

  // Show a loading indicator while checking assignments
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {isLoading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Setting Up Your Study Session</h2>
            <p className="text-muted-foreground">Checking for assigned tasks and preparing your study environment...</p>
          </>
        ) : error ? (
          <>
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Study Session Setup</h2>
            <p className="text-amber-600 mb-4">{error}</p>
            <Button onClick={handleManualRedirect}>
              Continue to Self-Study
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default StudySessionRouter;
