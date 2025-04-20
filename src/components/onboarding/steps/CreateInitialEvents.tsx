
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CreateInitialEvents: React.FC = () => {
  const { selectedSubjects, updateOnboardingStep } = useOnboarding();
  const { createBatchCalendarSessions } = useCalendarEvents();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBack = () => updateOnboardingStep('schedule');

  const handleCreateEvents = async () => {
    try {
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

      await createBatchCalendarSessions(sessions);
      
      toast({
        title: "Success!",
        description: "Your study sessions have been scheduled."
      });
      
      navigate('/calendar');
    } catch (error) {
      console.error('Error creating calendar events:', error);
      toast({
        title: "Error",
        description: "Failed to create study sessions. Please try again.",
        variant: "destructive"
      });
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
        <Button variant="outline" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleCreateEvents}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Create Study Sessions
        </Button>
      </div>
    </div>
  );
};
