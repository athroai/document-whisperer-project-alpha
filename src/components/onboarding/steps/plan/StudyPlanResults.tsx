
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { CheckCircle, Clock, BookOpen } from 'lucide-react';
import { StudyPlanCard } from './StudyPlanCard';
import { UpcomingSessionsList } from './UpcomingSessionsList';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  const handleViewCalendar = () => {
    navigate('/calendar?fromSetup=true');
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
        <p className="text-green-800 text-sm">
          Your personalized study plan has been created and added to your calendar
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Study Focus by Subject</h3>
          <span className="text-xs text-muted-foreground">
            {studyPlan.reduce((sum, subject) => sum + subject.sessionsPerWeek, 0)} sessions/week
          </span>
        </div>
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
      
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="order-2 sm:order-1">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="order-1 sm:order-2 flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={handleViewCalendar}
            className="bg-white border-gray-200 hover:bg-gray-50 gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            View Calendar
          </Button>
          <Button 
            onClick={onComplete}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Complete Setup
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
