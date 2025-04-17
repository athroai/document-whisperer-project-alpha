
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
        {DAYS_OF_WEEK.map((day, index) => (
          <Button 
            key={day}
            variant={isDaySelected(index + 1) ? "default" : "outline"}
            className={isDaySelected(index + 1) ? "bg-purple-600 hover:bg-purple-700" : ""}
            onClick={() => toggleDaySelection(index + 1)}
          >
            {isDaySelected(index + 1) && <Check className="mr-1 h-4 w-4" />}
            {day.substring(0, 3)}
          </Button>
        ))}
      </div>
    </div>
  );
};
