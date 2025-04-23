
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface PlanGeneratorProps {
  onboardingData: {
    subjects: { subject: string; confidence: 'low' | 'medium' | 'high' }[];
    availability: {
      days: number[];
      sessionsPerDay: number;
      sessionDuration: number;
    };
    preferences?: {
      focusMode?: 'pomodoro' | 'continuous';
      preferredTime?: 'morning' | 'afternoon' | 'evening';
      reviewFrequency?: 'daily' | 'weekly';
    };
  };
  completeOnboarding: () => void;
  generationComplete: boolean;
  generationProgress: number;
  isSubmitting: boolean;
  goToCalendar: () => void;
}

export const PlanGenerator: React.FC<PlanGeneratorProps> = ({
  onboardingData,
  completeOnboarding,
  generationComplete,
  generationProgress,
  isSubmitting,
  goToCalendar,
}) => {
  const { subjects, availability } = onboardingData;
  // Set default preferences if they don't exist
  const preferences = onboardingData.preferences || {
    focusMode: 'pomodoro',
    preferredTime: 'afternoon',
    reviewFrequency: 'daily'
  };
  
  const totalSessionsPerWeek = availability.days.length * availability.sessionsPerDay;
  const totalStudyTimePerWeek = totalSessionsPerWeek * availability.sessionDuration;
  const subjectsCount = subjects.length;
  
  // Calculate estimated sessions per subject
  const sessionsPerSubject = Math.max(1, Math.floor(totalSessionsPerWeek / subjectsCount));
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Generate Your Study Plan</h2>
        <p className="text-gray-600">
          We'll create a personalized study plan based on your preferences.
        </p>
      </div>

      <div className="bg-blue-50 p-5 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Your Study Plan Overview</h3>
        
        <div className="space-y-4">
          <div>
            <div className="font-medium">Subjects</div>
            <p className="text-sm">
              {subjects.length} subjects selected: {subjects.map(s => s.subject).join(', ')}
            </p>
          </div>
          
          <div>
            <div className="font-medium">Schedule</div>
            <p className="text-sm">
              {availability.sessionsPerDay} session{availability.sessionsPerDay > 1 ? 's' : ''} per day, 
              {' '}{availability.sessionDuration} minutes each
              <br />
              Study days: {availability.days.length} days per week
              <br />
              Total weekly study time: {Math.round(totalStudyTimePerWeek / 60)} hours {totalStudyTimePerWeek % 60} minutes
            </p>
          </div>
          
          <div>
            <div className="font-medium">Learning Preferences</div>
            <p className="text-sm">
              Focus mode: {preferences.focusMode === 'pomodoro' ? 'Pomodoro Technique (25/5)' : 'Continuous Study'}
              <br />
              Preferred time: {preferences.preferredTime?.charAt(0).toUpperCase() + preferences.preferredTime?.slice(1) || 'Afternoon'}
              <br />
              Reviews: {preferences.reviewFrequency === 'daily' ? 'Daily Quick Reviews' : 'Weekly Deep Reviews'}
            </p>
          </div>
          
          <div>
            <div className="font-medium">Distribution</div>
            <p className="text-sm">
              Each subject will get approximately {sessionsPerSubject} session{sessionsPerSubject > 1 ? 's' : ''} per week
              <br />
              Estimated coverage: {Math.round((sessionsPerSubject * availability.sessionDuration) / 60)} hours per subject per week
            </p>
          </div>
        </div>
      </div>

      {isSubmitting && !generationComplete && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            <p>Generating your personalized study plan...</p>
          </div>
          <Progress value={generationProgress} className="h-2" />
          <p className="text-sm text-gray-500">
            {generationProgress < 30 && "Creating your subject preferences..."}
            {generationProgress >= 30 && generationProgress < 60 && "Setting up your study schedule..."}
            {generationProgress >= 60 && generationProgress < 90 && "Creating calendar events..."}
            {generationProgress >= 90 && "Finalizing your study plan..."}
          </p>
        </div>
      )}

      {generationComplete ? (
        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Study Plan Ready!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your personalized study plan has been created. View it in your calendar.
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center pt-4">
            <Button onClick={goToCalendar} className="space-x-2">
              <Calendar className="h-4 w-4" />
              <span>View My Calendar</span>
            </Button>
          </div>
        </div>
      ) : (
        !isSubmitting && (
          <div className="flex justify-center pt-4">
            <Button 
              onClick={completeOnboarding} 
              disabled={isSubmitting}
              className="space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Create My Study Plan</span>
            </Button>
          </div>
        )
      )}
    </div>
  );
};
