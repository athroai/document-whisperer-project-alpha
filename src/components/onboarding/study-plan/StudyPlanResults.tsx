
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Calendar, Loader } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';

interface StudyPlanProps {
  studyPlan: any; // The generated plan object
  calendarEvents: CalendarEvent[];
  onComplete: () => Promise<void>;
  isSubmitting: boolean;
}

export const StudyPlanResults: React.FC<StudyPlanProps> = ({
  studyPlan,
  calendarEvents,
  onComplete,
  isSubmitting
}) => {
  if (!studyPlan || !calendarEvents || calendarEvents.length === 0) {
    return (
      <div className="text-center py-6">
        <p>No study plan could be generated. Please try again.</p>
      </div>
    );
  }

  // Group events by subject for displaying
  const subjectGroups = calendarEvents.reduce((groups: Record<string, CalendarEvent[]>, event) => {
    const subject = event.subject || 'General';
    if (!groups[subject]) {
      groups[subject] = [];
    }
    groups[subject].push(event);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
          <Check className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold">Your Study Plan is Ready!</h2>
        <p className="text-muted-foreground mt-2">
          We've created {calendarEvents.length} study sessions based on your preferences
        </p>
      </div>

      <Card className="p-6">
        <h3 className="font-medium mb-4">Sessions by Subject</h3>
        <div className="space-y-4">
          {Object.entries(subjectGroups).map(([subject, events]) => (
            <div key={subject} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{subject}</h4>
                <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {events.length} sessions
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onComplete}
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-5 w-5" />
              Go to My Calendar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
