import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentService } from '@/services/assignmentService';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  getStudySessionContext,
  checkForAbandonedSessions,
  clearStudySessionContext
} from '@/utils/studySessionManager';
import useTabSync from '@/hooks/useTabSync';

const StudySessionRouter: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [existingSessionInfo, setExistingSessionInfo] = useState<{
    subject: string;
    startedAt: number;
  } | null>(null);

  // Check for tab sync conflicts
  const { hasMultipleTabs } = useTabSync('STUDY_STATE_CHANGE', {
    onConflict: () => {
      // If multiple tabs are open, show a warning
      setError("Multiple study tabs detected. Please close other study session tabs to avoid conflicts.");
    }
  });

  useEffect(() => {
    // Defined outside to ensure we can clear it in cleanup
    let assignmentTimeout: NodeJS.Timeout;
    
    const checkExistingSession = async () => {
      if (!state.user?.id) return null;
      
      // Check for abandoned sessions and clean them up
      const wasAbandoned = await checkForAbandonedSessions(state.user.id);
      
      if (wasAbandoned) {
        console.log("Abandoned study session cleared");
      }
      
      // Check if there's an active session
      const sessionContext = await getStudySessionContext(state.user.id);
      
      return sessionContext;
    };
    
    const checkAssignments = async () => {
      if (!state.user) {
        navigate('/login');
        return;
      }

      // Check role first
      if (state.user.role === 'teacher' || state.user.role === 'admin') {
        setError("Teacher accounts don't have access to study sessions");
        setIsLoading(false);
        return;
      }
      
      // Check if there's an existing session
      const existingSession = await checkExistingSession();
      
      if (existingSession) {
        setHasExistingSession(true);
        setExistingSessionInfo({
          subject: existingSession.subject,
          startedAt: existingSession.startedAt
        });
        setIsLoading(false);
        return;
      }

      try {
        // Set a timeout to ensure we don't get stuck in loading state
        assignmentTimeout = setTimeout(() => {
          console.log("Assignment check timed out, defaulting to self-study");
          navigate('/study/start');
          setIsLoading(false);
        }, 3000);
        
        // Only try to fetch assignments if we have a valid user ID
        if (state.user?.id) {
          // Check if the student has assigned work
          const assignments = await assignmentService.getStudentAssignments(state.user.id);
          
          const hasAssignedWork = assignments.some(a => !a.isPastDue && !a.hasSubmitted);
          
          if (hasAssignedWork) {
            navigate('/study/assigned');
          } else {
            navigate('/study/start');
          }
        } else {
          // No valid user ID, go to self-study
          navigate('/study/start');
        }
      } catch (error) {
        console.warn('Failed to fetch assignments, defaulting to self-study mode', error);
        setError('Could not check for assigned work. You will be redirected to self-study mode.');
        
        // Set a timeout before redirecting to show the error message
        setTimeout(() => {
          navigate('/study/start');
        }, 2000);
      } finally {
        clearTimeout(assignmentTimeout);
        setIsLoading(false);
      }
    };

    checkAssignments();
    
    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (assignmentTimeout) clearTimeout(assignmentTimeout);
    };
  }, [navigate, state.user]);

  // Handle manual redirect
  const handleManualRedirect = () => {
    navigate('/study/start');
  };

  // Return to dashboard if teacher
  const handleReturnToDashboard = () => {
    navigate(state.user?.role === 'teacher' ? '/teacher' : '/home');
  };
  
  // Handle resuming an existing session
  const handleResumeSession = () => {
    if (existingSessionInfo?.subject) {
      navigate(`/athro/${existingSessionInfo.subject.toLowerCase()}`);
    }
  };
  
  // Handle abandoning an existing session
  const handleAbandonSession = async () => {
    if (state.user?.id) {
      await clearStudySessionContext(state.user.id);
      setHasExistingSession(false);
      // Re-check for assignments
      navigate('/study');
    }
  };
  
  const formatSessionDuration = (startTime: number) => {
    const durationMs = Date.now() - startTime;
    const minutes = Math.floor(durationMs / 60000);
    
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {isLoading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Setting Up Your Study Session</h2>
            <p className="text-muted-foreground">Checking for assigned tasks and preparing your study environment...</p>
          </>
        ) : hasExistingSession && existingSessionInfo ? (
          <>
            <Clock className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Active Study Session Found</h2>
            
            <Alert variant="default" className="mb-4 max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ongoing Session</AlertTitle>
              <AlertDescription>
                You have an ongoing study session for <strong>{existingSessionInfo.subject}</strong> that has been active for {formatSessionDuration(existingSessionInfo.startedAt)}.
                Would you like to resume where you left off?
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-4">
              <Button variant="default" onClick={handleResumeSession}>
                Resume Session
              </Button>
              <Button variant="outline" onClick={handleAbandonSession}>
                Start New Session
              </Button>
            </div>
            
            {hasMultipleTabs && (
              <p className="text-sm text-red-500 mt-4">
                Warning: Multiple study tabs detected. Close other tabs to avoid conflicts.
              </p>
            )}
          </>
        ) : error ? (
          <>
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Study Session Setup</h2>
            
            {state.user?.role === 'teacher' || state.user?.role === 'admin' ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Restricted</AlertTitle>
                <AlertDescription>
                  Teacher accounts don't have access to student study sessions.
                </AlertDescription>
              </Alert>
            ) : (
              <p className="text-amber-600 mb-4">{error}</p>
            )}
            
            <Button 
              onClick={state.user?.role === 'teacher' || state.user?.role === 'admin' ? 
                handleReturnToDashboard : handleManualRedirect}
            >
              {state.user?.role === 'teacher' || state.user?.role === 'admin' ? 
                'Return to Dashboard' : 'Continue to Self-Study'}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default StudySessionRouter;
