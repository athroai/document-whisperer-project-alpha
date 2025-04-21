
import React from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Sparkles } from 'lucide-react';

export const WelcomeStep: React.FC = () => {
  const { updateOnboardingStep } = useOnboarding();
  
  return (
    <div className="space-y-6 text-center py-4">
      <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-purple-600" />
      </div>
      
      <h2 className="text-2xl font-bold">Welcome to Your Study Assistant</h2>
      
      <div className="space-y-4 max-w-lg mx-auto">
        <p className="text-gray-600">
          We're going to help you create a personalized study calendar based on:
        </p>
        
        <ul className="text-left space-y-2">
          <li className="flex items-center">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 text-sm">1</span>
            <span>The subjects you're studying</span>
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 text-sm">2</span>
            <span>Your confidence level in each subject</span>
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 text-sm">3</span>
            <span>When you're available to study</span>
          </li>
          <li className="flex items-center">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 text-sm">4</span>
            <span>How you prefer to learn</span>
          </li>
        </ul>
        
        <p className="text-gray-600 pt-2">
          This will only take a few minutes and will help us create the perfect study schedule for you.
        </p>
      </div>
      
      <Button 
        onClick={() => updateOnboardingStep('subjects')} 
        className="mt-6 bg-purple-600 hover:bg-purple-700"
      >
        Let's Get Started
      </Button>
    </div>
  );
};
