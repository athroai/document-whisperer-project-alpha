import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentFeedbackPanel from '@/components/dashboard/StudentFeedbackPanel';
import { useStudentClass } from '@/contexts/StudentClassContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { featureFlags } from '@/config/featureFlags';
import { Badge } from '@/components/ui/badge';
import { MyGoalsTab } from '@/components/goals/MyGoalsTab';
import { useStudentRecord } from '@/contexts/StudentRecordContext';
import { GoalEncouragement } from '@/components/goals/GoalEncouragement';
import { useState as useRefreshState } from 'react';
import GoalsService from '@/services/goalsService';
import { useAuth } from '@/contexts/AuthContext';
import { StudyGoal } from '@/types/goals';
import { useTranslation } from '@/hooks/useTranslation';

const StudySessionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('session');
  const { enrolledSubjects, loading, isMockEnrollment } = useStudentClass();
  const { studentRecord, getRecommendedSubject } = useStudentRecord();
  const { state } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Track active goals for encouragement
  const [activeGoals, setActiveGoals] = useState<StudyGoal[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);

  // Check if the student is enrolled in any subjects
  const hasNoClasses = !loading && enrolledSubjects.length === 0;
  
  useEffect(() => {
    // If the user manually navigates to the legacy study page, we want to redirect them to the new study router
    navigate('/study', { replace: true });
  }, [navigate]);

  // Get active goals for the current user
  useEffect(() => {
    const loadActiveGoals = async () => {
      setIsLoadingGoals(true);
      if (state.user) {
        try {
          // Try to get goals from Firestore
          let userGoals = await GoalsService.getGoalsForUser(state.user.id);
          
          // If no goals from Firestore or offline, use mock data
          if (userGoals.length === 0) {
            userGoals = GoalsService.getLocalMockGoals(state.user.id);
          }
          
          // Filter to active goals
          const active = userGoals.filter(goal => goal.status === 'active');
          setActiveGoals(active);
        } catch (error) {
          console.error("Error loading goals:", error);
          setActiveGoals([]);
        } finally {
          setIsLoadingGoals(false);
        }
      }
    };
    
    loadActiveGoals();
  }, [state.user, refreshKey]);
  
  const handleNavigateToGoals = () => {
    setActiveTab('goals');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('athro.studySession')}</h1>
        <Button onClick={() => navigate('/study')} variant="outline">
          Go to New Study Session
        </Button>
      </div>
      
      <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Legacy Study Page</AlertTitle>
        <AlertDescription>
          This is the legacy study session page. We recommend using our new improved study experience.
        </AlertDescription>
        <div className="mt-2">
          <Button onClick={() => navigate('/study')} size="sm">
            Try New Study Experience
          </Button>
        </div>
      </Alert>
      
      {isMockEnrollment && (
        <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertTitle>Mock Enrollment Active</AlertTitle>
          <AlertDescription>
            You're using mock class data for testing purposes. No actual class assignments exist.
          </AlertDescription>
        </Alert>
      )}

      {hasNoClasses ? (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not assigned to any classes</AlertTitle>
          <AlertDescription>
            You're not currently assigned to a class. Please wait for your teacher to assign you.
          </AlertDescription>
          <Button onClick={() => navigate('/home')} className="mt-4">
            Return to Home
          </Button>
        </Alert>
      ) : (
        <>
          {!isLoadingGoals && activeGoals.length > 0 && activeTab !== 'goals' && (
            <div className="mb-6">
              <GoalEncouragement 
                goals={activeGoals} 
                onNavigateToGoal={handleNavigateToGoals}
              />
            </div>
          )}
        
          <Tabs defaultValue="session" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="session">{t('athro.studySession')}</TabsTrigger>
              <TabsTrigger value="goals">My Goals</TabsTrigger>
              <TabsTrigger value="feedback">My Feedback</TabsTrigger>
              <TabsTrigger value="history">Study History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="session" className="mt-0">
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Start a Study Session</h2>
                <p className="mb-6">Choose a subject and topic to begin studying with an Athro character.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Subject cards would go here */}
                  {enrolledSubjects.some(subject => subject.subject.toLowerCase() === 'mathematics') && (
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors"
                        onClick={() => navigate('/athro/maths')}>
                      <h3 className="font-medium text-lg mb-2">Mathematics</h3>
                      <p className="text-sm text-gray-600">Study with AthroMaths</p>
                      {isMockEnrollment && <Badge variant="outline" className="mt-2 bg-blue-50 border-blue-200 text-blue-700">Mock Session</Badge>}
                    </div>
                  )}
                  
                  {enrolledSubjects.some(subject => subject.subject.toLowerCase() === 'science') && (
                    <div className="bg-green-50 p-6 rounded-lg border border-green-100 cursor-pointer hover:bg-green-100 transition-colors"
                        onClick={() => navigate('/athro/science')}>
                      <h3 className="font-medium text-lg mb-2">Science</h3>
                      <p className="text-sm text-gray-600">Study with AthroScience</p>
                      {isMockEnrollment && <Badge variant="outline" className="mt-2 bg-blue-50 border-blue-200 text-blue-700">Mock Session</Badge>}
                    </div>
                  )}
                  
                  {enrolledSubjects.some(subject => subject.subject.toLowerCase() === 'english') && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => navigate('/athro/english')}>
                      <h3 className="font-medium text-lg mb-2">English</h3>
                      <p className="text-sm text-gray-600">Study with AthroEnglish</p>
                      {isMockEnrollment && <Badge variant="outline" className="mt-2 bg-blue-50 border-blue-200 text-blue-700">Mock Session</Badge>}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="goals" className="mt-0">
              <div className="p-6 bg-white rounded-lg shadow">
                <MyGoalsTab />
              </div>
            </TabsContent>
            
            <TabsContent value="feedback" className="mt-0">
              <StudentFeedbackPanel />
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Your Study History</h2>
                <p>Track your progress and review past study sessions.</p>
                
                {/* Study history content would go here */}
                <div className="mt-4 text-gray-500">
                  Study history will be shown here.
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default StudySessionPage;
