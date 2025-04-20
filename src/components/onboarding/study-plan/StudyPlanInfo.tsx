
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

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
      <div>
        <h2 className="text-2xl font-bold">Create Your Study Plan</h2>
        <p className="text-muted-foreground mt-2">
          We'll generate a personalized study schedule based on your subjects and availability
        </p>
      </div>

      <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-medium">Your Study Plan Will Include:</h3>
        
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="bg-purple-100 p-1 rounded-full mr-3 mt-0.5">
              <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Balanced sessions for all your selected subjects</span>
          </li>
          <li className="flex items-start">
            <div className="bg-purple-100 p-1 rounded-full mr-3 mt-0.5">
              <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Time allocated based on your preferred schedule</span>
          </li>
          <li className="flex items-start">
            <div className="bg-purple-100 p-1 rounded-full mr-3 mt-0.5">
              <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Calendar events that sync with your Athro dashboard</span>
          </li>
        </ul>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onGenerate}
          disabled={disabled || isGenerating}
          className="bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate My Study Plan"
          )}
        </Button>
      </div>
      
      {disabled && (
        <p className="text-center text-sm text-muted-foreground">
          Please complete your subject selection to generate a study plan
        </p>
      )}
    </div>
  );
};
