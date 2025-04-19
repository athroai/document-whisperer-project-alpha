
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { StudyPlanCard } from './StudyPlanCard';
import { UpcomingSessionsList } from './UpcomingSessionsList';

interface StudyPlanResultsProps {
  studyPlan: any[];
  upcomingSessions: any[];
  onBack: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

export const StudyPlanResults: React.FC<StudyPlanResultsProps> = ({
  studyPlan,
  upcomingSessions,
  onBack,
  onComplete,
  isSubmitting
}) => {
  return (
    <>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
        <p className="text-green-800 text-sm">
          Your personalized study plan has been created based on your preferences and learning style
        </p>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-medium">Study Focus by Subject</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {studyPlan.map((subject, index) => (
            <StudyPlanCard
              key={index}
              subject={subject.subject}
              confidence={subject.confidence}
              sessionsPerWeek={subject.sessionsPerWeek}
            />
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-medium">Your Upcoming Study Sessions</h3>
        <UpcomingSessionsList
          sessions={upcomingSessions}
          totalSessions={studyPlan.reduce((sum, subject) => sum + subject.sessionsPerWeek, 0)}
        />
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={onComplete}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Processing...
            </>
          ) : (
            'Complete Setup & Go to Calendar'
          )}
        </Button>
      </div>
    </>
  );
};
