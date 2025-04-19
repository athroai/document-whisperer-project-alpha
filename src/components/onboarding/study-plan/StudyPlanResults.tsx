
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, BookOpen, CalendarIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StudyPlanResultsProps {
  studyPlan: any[];
  calendarEvents: any[];
  onComplete: () => void;
  isSubmitting: boolean;
}

export const StudyPlanResults: React.FC<StudyPlanResultsProps> = ({ 
  studyPlan, 
  calendarEvents,
  onComplete,
  isSubmitting
}) => {
  const subjectColorMap: Record<string, string> = {
    'Mathematics': 'bg-purple-100 border-purple-300',
    'Science': 'bg-blue-100 border-blue-300',
    'English': 'bg-green-100 border-green-300',
    'History': 'bg-amber-100 border-amber-300',
    'Geography': 'bg-teal-100 border-teal-300',
    'Welsh': 'bg-red-100 border-red-300',
    'Languages': 'bg-indigo-100 border-indigo-300',
    'Religious Education': 'bg-pink-100 border-pink-300'
  };

  const defaultColor = 'bg-gray-100 border-gray-300';

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        <p className="text-green-800">
          Your personalized study plan has been created! Here's your schedule:
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Study Sessions by Subject</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studyPlan.map((subject, index) => (
            <Card key={index} className="p-4 border">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{subject.subject}</h4>
                <div 
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    subject.score < 50 ? 'bg-red-100 text-red-800' : 
                    subject.score < 80 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}
                >
                  {subject.score !== undefined ? `${subject.score}%` : 'No Quiz'}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Sessions per week: {subject.sessionsPerWeek}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {subject.score < 50 
                    ? 'Focus area: Intensive review needed' 
                    : subject.score < 80 
                      ? 'Focus area: Continued practice' 
                      : 'Focus area: Mastery and advanced topics'}
                </p>
              </div>
            </Card>
          ))}
        </div>
        
        <h3 className="text-lg font-medium mt-8">Your Upcoming Study Sessions</h3>
        <div className="space-y-3">
          {calendarEvents.slice(0, 5).map((event, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border ${
                subjectColorMap[event.subject] || defaultColor
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <div className="flex items-center mt-1 text-sm">
                    <Clock className="h-4 w-4 mr-1 opacity-70" />
                    <span>{event.formattedStart} - {event.formattedEnd}</span>
                  </div>
                </div>
                <BookOpen className="h-5 w-5 opacity-70" />
              </div>
            </div>
          ))}
          
          {calendarEvents.length > 5 && (
            <p className="text-sm text-center text-gray-500">
              +{calendarEvents.length - 5} more sessions scheduled in your calendar
            </p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/calendar'} 
          className="flex items-center"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          View Full Calendar
        </Button>
        <Button 
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Completing...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
};
