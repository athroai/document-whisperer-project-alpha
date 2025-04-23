
import React from 'react';
import { StudyScheduleSetup } from '@/components/onboarding/StudyScheduleSetup';

export const AvailabilitySettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Set Your Study Schedule</h2>
        <p className="text-muted-foreground">
          Choose which days you want to study and set up custom study sessions for each day.
        </p>
      </div>
      
      <StudyScheduleSetup />
    </div>
  );
};
