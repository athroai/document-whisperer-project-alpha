
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PlanGenerationStepProps {
  isGenerating: boolean;
  progress: number;
  onGenerate: () => void;
  disabled: boolean;
}

export const PlanGenerationStep: React.FC<PlanGenerationStepProps> = ({
  isGenerating,
  progress,
  onGenerate,
  disabled
}) => {
  const getStepLabel = () => {
    if (progress < 20) return "Preparing your study plan...";
    if (progress < 40) return "Analyzing your subject preferences...";
    if (progress < 60) return "Creating optimal study schedule...";
    if (progress < 80) return "Generating calendar events...";
    return "Finalizing your study plan...";
  };

  return (
    <div>
      {isGenerating ? (
        <div className="space-y-6">
          <div className="flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          
          <div className="space-y-2">
            <p className="text-center font-medium">{getStepLabel()}</p>
            <Progress value={progress} className="w-full h-2" />
            <p className="text-center text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          
          <div>
            <h3 className="text-xl font-medium mb-2">Ready to Create Your Study Plan</h3>
            <p className="text-muted-foreground">
              Based on your subject selections and preferences, we'll generate a personalized study schedule.
            </p>
          </div>
          
          <Button 
            onClick={onGenerate} 
            disabled={disabled} 
            className="px-6 py-2"
            size="lg"
          >
            Generate My Study Plan
          </Button>
        </div>
      )}
    </div>
  );
};
