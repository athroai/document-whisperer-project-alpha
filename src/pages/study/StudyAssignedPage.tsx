import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentService } from '@/services/assignmentService';
import { StudentAssignmentView } from '@/types/assignment';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { startStudySession } from '@/utils/studySessionManager';

const StudyAssignedPage: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<StudentAssignmentView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignments = async () => {
      if (!state.user) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        const fetchedAssignments = await assignmentService.getStudentAssignments(state.user.id);
        
        // Filter for active assignments (not past due and not submitted)
        const activeAssignments = fetchedAssignments.filter(
          a => !a.isPastDue && !a.hasSubmitted
        );
        
        setAssignments(activeAssignments);
      } catch (err) {
        console.error('Failed to fetch assignments:', err);
        setError('Failed to load your assignments. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignments();
  }, [navigate, state.user]);

  const handleStartSession = (assignment: StudentAssignmentView) => {
    // Save the study session context
    startStudySession(state.user?.id || 'anonymous', {
      subject: assignment.assignment.subject,
      entryMode: 'assigned',
      startedAt: Date.now(),
      taskId: assignment.assignment.id,
      taskTitle: assignment.assignment.title,
      lastActive: Date.now() // Add the required lastActive property
    });
    
    // Navigate to the appropriate Athro page based on subject
    const subjectPath = getAthroPathFromSubject(assignment.assignment.subject);
    navigate(`/athro/${subjectPath}`);
  };
  
  // Helper function to map subject name to path
  const getAthroPathFromSubject = (subject: string): string => {
    const subjectMap: Record<string, string> = {
      'mathematics': 'maths',
      'science': 'science',
      'english': 'english',
      'welsh': 'welsh',
      'languages': 'languages',
      'history': 'history',
      'geography': 'geography',
      're': 're'
    };
    
    return subjectMap[subject.toLowerCase()] || subject.toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Assigned Study Tasks</h1>
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Assigned Study Tasks</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading assignments</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/study/start')} className="mt-4">
          Switch to Self-Study Mode
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Assigned Study Tasks</h1>
      
      {assignments.length === 0 ? (
        <div className="bg-muted p-6 rounded-lg text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Active Assignments</h2>
          <p className="text-muted-foreground mb-6">
            You don't have any active assigned tasks at the moment.
          </p>
          <Button onClick={() => navigate('/study/start')}>
            Start Self-Study Session
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card key={assignment.assignment.id} className="overflow-hidden">
              <CardHeader className={`bg-${getSubjectColor(assignment.assignment.subject)}-50`}>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-2">{assignment.assignment.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {assignment.assignment.subject}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {assignment.daysUntilDue > 0 
                      ? `Due in ${assignment.daysUntilDue} days` 
                      : 'Due today'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="line-clamp-3 text-sm mb-3">{assignment.assignment.description}</p>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Due: {new Date(assignment.assignment.dueDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    Assigned by: {assignment.assignment.assignedBy}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 p-4">
                <Button 
                  className="w-full" 
                  onClick={() => handleStartSession(assignment)}
                >
                  Start Task
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {assignments.length > 0 && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate('/study/start')}>
            Start Self-Study Session Instead
          </Button>
        </div>
      )}
      
      {import.meta.env.DEV && (
        <div className="mt-8 p-4 border border-dashed rounded-md bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Debug Information:</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <div><strong>Page:</strong> StudyAssignedPage</div>
            <div><strong>User:</strong> {state.user?.email || 'Not logged in'}</div>
            <div><strong>Role:</strong> {state.user?.role || 'Unknown'}</div>
            <div><strong>Assignments Loaded:</strong> {assignments.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get subject color for the card header
const getSubjectColor = (subject: string): string => {
  const subjectColors: Record<string, string> = {
    'mathematics': 'purple',
    'science': 'green',
    'english': 'blue',
    'welsh': 'red',
    'languages': 'yellow',
    'history': 'amber',
    'geography': 'emerald',
    're': 'sky',
    'default': 'gray'
  };
  
  return subjectColors[subject.toLowerCase()] || subjectColors.default;
};

export default StudyAssignedPage;
