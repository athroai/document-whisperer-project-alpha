
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DaySelector } from './DaySelector';
import { SlotOptionSelector } from './SlotOptionSelector';
import { TimeSlotPreview } from './TimeSlotPreview';
import { SlotOption } from '@/types/study';
import { Calendar, Clock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const SLOT_OPTIONS: SlotOption[] = [
  {
    name: 'Short Sessions',
    count: 3,
    duration: 25,
    color: 'bg-blue-500',
    icon: Calendar
  },
  {
    name: 'Medium Sessions',
    count: 2,
    duration: 45,
    color: 'bg-purple-500',
    icon: Calendar
  },
  {
    name: 'Long Session',
    count: 1,
    duration: 90,
    color: 'bg-green-500',
    icon: Calendar
  }
];

export const SlotSelection: React.FC = () => {
  const { updateOnboardingStep, updateStudySlots } = useOnboarding();
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [selectedOption, setSelectedOption] = useState<number | null>(0); // Default to first option
  const [preferredStartHour, setPreferredStartHour] = useState<number>(16); // Default to 4 PM
  
  const toggleDaySelection = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(day => day !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex]);
    }
  };
  
  const handleContinue = () => {
    if (selectedDays.length === 0 || selectedOption === null) {
      return;
    }
    
    const selectedSlotOption = SLOT_OPTIONS[selectedOption];
    
    selectedDays.forEach(dayOfWeek => {
      updateStudySlots({
        dayOfWeek,
        slotCount: selectedSlotOption.count,
        slotDurationMinutes: selectedSlotOption.duration,
        preferredStartHour
      });
    });
    
    // Skip diagnostic quiz and go directly to plan generation
    updateOnboardingStep('generatePlan');
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
        <h3 className="text-lg font-medium">Choose Your Study Session Length</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select a study pattern that works best for you
        </p>
        
        <SlotOptionSelector 
          slotOptions={SLOT_OPTIONS} 
          selectedOption={selectedOption} 
          onSelectOption={setSelectedOption} 
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Preferred Start Time
        </h3>
        
        <div className="space-y-6">
          <Slider
            value={[preferredStartHour]}
            min={8}
            max={20}
            step={1}
            onValueChange={(values) => setPreferredStartHour(values[0])}
          />
          
          <div className="flex justify-between text-sm text-gray-500">
            <span>8 AM</span>
            <span>2 PM</span>
            <span>8 PM</span>
          </div>
          
          <Label className="block text-center font-medium">
            Starting at {getTimeLabel(preferredStartHour)}
          </Label>
        </div>
        
        {selectedOption !== null && (
          <TimeSlotPreview
            selectedOption={SLOT_OPTIONS[selectedOption]}
            preferredStartHour={preferredStartHour}
          />
        )}
      </div>
      
      <div className="pt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => updateOnboardingStep('subjects')}
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={selectedDays.length === 0 || selectedOption === null}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Continue to Generate Study Plan
        </Button>
      </div>
    </div>
  );
};
