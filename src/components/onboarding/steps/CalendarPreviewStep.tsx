
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowLeft, Calendar, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionCreation } from '@/hooks/calendar/useSessionCreation';

export const CalendarPreviewStep: React.FC = () => {
  const { 
    updateOnboardingStep, 
    selectedSubjects, 
    studySlots,
    learningPreferences,
    completeOnboarding 
  } = useOnboarding();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const { createBatchCalendarSessions } = useSessionCreation();
  
  const handleGenerateCalendar = async () => {
    setIsGenerating(true);
    
    try {
      // Group subject by confidence level to give more time to subjects with lower confidence
      const subjectsByPriority = {
        low: selectedSubjects.filter(s => s.confidence === 'high').map(s => s.subject),
        medium: selectedSubjects.filter(s => s.confidence === 'medium').map(s => s.subject),
        high: selectedSubjects.filter(s => s.confidence === 'low').map(s => s.subject),
      };
      
      // Create sessions starting from the current week
      const today = new Date();
      const sessions = [];
      
      // Convert study slots to actual calendar events
      for (const slot of studySlots) {
        let dayDiff = slot.day_of_week - today.getDay();
        if (dayDiff <= 0) dayDiff += 7; // Move to next week if day has passed
        
        const sessionDate = new Date(today);
        sessionDate.setDate(today.getDate() + dayDiff);
        sessionDate.setHours(slot.preferred_start_hour, 0, 0, 0);
        
        // Select subject based on priority and rotation
        // We prioritize subjects where confidence is low (high priority)
        const allSubjects = [
          ...subjectsByPriority.high,
          ...subjectsByPriority.medium,
          ...subjectsByPriority.low
        ];
        
        if (allSubjects.length === 0) continue;
        
        // Select subject in a round-robin fashion from priorities
        const subjectIndex = sessions.length % allSubjects.length;
        const subject = allSubjects[subjectIndex];
        
        const endTime = new Date(sessionDate);
        endTime.setMinutes(endTime.getMinutes() + slot.slot_duration_minutes);
        
        sessions.push({
          title: `${subject} Study Session`,
          subject,
          topic: '',
          startTime: sessionDate,
          endTime,
          eventType: 'study_session',
          selfCreated: true
        });
      }
      
      // Create the sessions in batch
      if (sessions.length > 0) {
        await createBatchCalendarSessions(sessions, { selfCreated: true });
      }
      
      // Complete the onboarding process
      await completeOnboarding();
      
      setIsComplete(true);
      toast.success("Your study calendar has been created!");
      
    } catch (error) {
      console.error('Error generating calendar:', error);
      toast.error("There was an issue creating your calendar. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleViewCalendar = () => {
    navigate('/calendar');
  };

  const subjectList = selectedSubjects.map(s => s.subject).join(', ');
  const daysPerWeek = [...new Set(studySlots.map(s => s.day_of_week))].length;
  const totalSessions = studySlots.length;
  const learningStylesList = Object.values(learningPreferences?.learningStyles || []).join(', ') || 'Not specified';
  
  return (
    <div className="space-y-6">
      {!isComplete ? (
        <>
          <div>
            <h2 className="text-xl font-semibold mb-2">Your Study Plan Summary</h2>
            <p className="text-gray-600 text-sm mb-4">
              Here's a summary of your preferences. We'll use this information to create your personalized study calendar.
            </p>
          </div>
          
          <Card className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Subjects</h3>
              <p className="mt-1">{subjectList}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Study Schedule</h3>
              <p className="mt-1">{daysPerWeek} days per week, {totalSessions} total sessions</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Learning Styles</h3>
              <p className="mt-1">{learningStylesList}</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-md text-sm">
              <div className="flex items-start">
                <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 mr-2" />
                <div>
                  <span className="font-medium text-purple-800">Smart Calendar Creation</span>
                  <p className="text-purple-700 mt-1">
                    We'll create a balanced study plan that gives more attention to subjects where you need more help.
                  </p>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="pt-4 flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => updateOnboardingStep('learning-style')}
              disabled={isGenerating}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleGenerateCalendar}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>Generating Your Calendar...</>
              ) : (
                <>Create My Study Calendar <Calendar className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-6 space-y-6">
          <div className="bg-green-100 w-20 h-20 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-semibold">Your Calendar is Ready!</h2>
          
          <p className="text-gray-600 max-w-md mx-auto">
            We've created your personal study calendar based on your preferences. View it now to see your study schedule.
          </p>
          
          <Button
            onClick={handleViewCalendar}
            size="lg"
            className="mt-4 bg-purple-600 hover:bg-purple-700"
          >
            View My Study Calendar <Calendar className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
