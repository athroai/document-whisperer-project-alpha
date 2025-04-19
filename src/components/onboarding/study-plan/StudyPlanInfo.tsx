
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface StudyPlanInfoProps {
  onGenerate: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

export const StudyPlanInfo: React.FC<StudyPlanInfoProps> = ({ onGenerate, isGenerating, disabled }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Generate Your Personalized Study Plan</h3>
        <p className="text-gray-600 mb-6">
          Based on your subject selections and confidence levels, we'll create a 
          personalized study schedule in your calendar. The plan will:
        </p>
        
        <ul className="space-y-3 mb-6">
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span><strong>Adapt to your confidence levels</strong> - allocating more sessions for subjects you're less confident in</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Schedule study sessions in your selected time slots</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Create a balanced weekly schedule across all your subjects</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>Add sessions directly to your calendar for easy access</span>
          </li>
        </ul>

        {disabled && !isGenerating && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              You need to select at least one subject before generating a study plan
            </p>
          </div>
        )}
        
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating || disabled}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? 'Generating Plan...' : 'Generate My Study Plan'}
        </Button>
      </div>
    </div>
  );
};
