
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

// Day selection component
const DaySelector: React.FC<{
  selectedDays: number[];
  toggleDaySelection: (day: number) => void;
}> = ({ selectedDays, toggleDaySelection }) => {
  const days = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 7, label: 'Sun' },
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

// Study options for session type/duration
const SlotOptionSelector: React.FC<{
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
}> = ({ selectedOption, onSelectOption }) => {
  const options = [
    {
      name: 'Short Sessions',
      description: '3 x 25 min sessions',
      color: 'bg-blue-100 border-blue-300',
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
    },
    {
      name: 'Medium Sessions',
      description: '2 x 45 min sessions',
      color: 'bg-purple-100 border-purple-300',
      icon: <Calendar className="h-5 w-5 text-purple-500" />,
    },
    {
      name: 'Long Session',
      description: '1 x 90 min deep focus',
      color: 'bg-green-100 border-green-300',
      icon: <Calendar className="h-5 w-5 text-green-500" />,
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {options.map((option, index) => (
        <div
          key={option.name}
          className={`cursor-pointer rounded-lg border p-4 ${
            selectedOption === index
              ? `${option.color} border-2`
              : 'border-muted hover:border-gray-300'
          }`}
          onClick={() => onSelectOption(index)}
        >
          <div className="flex items-center mb-2">
            {option.icon}
            <h3 className="font-medium ml-2">{option.name}</h3>
          </div>
          <p className="text-xs text-gray-500">{option.description}</p>
        </div>
      ))}
    </div>
  );
};

export const SlotSelection: React.FC = () => {
  const { updateOnboardingStep } = useOnboarding();
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedOption, setSelectedOption] = useState<number | null>(0);
  const [preferredStartHour, setPreferredStartHour] = useState<number>(15); // Default to 3pm

  const toggleDaySelection = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(day => day !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex]);
    }
  };
  
  const getTimeLabel = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div className="space-y-6">
      <DaySelector 
        selectedDays={selectedDays} 
        toggleDaySelection={toggleDaySelection} 
      />
      
      <div className="space-y-4">
        <Label>Choose Your Study Session Length</Label>
        <SlotOptionSelector 
          selectedOption={selectedOption} 
          onSelectOption={setSelectedOption} 
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          <Label>Preferred Start Time: {getTimeLabel(preferredStartHour)}</Label>
        </div>
        
        <div className="px-2">
          <Slider
            value={[preferredStartHour]}
            min={9} // 9 AM
            max={20} // 8 PM
            step={1}
            onValueChange={(values) => setPreferredStartHour(values[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>9 AM</span>
            <span>2 PM</span>
            <span>8 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
