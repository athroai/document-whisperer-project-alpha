
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface GenerationProgressProps {
  progress: number;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ progress }) => {
  return (
    <div className="space-y-4 py-8">
      <h3 className="text-lg font-medium text-center">Creating Your Personalized Study Plan</h3>
      <Progress value={progress} className="w-full" />
      <p className="text-center text-sm text-gray-500">
        Analyzing your quiz results and scheduling optimal study sessions...
      </p>
    </div>
  );
};
