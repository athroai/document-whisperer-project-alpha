
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ConfidenceLabel } from '@/types/confidence';

interface StudyPlanCardProps {
  subject: string;
  confidence: ConfidenceLabel;
  sessionsPerWeek: number;
}

export const StudyPlanCard: React.FC<StudyPlanCardProps> = ({ 
  subject, 
  confidence, 
  sessionsPerWeek 
}) => {
  const getConfidenceColor = (confidence: ConfidenceLabel): string => {
    switch (confidence) {
      case 'Very Low':
        return 'bg-red-100 text-red-800';
      case 'Low':
        return 'bg-orange-100 text-orange-800';
      case 'Neutral':
        return 'bg-blue-100 text-blue-800';
      case 'High':
        return 'bg-green-100 text-green-800';
      case 'Very High':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-b p-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{subject}</h4>
            <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(confidence)}`}>
              {confidence}
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sessions per week:</span>
            <span className="font-medium">{sessionsPerWeek}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
