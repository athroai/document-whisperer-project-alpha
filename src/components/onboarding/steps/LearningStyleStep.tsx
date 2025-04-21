
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowLeft, ArrowRight, Book, PenTool, Headphones, Eye, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const LearningStyles = [
  {
    id: 'visual',
    title: 'Visual Learner',
    description: 'You prefer diagrams, charts, and seeing information',
    icon: Eye
  },
  {
    id: 'auditory',
    title: 'Auditory Learner',
    description: 'You prefer listening to explanations and discussions',
    icon: Headphones
  },
  {
    id: 'reading',
    title: 'Reading/Writing',
    description: 'You prefer reading texts and writing notes',
    icon: Book
  },
  {
    id: 'kinesthetic',
    title: 'Hands-on Learner',
    description: 'You prefer doing practical exercises and examples',
    icon: PenTool
  },
  {
    id: 'social',
    title: 'Social Learner',
    description: 'You prefer studying in groups and discussing topics',
    icon: Users
  }
];

export const LearningStyleStep: React.FC = () => {
  const { updateLearningPreferences, updateOnboardingStep } = useOnboarding();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  
  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(styleId)) {
        return prev.filter(id => id !== styleId);
      } else {
        return [...prev, styleId];
      }
    });
  };
  
  const handleBack = () => {
    updateOnboardingStep('availability');
  };
  
  const handleContinue = () => {
    // Save selected learning styles
    updateLearningPreferences({ learningStyles: selectedStyles });
    
    // Move to next step
    updateOnboardingStep('generatePlan');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">What's Your Learning Style?</h2>
        <p className="text-gray-600 text-sm mb-4">
          Select the learning styles that work best for you. This helps us tailor your study materials.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LearningStyles.map((style) => {
          const isSelected = selectedStyles.includes(style.id);
          return (
            <Card 
              key={style.id} 
              className={cn(
                "cursor-pointer transition-all",
                isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              )}
              onClick={() => toggleStyle(style.id)}
            >
              <CardContent className="p-4 flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <style.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">{style.title}</h3>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Button 
          onClick={handleContinue}
          disabled={selectedStyles.length === 0}
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
