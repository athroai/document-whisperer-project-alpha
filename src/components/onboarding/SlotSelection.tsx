
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { SubjectSelector } from '../core/SubjectSelector';
import { ConfidenceLabel } from '@/types/confidence';

export const SlotSelection: React.FC = () => {
  const { updateOnboardingStep, updateStudySlots } = useOnboarding();
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedOption, setSelectedOption] = useState<number | null>(0);
  const [preferredStartHour, setPreferredStartHour] = useState<number>(15); // Default to 3pm
  const [selectedSubjects, setSelectedSubjects] = useState<{subject: string, confidence: ConfidenceLabel}[]>([]);

  // Day selection options
  const days = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 7, label: 'Sun' },
  ];

  const sessionOptions = [
    {
      name: 'Short Sessions',
      description: '3 x 25 min sessions',
      color: 'bg-blue-100 border-blue-300',
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      count: 3,
      duration: 25
    },
    {
      name: 'Medium Sessions',
      description: '2 x 45 min sessions',
      color: 'bg-purple-100 border-purple-300',
      icon: <Calendar className="h-5 w-5 text-purple-500" />,
      count: 2,
      duration: 45
    },
    {
      name: 'Long Session',
      description: '1 x 90 min deep focus',
      color: 'bg-green-100 border-green-300',
      icon: <Calendar className="h-5 w-5 text-green-500" />,
      count: 1,
      duration: 90
    }
  ];

  const toggleDaySelection = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex].sort((a, b) => {
            if (a === 0) return 1;
            if (b === 0) return -1;
            return a - b;
          })
    );
  };

  const getTimeLabel = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const handleContinue = async () => {
    // Validate inputs
    if (selectedDays.length === 0) {
      toast({
        title: "No Days Selected",
        description: "Please select at least one day for studying",
        variant: "destructive"
      });
      return;
    }

    if (selectedSubjects.length === 0) {
      toast({
        title: "No Subjects Selected",
        description: "Please select at least one subject",
        variant: "destructive"
      });
      return;
    }

    // Get selected session option details
    const sessionOption = sessionOptions[selectedOption || 0];

    try {
      // Create study slots for each selected day and subject
      for (const dayOfWeek of selectedDays) {
        for (const subject of selectedSubjects) {
          await updateStudySlots({
            dayOfWeek,
            slotCount: sessionOption.count,
            slotDurationMinutes: sessionOption.duration,
            preferredStartHour, // Use the selected start hour
            subject: subject.subject // Pass the subject
          });
        }
      }
      
      // Proceed to next step
      updateOnboardingStep('style');
    } catch (error) {
      console.error("Error saving study schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save your study schedule. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
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
      
      <div className="space-y-4">
        <Label>Choose Your Study Session Length</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sessionOptions.map((option, index) => (
            <div
              key={option.name}
              className={`cursor-pointer rounded-lg border p-4 ${
                selectedOption === index
                  ? `${option.color} border-2`
                  : 'border-muted hover:border-gray-300'
              }`}
              onClick={() => setSelectedOption(index)}
            >
              <div className="flex items-center mb-2">
                {option.icon}
                <h3 className="font-medium ml-2">{option.name}</h3>
              </div>
              <p className="text-xs text-gray-500">{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          <Label>Preferred Start Time: {getTimeLabel(preferredStartHour)}</Label>
        </div>
        
        <Slider
          value={[preferredStartHour]}
          min={8} // 8 AM
          max={20} // 8 PM
          step={1}
          onValueChange={(values) => setPreferredStartHour(values[0])}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>8 AM</span>
          <span>2 PM</span>
          <span>8 PM</span>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Select Your GCSE Subjects</Label>
        <SubjectSelector
          subjects={selectedSubjects}
          updateSubjects={setSelectedSubjects}
        />
      </div>

      <Button 
        onClick={handleContinue} 
        disabled={selectedDays.length === 0 || selectedSubjects.length === 0}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        Continue
      </Button>
    </div>
  );
};
