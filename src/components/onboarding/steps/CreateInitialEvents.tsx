
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useSessionCreation } from '@/hooks/calendar/useSessionCreation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const CreateInitialEvents: React.FC = () => {
  const { selectedSubjects, updateOnboardingStep, completeOnboarding } = useOnboarding();
  const { createBatchCalendarSessions, isCreating } = useSessionCreation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { state: authState } = useAuth();

  const handleBack = () => updateOnboardingStep('schedule');

  const handleCreateEvents = async () => {
    if (isSubmitting || !authState.user?.id) {
      console.log('Cannot create events: submitting=', isSubmitting, 'userId=', authState.user?.id);
      return;
    }

    setIsSubmitting(true);

    try {
      // First complete onboarding to ensure user data is saved
      await completeOnboarding();
      console.log('Onboarding completed for user:', authState.user.id);
      
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Start from Monday

      // Create one slot per subject
      const sessions = selectedSubjects.map((subjectPref, index) => {
        // Create sessions on consecutive days starting from Monday of current week
        const sessionDate = new Date(startOfWeek);
        sessionDate.setDate(sessionDate.getDate() + index);
        
        // Set study sessions to start at 4 PM
        const startTime = new Date(sessionDate);
        startTime.setHours(16, 0, 0, 0);
        
        // Each session lasts 45 minutes
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + 45);

        return {
          title: `${subjectPref.subject} Study Session`,
          subject: subjectPref.subject,
          startTime,
          endTime,
          eventType: 'study_session'
        };
      });

      console.log('Creating initial study sessions:', sessions);
      
      if (sessions.length === 0) {
        throw new Error('No subjects selected for scheduling');
      }
      
      try {
        const createdSessions = await createBatchCalendarSessions(sessions);
        console.log('Created sessions:', createdSessions);
        
        if (createdSessions && createdSessions.length > 0) {
          toast({
            title: "Success!",
            description: `Created ${createdSessions.length} study sessions for your calendar.`
          });
          
          // Force a clear cache for calendar events
          localStorage.removeItem('cached_calendar_events');
          
          // Add a delay to ensure database writes complete
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Navigate to calendar with refresh flag
          navigate(`/calendar?fromSetup=true&refresh=true`);
        } else {
          throw new Error('No sessions were created');
        }
      } catch (error) {
        console.error('Error creating calendar events:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create Your Study Schedule</h2>
        <p className="text-muted-foreground mt-2">
          We'll create initial study sessions for each of your subjects
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Selected Subjects:</h3>
        <ul className="space-y-2">
          {selectedSubjects.map((subject, index) => (
            <li key={subject.subject} className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3">
                {index + 1}
              </span>
              {subject.subject}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack} disabled={isSubmitting || isCreating}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleCreateEvents}
          className="bg-purple-600 hover:bg-purple-700"
          disabled={isSubmitting || isCreating}
        >
          {(isSubmitting || isCreating) ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Study Sessions"
          )}
        </Button>
      </div>
    </div>
  );
};
