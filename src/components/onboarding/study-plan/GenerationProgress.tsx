
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader } from 'lucide-react';

interface GenerationProgressProps {
  progress: number;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ progress }) => {
  return (
    <div className="space-y-4 py-6">
      <div className="flex items-center gap-2 justify-center">
        <Loader className="h-5 w-5 animate-spin" />
        <span className="font-medium">Generating Your Study Plan</span>
      </div>
      
      <Progress value={progress} className="w-full" />
      
      <p className="text-center text-sm text-muted-foreground">
        {progress < 30 && "Analyzing your subjects..."}
        {progress >= 30 && progress < 60 && "Creating balanced study sessions..."}
        {progress >= 60 && progress < 90 && "Optimizing your schedule..."}
        {progress >= 90 && "Finalizing your personalized study plan..."}
      </p>
    </div>
  );
};
