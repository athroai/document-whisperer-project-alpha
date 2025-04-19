
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface GenerationProgressProps {
  progress: number;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ progress }) => {
  let statusMessage = "Analyzing your preferences and scheduling optimal study sessions...";
  
  if (progress < 30) {
    statusMessage = "Analyzing your subject confidence levels...";
  } else if (progress < 60) {
    statusMessage = "Creating personalized study sessions...";
  } else if (progress < 90) {
    statusMessage = "Adding study sessions to your calendar...";
  } else {
    statusMessage = "Finalizing your personalized study plan...";
  }
  
  return (
    <div className="space-y-4 py-8">
      <h3 className="text-lg font-medium text-center">Creating Your Personalized Study Plan</h3>
      <Progress value={progress} className="w-full" />
      <p className="text-center text-sm text-gray-500">
        {statusMessage}
      </p>
      <p className="text-center text-xs text-gray-400">
        {progress < 100 ? 
          "This may take a moment as we create calendar events for each session." :
          "Study plan created successfully!"}
      </p>
    </div>
  );
};
