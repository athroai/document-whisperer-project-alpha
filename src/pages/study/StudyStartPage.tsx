
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAthro } from '@/contexts/AthroContext';
import { useStudentClass } from '@/contexts/StudentClassContext';
import AthroSelector from '@/components/athro/AthroSelector';
import { useAuth } from '@/contexts/AuthContext';
import { startStudySession } from '@/utils/studySessionManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen } from 'lucide-react';

const StudyStartPage: React.FC = () => {
  const { characters, setActiveCharacter } = useAthro();
  const { enrolledSubjects, loading } = useStudentClass();
  const { state } = useAuth();
  const navigate = useNavigate();

  // Custom handler for when an Athro is selected
  const handleSelectAthro = (character: any) => {
    // Save the study session context
    startStudySession({
      subject: character.subject,
      entryMode: 'selfStudy',
      startedAt: Date.now(),
      taskId: null,
      taskTitle: null
    });
    
    // Set the active character in the AthroContext
    setActiveCharacter(character);
    
    // Navigate to the appropriate Athro page
    const subjectPath = getAthroPathFromSubject(character.subject);
    navigate(`/athro/${subjectPath}`);
  };

  // Helper function to map subject name to path
  const getAthroPathFromSubject = (subject: string): string => {
    const subjectMap: Record<string, string> = {
      'Mathematics': 'maths',
      'Science': 'science',
      'English': 'english',
      'Welsh': 'welsh',
      'Languages': 'languages',
      'History': 'history',
      'Geography': 'geography',
      'RE': 're'
    };
    
    return subjectMap[subject] || subject.toLowerCase();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Start a Self-Study Session</h1>
      <p className="text-muted-foreground mb-6">
        Pick a subject you'd like to study right now. This won't be saved unless you submit something.
      </p>
      
      {!loading && enrolledSubjects.length === 0 ? (
        <Alert className="mb-6">
          <BookOpen className="h-4 w-4" />
          <AlertTitle>No subjects enrolled</AlertTitle>
          <AlertDescription>
            You're not currently enrolled in any subjects. Please contact your teacher to get enrolled.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Choose Your Study Mentor</CardTitle>
            <CardDescription>
              Select a subject to begin an independent study session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AthroSelector onSelectAthro={handleSelectAthro} mode="self-study" />
          </CardContent>
        </Card>
      )}
      
      {import.meta.env.DEV && (
        <div className="mt-8 p-4 border border-dashed rounded-md bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Debug Information:</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <div><strong>Page:</strong> StudyStartPage</div>
            <div><strong>User:</strong> {state.user?.email || 'Not logged in'}</div>
            <div><strong>Role:</strong> {state.user?.role || 'Unknown'}</div>
            <div><strong>Characters Loaded:</strong> {characters.length}</div>
            <div><strong>Enrolled Subjects:</strong> {enrolledSubjects.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyStartPage;
