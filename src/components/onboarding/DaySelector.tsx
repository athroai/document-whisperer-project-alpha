
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface DaySelectorProps {
  selectedDays: number[];
  toggleDaySelection: (dayIndex: number) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DaySelector: React.FC<DaySelectorProps> = ({ selectedDays, toggleDaySelection }) => {
  const isDaySelected = (dayIndex: number) => {
    return selectedDays.includes(dayIndex);
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Select Your Study Days</h3>
      <p className="text-sm text-gray-500 mb-4">
        Choose which days of the week you plan to study
      </p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {DAYS_OF_WEEK.map((day, index) => {
          const dayIndex = index + 1;
          const isSelected = isDaySelected(dayIndex);
          
          return (
            <Button 
              key={day}
              type="button"
              variant={isSelected ? "default" : "outline"}
              className={isSelected ? "bg-purple-600 hover:bg-purple-700" : ""}
              onClick={() => toggleDaySelection(dayIndex)}
            >
              {isSelected && <Check className="mr-1 h-4 w-4" />}
              {day.substring(0, 3)}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
