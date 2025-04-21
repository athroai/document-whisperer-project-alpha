
import React from 'react';
import { Button } from '@/components/ui/button';

interface DaySelectorProps {
  selectedDays: number[];
  toggleDaySelection: (dayIndex: number) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  toggleDaySelection
}) => {
  const days = [
    { index: 0, name: 'Sun', fullName: 'Sunday' },
    { index: 1, name: 'Mon', fullName: 'Monday' },
    { index: 2, name: 'Tue', fullName: 'Tuesday' },
    { index: 3, name: 'Wed', fullName: 'Wednesday' },
    { index: 4, name: 'Thu', fullName: 'Thursday' },
    { index: 5, name: 'Fri', fullName: 'Friday' },
    { index: 6, name: 'Sat', fullName: 'Saturday' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Choose Your Study Days</h3>
      <p className="text-sm text-gray-500">
        Select the days when you want to study. We'll create sessions on these days.
      </p>
      
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {days.map((day) => (
          <Button
            key={day.index}
            type="button"
            variant={selectedDays.includes(day.index) ? "default" : "outline"}
            className={selectedDays.includes(day.index) ? "bg-purple-600 hover:bg-purple-700" : ""}
            onClick={() => toggleDaySelection(day.index)}
            title={day.fullName}
          >
            {day.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
