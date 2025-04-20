
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useSessionCreation } from '@/hooks/calendar/useSessionCreation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CreateInitialEvents: React.FC = () => {
  const { selectedSubjects, updateOnboardingStep, completeOnboarding } = useOnboarding();
  const { createBatchCalendarSessions, isCreating } = useSessionCreation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => updateOnboardingStep('schedule');

  const handleCreateEvents = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Mark onboarding as complete regardless of calendar event creation success
      await completeOnboarding();
      
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1);

      const sessions = selectedSubjects.map((subjectPref, index) => {
        const sessionDate = new Date(startOfWeek);
        sessionDate.setDate(sessionDate.getDate() + index);
        
        const startTime = new Date(sessionDate);
        startTime.setHours(15, 0, 0, 0);
        
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
      
      try {
        // Create study sessions with explicit error handling
        const createdSessions = await createBatchCalendarSessions(sessions);
        console.log('Created sessions:', createdSessions);
        
        if (createdSessions && createdSessions.length > 0) {
          toast({
            title: "Success!",
            description: `Created ${createdSessions.length} study sessions for your calendar.`
          });
        } else {
          toast({
            title: "Partial Success",
            description: "Onboarding completed, but no study sessions were created.",
            variant: "default"
          });
        }
      } catch (calendarError) {
        console.error('Error creating calendar events:', calendarError);
        toast({
          title: "Partial Success",
          description: "Onboarding completed, but some study sessions may not have been created.",
          variant: "default"
        });
      }
      
      // Always navigate to calendar even if calendar events fail
      localStorage.setItem('onboarding_completed', 'true');
      // Use refresh=true to force calendar refresh when navigating
      navigate('/calendar?fromSetup=true&refresh=true');
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
