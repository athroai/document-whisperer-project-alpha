
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface GenerationProgressProps {
  progress: number;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ progress }) => {
  const getStepLabel = () => {
    if (progress < 20) return "Preparing your study plan...";
    if (progress < 40) return "Analyzing your subject preferences...";
    if (progress < 60) return "Creating optimal study schedule...";
    if (progress < 80) return "Generating calendar events...";
    return "Finalizing your study plan...";
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-muted/30">
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <h3 className="text-lg font-medium">{getStepLabel()}</h3>
      </div>
      
      <Progress value={progress} className="w-full h-2" />
      
      <p className="text-center text-sm text-muted-foreground">
        {Math.round(progress)}% complete
      </p>
    </div>
  );
};
