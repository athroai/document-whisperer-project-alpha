
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentService } from '@/services/assignmentService';
import { Loader2 } from 'lucide-react';

const StudySessionRouter: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

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
        navigate('/study/start');
      } finally {
        setIsLoading(false);
      }
    };

    checkAssignments();
  }, [navigate, state.user]);

  // Show a loading indicator while checking assignments
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Setting Up Your Study Session</h2>
        <p className="text-muted-foreground">Checking for assigned tasks and preparing your study environment...</p>
      </div>
    </div>
  );
};

export default StudySessionRouter;
