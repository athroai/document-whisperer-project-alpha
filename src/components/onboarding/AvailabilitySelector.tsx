
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const AvailabilitySelector: React.FC = () => {
  const { updateAvailability } = useOnboarding();
  const [availabilitySlots, setAvailabilitySlots] = useState(
    DAYS.map(day => ({ dayOfWeek: DAYS.indexOf(day), startTime: '', endTime: '' }))
  );

  const handleTimeChange = (dayIndex: number, type: 'startTime' | 'endTime', value: string) => {
    const updatedSlots = [...availabilitySlots];
    updatedSlots[dayIndex] = { 
      ...updatedSlots[dayIndex], 
      [type]: value 
    };
    setAvailabilitySlots(updatedSlots);
  };

  const handleSave = () => {
    const filledSlots = availabilitySlots.filter(slot => slot.startTime && slot.endTime);
    updateAvailability(filledSlots);
  };

  return (
    <div className="space-y-4">
      <p>Select your study availability for each day:</p>
      {availabilitySlots.map((slot, index) => (
        <div key={DAYS[index]} className="flex items-center space-x-4">
          <Label className="w-32">{DAYS[index]}</Label>
          <Input 
            type="time" 
            value={slot.startTime}
            onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
            className="w-32" 
          />
          <span>to</span>
          <Input 
            type="time" 
            value={slot.endTime}
            onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
            className="w-32" 
          />
        </div>
      ))}
      <Button onClick={handleSave}>Save Availability</Button>
    </div>
  );
};
