
import React from 'react';
import { CheckCircle, Sparkles, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface PlanGenerationProps {
  isGenerating: boolean;
  progress: number;
  onGenerate: () => void;
  disabled?: boolean;
}

export const PlanGenerationStep: React.FC<PlanGenerationProps> = ({
  isGenerating,
  progress,
  onGenerate,
  disabled
}) => {
  if (isGenerating) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 py-8 text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            {progress < 100 && (
              <span className="text-sm font-medium text-purple-700">{progress}%</span>
            )}
          </div>
          <svg className="w-16 h-16 mx-auto" viewBox="0 0 100 100">
            <circle 
              className="text-gray-200" 
              strokeWidth="8" 
              stroke="currentColor" 
              fill="transparent" 
              r="42" 
              cx="50" 
              cy="50" 
            />
            <circle 
              className="text-purple-600" 
              strokeWidth="8" 
              strokeDasharray={264}
              strokeDashoffset={264 - (progress / 100) * 264}
              strokeLinecap="round" 
              stroke="currentColor" 
              fill="transparent" 
              r="42" 
              cx="50" 
              cy="50" 
            />
          </svg>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Creating Your Study Plan</h2>
          <p className="text-muted-foreground mt-2">
            We're personalizing a study schedule based on your preferences
          </p>
        </div>
        
        <div className="max-w-md mx-auto text-left">
          <div className="space-y-3 mt-6">
            <GenerationStep 
              number={1} 
              text="Analyzing your subject preferences" 
              complete={progress >= 30} 
              active={progress < 30}
            />
            <GenerationStep 
              number={2} 
              text="Optimizing study session distribution" 
              complete={progress >= 50} 
              active={progress >= 30 && progress < 50}
            />
            <GenerationStep 
              number={3} 
              text="Creating calendar appointments" 
              complete={progress >= 70} 
              active={progress >= 50 && progress < 70}
            />
            <GenerationStep 
              number={4} 
              text="Finalizing your personalized plan" 
              complete={progress >= 100} 
              active={progress >= 70 && progress < 100}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <Card className="p-6 border border-gray-200">
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-purple-100 rounded-full p-3">
          <CalendarClock className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-1">Generate Your Study Plan</h3>
          <p className="text-gray-600 text-sm">
            Create a personalized schedule based on your preferences and subject confidence
          </p>
        </div>
      </div>
      
      <ul className="space-y-3 mb-6">
        {[
          'Schedule more sessions for subjects where you need more practice',
          'Fit study sessions into your selected time slots',
          'Create a balanced weekly schedule across all your subjects',
          'Add all sessions to your calendar automatically'
        ].map((text, i) => (
          <li key={i} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{text}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        onClick={onGenerate} 
        disabled={disabled}
        className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Generate My Study Plan
      </Button>
      
      {disabled && !isGenerating && (
        <p className="text-center text-xs text-gray-500 mt-2">
          {!disabled ? "" : 
           "You need to select at least one subject before generating a study plan"}
        </p>
      )}
    </Card>
  );
};

const GenerationStep = ({ 
  number, 
  text, 
  complete, 
  active 
}: { 
  number: number; 
  text: string; 
  complete: boolean; 
  active: boolean; 
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium 
        ${complete ? 'bg-green-100 text-green-700' : 
          active ? 'bg-purple-100 text-purple-700' : 
          'bg-gray-100 text-gray-500'}`}>
        {complete ? '✓' : number}
      </div>
      <span className={`text-sm 
        ${complete ? 'text-green-700' : 
          active ? 'text-purple-700 font-medium' : 
          'text-gray-500'}`}>
        {text}
        {active && <span className="animate-pulse"> ...</span>}
      </span>
    </div>
  );
};
