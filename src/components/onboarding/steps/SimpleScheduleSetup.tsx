
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { TimeSelector } from '@/components/calendar/TimeSelector';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export const SimpleScheduleSetup: React.FC = () => {
  const { updateOnboardingStep } = useOnboarding();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('15:00');
  const [duration, setDuration] = useState(45);

  const handleBack = () => updateOnboardingStep('subjects');
  
  const handleContinue = () => {
    updateOnboardingStep('createEvents');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Set Your Study Schedule</h2>
        <p className="text-muted-foreground mt-2">
          Choose when you'd like to start your study sessions
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-purple-600" />
          <Badge variant="secondary">Quick Setup</Badge>
        </div>

        <TimeSelector
          date={date}
          startTime={startTime}
          duration={duration}
          onDateChange={setDate}
          onStartTimeChange={setStartTime}
          onDurationChange={setDuration}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
