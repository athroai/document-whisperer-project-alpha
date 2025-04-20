
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DaySelectorProps {
  selectedDays: number[];
  toggleDaySelection: (dayIndex: number) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ 
  selectedDays, 
  toggleDaySelection 
}) => {
  const days = [
    { index: 0, label: 'S', name: 'Sunday' },
    { index: 1, label: 'M', name: 'Monday' },
    { index: 2, label: 'T', name: 'Tuesday' },
    { index: 3, label: 'W', name: 'Wednesday' },
    { index: 4, label: 'T', name: 'Thursday' },
    { index: 5, label: 'F', name: 'Friday' },
    { index: 6, label: 'S', name: 'Saturday' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {days.map((day) => (
        <Button
          key={day.index}
          type="button"
          variant="outline"
          className={cn(
            "w-12 h-12 rounded-full",
            selectedDays.includes(day.index) && "bg-purple-100 border-purple-500 text-purple-700"
          )}
          title={day.name}
          onClick={() => toggleDaySelection(day.index)}
        >
          {day.label}
        </Button>
      ))}
    </div>
  );
};
