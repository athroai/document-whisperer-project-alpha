
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { progressService } from '@/services/progressService';
import { StudentProgress, SubjectProgress } from '@/types/progress';
import ProgressChart from '@/components/progress/ProgressChart';
import ProgressSummaryCards from '@/components/progress/ProgressSummaryCards';
import ProgressDetails from '@/components/progress/ProgressDetails';
import SubjectProgressSelector from '@/components/progress/SubjectProgressSelector';
import NoProgressData from '@/components/progress/NoProgressData';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const StudentProgressPage: React.FC = () => {
  const { state } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<StudentProgress | null>(null);
  const [activeSubject, setActiveSubject] = useState<string>('');
  
  // Load progress data
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!state.user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await progressService.getStudentProgress(state.user.id);
        setProgressData(data);
        
        // Set first subject as active by default
        if (data.subjects.length > 0 && !activeSubject) {
          setActiveSubject(data.subjects[0].subject);
        }
      } catch (err) {
        console.error('Failed to fetch progress data:', err);
        setError('Failed to load progress data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgressData();
  }, [state.user]);
  
  // Get the active subject data
  const activeSubjectData: SubjectProgress | undefined = 
    progressData?.subjects.find(s => s.subject === activeSubject);
  
  // Handler for subject change
  const handleSubjectChange = (subject: string) => {
    setActiveSubject(subject);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Progress</h1>
        
        <div className="mb-4">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        
        <Skeleton className="h-[300px] w-full mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Progress</h1>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // No data state
  if (!progressData || progressData.subjects.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Progress</h1>
        <NoProgressData />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Progress</h1>
      
      {/* Subject selector */}
      <div className="mb-6">
        <SubjectProgressSelector 
          subjects={progressData.subjects}
          activeSubject={activeSubject}
          onSubjectChange={handleSubjectChange}
        />
      </div>
      
      {activeSubjectData ? (
        <>
          {/* Summary cards */}
          <div className="mb-6">
            <ProgressSummaryCards data={activeSubjectData} />
          </div>
          
          {/* Progress chart */}
          <div className="mb-6">
            <ProgressChart 
              data={activeSubjectData.scoreHistory} 
              subject={activeSubjectData.subject} 
            />
          </div>
          
          {/* Additional details */}
          <ProgressDetails data={activeSubjectData} />
        </>
      ) : (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading subject data...</span>
        </div>
      )}
    </div>
  );
};

export default StudentProgressPage;
