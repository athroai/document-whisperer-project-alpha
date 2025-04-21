
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Sparkles } from 'lucide-react';

interface StudyPlanInfoProps {
  onGenerate: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

export const StudyPlanInfo: React.FC<StudyPlanInfoProps> = ({
  onGenerate,
  isGenerating,
  disabled
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center mb-3">
            <div className="bg-primary/20 p-2 rounded-full mr-3">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">AI-Optimized</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Custom study plan based on your subject confidence levels and learning preferences.
          </p>
        </div>
        
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center mb-3">
            <div className="bg-primary/20 p-2 rounded-full mr-3">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">Calendar Integration</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Study sessions automatically added to your calendar with smart scheduling.
          </p>
        </div>
        
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center mb-3">
            <div className="bg-primary/20 p-2 rounded-full mr-3">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">Optimal Timing</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Sessions scheduled at your preferred times to maximize focus and retention.
          </p>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button
          onClick={onGenerate}
          disabled={disabled || isGenerating}
          className="px-8 py-2"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></div>
              Generating...
            </>
          ) : (
            'Generate My Study Plan'
          )}
        </Button>
      </div>
      
      {disabled && !isGenerating && (
        <p className="text-center text-sm text-muted-foreground">
          Please complete all previous steps before generating your plan.
        </p>
      )}
    </div>
  );
};
