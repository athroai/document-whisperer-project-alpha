
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';

const LEARNING_STYLES = [
  {
    id: 'visual',
    name: 'Visual',
    description: 'Learn best through images, diagrams, and visual information',
    examples: 'Charts, maps, diagrams, highlighting'
  },
  {
    id: 'auditory',
    name: 'Auditory',
    description: 'Learn best through listening and speaking',
    examples: 'Lectures, discussions, talking through concepts'
  },
  {
    id: 'reading',
    name: 'Reading/Writing',
    description: 'Learn best through text-based information',
    examples: 'Reading textbooks, taking notes, writing summaries'
  },
  {
    id: 'kinesthetic',
    name: 'Kinesthetic',
    description: 'Learn best through hands-on experience',
    examples: 'Experiments, practice exercises, role-playing'
  }
];

export const LearningStyleStep: React.FC = () => {
  const { updateOnboardingStep, updateLearningPreferences } = useOnboarding();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  
  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };
  
  const handleContinue = () => {
    updateLearningPreferences({ learningStyles: selectedStyles });
    updateOnboardingStep('calendar-preview');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Your Learning Style</h2>
        <p className="text-gray-600 text-sm mb-4">
          How do you prefer to learn? Select all that apply. This helps us recommend the best study approaches for each subject.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LEARNING_STYLES.map(style => {
          const isSelected = selectedStyles.includes(style.id);
          
          return (
            <Card 
              key={style.id}
              className={`p-4 cursor-pointer transition-colors ${
                isSelected ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => toggleStyle(style.id)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{style.name}</h3>
                {isSelected && (
                  <span className="bg-purple-500 text-white p-1 rounded-full">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">{style.description}</p>
              <p className="text-xs text-gray-500 mt-1">Examples: {style.examples}</p>
            </Card>
          );
        })}
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => updateOnboardingStep('availability')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={handleContinue}
          className="bg-purple-600 hover:bg-purple-700"
          disabled={selectedStyles.length === 0}
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
