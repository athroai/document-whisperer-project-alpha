
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DaySelector } from '@/components/onboarding/DaySelector';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const SimpleScheduleSetup: React.FC = () => {
  const { updateOnboardingStep, updateStudySlots } = useOnboarding();
  const { toast } = useToast();
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [sessionDuration, setSessionDuration] = useState<string>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDayToggle = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex].sort()
    );
  };

  const getDurationMinutes = (duration: string) => {
    switch (duration) {
      case 'short': return 25;
      case 'medium': return 45;
      case 'long': return 90;
      default: return 45;
    }
  };

  const handleBack = () => {
    updateOnboardingStep('subjects');
  };

  const handleContinue = async () => {
    if (selectedDays.length === 0) {
      toast({
        title: "No Study Days Selected",
        description: "Please select at least one day for studying",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save study preferences
      const durationMinutes = getDurationMinutes(sessionDuration);
      
      // Create study slots for each selected day
      for (const dayOfWeek of selectedDays) {
        await updateStudySlots({
          dayOfWeek,
          slotCount: 1,
          slotDurationMinutes: durationMinutes,
          preferredStartHour: 16 // 4 PM default
        });
      }
      
      // Proceed to next step
      await updateOnboardingStep('createEvents');
    } catch (error) {
      console.error("Error saving study schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save your study schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Set Your Study Schedule</h2>
        <p className="text-muted-foreground mt-2">Choose when you'd like to study</p>
      </div>
      
      <div className="space-y-4">
        <Label className="text-base font-medium">Which days will you study?</Label>
        <DaySelector 
          selectedDays={selectedDays} 
          toggleDaySelection={handleDayToggle} 
        />
      </div>
      
      <div className="space-y-4">
        <Label className="text-base font-medium">How long should each study session be?</Label>
        <RadioGroup 
          value={sessionDuration} 
          onValueChange={setSessionDuration}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="flex items-center space-x-2 border rounded-md p-4">
            <RadioGroupItem value="short" id="short" />
            <Label htmlFor="short" className="cursor-pointer flex-1">
              <div className="font-medium">Short</div>
              <div className="text-sm text-gray-500">25 minutes</div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-4">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium" className="cursor-pointer flex-1">
              <div className="font-medium">Medium</div>
              <div className="text-sm text-gray-500">45 minutes</div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-4">
            <RadioGroupItem value="long" id="long" />
            <Label htmlFor="long" className="cursor-pointer flex-1">
              <div className="font-medium">Long</div>
              <div className="text-sm text-gray-500">90 minutes</div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleContinue} 
          disabled={selectedDays.length === 0 || isSubmitting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
