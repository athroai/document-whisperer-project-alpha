
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DaySelector } from './DaySelector';
import { SlotOptionSelector } from './SlotOptionSelector';
import { TimeSlotPreview } from './TimeSlotPreview';
import { SlotOption } from '@/types/study';
import { Calendar, Clock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

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
  const { updateOnboardingStep, updateStudySlots, studySlots, setStudySlots } = useOnboarding();
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedOption, setSelectedOption] = useState<number | null>(0);
  const [preferredStartHour, setPreferredStartHour] = useState<number>(15); // Default to 3pm now
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleDaySelection = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(day => day !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex]);
    }
  };

  // Clear existing slots when component mounts to avoid duplicates
  useEffect(() => {
    setStudySlots([]);
  }, [setStudySlots]);

  const handleContinue = async () => {
    if (selectedDays.length === 0 || selectedOption === null) {
      toast.error("Please select at least one day and a study session type");
      return;
    }
    
    const selectedSlotOption = SLOT_OPTIONS[selectedOption];
    setIsSubmitting(true);
    
    try {
      // Clear any existing slots first
      setStudySlots([]);
      
      // Create in-memory slots immediately for each selected day
      const newSlots = selectedDays.map(dayOfWeek => ({
        id: `temp-${Date.now()}-${dayOfWeek}`,
        user_id: 'temp-user-id', // Will be replaced when user is available
        day_of_week: dayOfWeek,
        slot_count: selectedSlotOption.count,
        slot_duration_minutes: selectedSlotOption.duration,
        preferred_start_hour: preferredStartHour,
        created_at: new Date().toISOString()
      }));
      
      // Update context with all new slots at once
      setStudySlots(newSlots);
      
      // Store each slot separately, but don't block UI if this fails
      selectedDays.forEach(dayOfWeek => {
        updateStudySlots({
          dayOfWeek,
          slotCount: selectedSlotOption.count,
          slotDurationMinutes: selectedSlotOption.duration,
          preferredStartHour
        });
      });
      
      // Proceed to next step regardless of database save success
      updateOnboardingStep('generatePlan');
    } catch (error) {
      console.error('Error saving study slots:', error);
      // Continue anyway since we've stored slots in context
      updateOnboardingStep('generatePlan');
    } finally {
      setIsSubmitting(false);
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
            min={15} // 3 PM
            max={23} // 11 PM
            step={1}
            onValueChange={(values) => setPreferredStartHour(values[0])}
          />
          
          <div className="flex justify-between text-sm text-gray-500">
            <span>3 PM</span>
            <span>7 PM</span>
            <span>11 PM</span>
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
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={selectedDays.length === 0 || selectedOption === null || isSubmitting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? "Saving..." : "Continue to Generate Study Plan"}
        </Button>
      </div>
    </div>
  );
};
