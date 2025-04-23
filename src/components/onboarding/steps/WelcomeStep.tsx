
import React from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const WelcomeStep: React.FC = () => {
  const { updateOnboardingStep } = useOnboarding();
  const { state } = useAuth();
  
  const handleStart = () => {
    updateOnboardingStep('subjects');
  };
  
  return (
    <div className="space-y-6 text-center">
      <Sparkles className="h-16 w-16 mx-auto text-primary" />
      
      <div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Athro AI</h2>
        <p className="text-gray-600 mb-4">
          {state.profile?.name ? `Hi ${state.profile.name}! ` : ''}
          We're going to create your personalized study plan.
        </p>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg max-w-lg mx-auto">
        <h3 className="font-medium mb-2">In the next few steps, you'll:</h3>
        <ul className="text-sm text-left space-y-2">
          <li className="flex items-start">
            <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">1</span>
            <span>Select the subjects you're studying</span>
          </li>
          <li className="flex items-start">
            <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">2</span>
            <span>Set your study schedule and availability</span>
          </li>
          <li className="flex items-start">
            <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">3</span>
            <span>Tell us about your learning preferences</span>
          </li>
          <li className="flex items-start">
            <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">4</span>
            <span>Get your AI-generated study plan</span>
          </li>
        </ul>
      </div>
      
      <div className="pt-4">
        <Button onClick={handleStart} className="px-6">
          Let's Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
