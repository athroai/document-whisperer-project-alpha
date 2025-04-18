
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export const DiagnosticQuizBypass: React.FC = () => {
  const { updateOnboardingStep } = useOnboarding();
  
  const handleContinue = () => {
    updateOnboardingStep('generatePlan');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Skip Assessment</CardTitle>
          <CardDescription>
            You can proceed without taking the diagnostic quiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The assessment quiz helps AthroAI tailor the learning experience to your needs.
            However, you can always skip this step and take the quiz later.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleContinue} 
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Continue to Study Plan <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
