
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';

export const ScheduleChoiceStep: React.FC = () => {
  const navigate = useNavigate();
  const { updateOnboardingStep } = useOnboarding();

  const handleChoice = (choice: 'manual' | 'guided') => {
    if (choice === 'manual') {
      // Navigate to calendar for manual setup
      navigate('/calendar?fromSetup=true');
    } else {
      // Continue to availability settings
      updateOnboardingStep('availability');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Choose Your Study Schedule Setup</h2>
        <p className="text-gray-600 text-sm mb-6">
          Would you like to plan your own schedule or let us help you create one?
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleChoice('manual')}>
          <div className="flex flex-col items-center text-center space-y-4">
            <Calendar className="h-12 w-12 text-purple-600" />
            <h3 className="text-lg font-semibold">Plan My Own Schedule</h3>
            <p className="text-sm text-gray-600">
              I want to set up my own study times in the calendar directly
            </p>
            <Button variant="outline" className="mt-4">
              Go to Calendar
            </Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleChoice('guided')}>
          <div className="flex flex-col items-center text-center space-y-4">
            <Clock className="h-12 w-12 text-blue-600" />
            <h3 className="text-lg font-semibold">Get a Generated Schedule</h3>
            <p className="text-sm text-gray-600">
              Help me create an optimized study schedule based on my availability
            </p>
            <Button className="mt-4">
              Create My Schedule
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
