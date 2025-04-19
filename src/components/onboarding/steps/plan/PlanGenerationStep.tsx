
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
  if (isGenerating || progress < 100) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 py-8 text-center"
      >
        <Sparkles className="h-12 w-12 text-purple-500 mx-auto" />
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Creating Your Study Plan</h2>
          <p className="text-muted-foreground mt-2">
            We're using AI to craft a personalized study schedule based on your preferences
          </p>
        </div>
        
        <div className="w-full max-w-md mx-auto">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {progress}% complete
          </p>
        </div>
        
        <div className="animate-pulse text-purple-500">
          <p className="text-sm">Analyzing your learning profile...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Generate Your Personalized Study Plan</h3>
        <p className="text-gray-600 mb-6">
          Based on your subject selections and learning style, we'll create a 
          personalized study schedule in your calendar.
        </p>
        
        <ul className="space-y-3 mb-6">
          {[
            'Schedule more sessions for subjects where you need more practice',
            'Fit study sessions into your selected time slots',
            'Create a balanced weekly schedule across all your subjects',
            'Adjust session content based on your confidence levels'
          ].map((text, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={onGenerate} 
          disabled={disabled}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Generate My Study Plan
        </Button>
      </div>
    </div>
  );
};
