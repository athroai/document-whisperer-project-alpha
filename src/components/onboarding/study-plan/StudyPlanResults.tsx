
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

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
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
        <p className="text-green-800 text-sm">
          Your study plan has been created successfully! {calendarEvents.length} study sessions have been added to your calendar.
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Study Plan Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {studyPlan.map((subject, index) => (
            <Card key={index} className={getCardColorByConfidence(subject.confidence)}>
              <CardContent className="p-4">
                <h4 className="font-medium">{subject.subject}</h4>
                <div className="text-sm mt-1 flex items-center justify-between">
                  <span>{subject.sessionsPerWeek} sessions/week</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button 
          onClick={onComplete} 
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full" />
              Completing...
            </>
          ) : (
            <>
              Complete Setup <CheckCircle className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Helper function to get appropriate card color based on confidence
function getCardColorByConfidence(confidence: string): string {
  switch (confidence) {
    case 'low':
      return 'bg-red-50 border-red-200';
    case 'medium':
      return 'bg-blue-50 border-blue-200';
    case 'high':
      return 'bg-green-50 border-green-200';
    default:
      return '';
  }
}
