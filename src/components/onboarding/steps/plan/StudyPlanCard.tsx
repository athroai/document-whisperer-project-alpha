
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StudyPlanCardProps {
  subject: string;
  confidence: string;
  sessionsPerWeek: number;
}

export const StudyPlanCard: React.FC<StudyPlanCardProps> = ({ 
  subject, 
  confidence, 
  sessionsPerWeek 
}) => {
  // Get color based on confidence level
  const getConfidenceColor = () => {
    switch(confidence) {
      case 'Very Low':
        return 'bg-red-100 text-red-800';
      case 'Low':
        return 'bg-orange-100 text-orange-800';
      case 'Neutral':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-green-100 text-green-800';
      case 'Very High':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get focus area text based on confidence level
  const getFocusAreaText = () => {
    switch(confidence) {
      case 'Very Low':
        return 'Intensive coverage needed';
      case 'Low':
        return 'Regular practice needed';
      case 'Neutral':
        return 'Balanced approach';
      case 'High':
        return 'Light reinforcement';
      case 'Very High':
        return 'Mastery maintenance';
      default:
        return 'Balanced approach';
    }
  };

  return (
    <Card className="p-4 border">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-gray-500" />
          <h4 className="font-medium">{subject}</h4>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor()}`}>
          {confidence}
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-600">
        <p>
          <span className="font-medium">{sessionsPerWeek}</span>
          <span className="text-gray-500"> sessions per week</span>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {getFocusAreaText()}
        </p>
      </div>
    </Card>
  );
};
