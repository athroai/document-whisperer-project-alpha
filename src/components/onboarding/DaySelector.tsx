
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface DaySelectorProps {
  selectedDays: number[];
  toggleDaySelection: (day: number) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ selectedDays, toggleDaySelection }) => {
  const days = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' }, // Using 0 for Sunday to match JavaScript's Date.getDay()
  ];

  return (
    <div className="space-y-3">
      <Label>Which days would you like to study?</Label>
      <div className="flex gap-2 flex-wrap">
        {days.map((day) => (
          <Button
            key={day.value}
            type="button"
            variant={selectedDays.includes(day.value) ? "default" : "outline"}
            className="w-12"
            onClick={() => toggleDaySelection(day.value)}
          >
            {day.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
