
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from '@/components/ui/label';

interface DaySelectorProps {
  selectedDays: number[];
  toggleDaySelection: (day: number) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ selectedDays, toggleDaySelection }) => {
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
      <div>
        <Label className="text-base font-medium">Which days will you study?</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select all days you'd like to include in your study schedule. You can select weekdays, weekends, or any combination.
        </p>
      </div>
      
      <div className="grid grid-cols-7 gap-2 sm:gap-4">
        {days.map((day) => (
          <button
            key={day.index}
            className={`
              flex flex-col items-center justify-center py-3 px-1 rounded-lg
              border transition-all
              ${selectedDays.includes(day.index) 
                ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                : 'bg-background border-muted hover:bg-muted/50'}
              ${day.index === 0 || day.index === 6 
                ? selectedDays.includes(day.index) 
                  ? 'bg-purple-700 text-white' 
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100' 
                : ''}
            `}
            onClick={() => toggleDaySelection(day.index)}
            type="button"
          >
            <span className="font-medium">{day.name}</span>
            <span className="text-xs mt-1">
              {selectedDays.includes(day.index) ? '✓' : ''}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 text-sm">
        <p className={`${selectedDays.length === 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
          {selectedDays.length === 0 
            ? 'Please select at least one day'
            : `You've selected ${selectedDays.length} day${selectedDays.length === 1 ? '' : 's'}`}
        </p>
      </div>
    </div>
  );
};
