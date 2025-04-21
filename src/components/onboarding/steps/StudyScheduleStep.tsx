import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DaySelector } from '../DaySelector';
import { DayTimePreferences } from '../DayTimePreferences';
import { useStudySchedule } from '@/hooks/useStudySchedule';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useOnboarding } from '@/contexts/OnboardingContext';

export const StudyScheduleStep: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateOnboardingStep } = useOnboarding();
  const {
    selectedDays,
    sessionsPerDay,
    dayPreferences,
    sessionOptions,
    handleDayToggle,
    handleSessionTimeChange,
    handleSessionDurationChange,
    handleSessionsPerDayChange,
    handleAddSession,
    handleRemoveSession,
    handleContinue
  } = useStudySchedule();

  const onContinue = async () => {
    try {
      setIsSubmitting(true);
      await handleContinue();
      updateOnboardingStep('plan');
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <DaySelector 
        selectedDays={selectedDays} 
        toggleDaySelection={handleDayToggle} 
      />
      
      <Card className="p-4 border-purple-200">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-base font-semibold">Study Session Format</Label>
            <span className="text-sm font-medium text-purple-700">
              {sessionsPerDay} {sessionsPerDay === 1 ? 'session' : 'sessions'} per day
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Choose your preferred study format:</Label>
              <Select 
                value={sessionsPerDay.toString()}
                onValueChange={(value) => handleSessionsPerDayChange([parseInt(value)])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose session format" />
                </SelectTrigger>
                <SelectContent>
                  {sessionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label} ({option.durationMinutes} min each)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            You can customize each session's time and duration individually below. 
            Feel free to add more sessions to any day.
          </p>
        </div>
      </Card>
      
      {selectedDays.map((dayIndex) => (
        <DayTimePreferences
          key={dayIndex}
          dayIndex={dayIndex}
          dayName={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex - 1]}
          isSelected={selectedDays.includes(dayIndex)}
          sessionsCount={sessionsPerDay}
          sessionTimes={
            dayPreferences.find(p => p.dayIndex === dayIndex)?.sessionTimes ||
              Array(sessionsPerDay).fill({ startHour: 15, durationMinutes: 45 })
          }
          onSessionTimeChange={handleSessionTimeChange}
          onSessionDurationChange={handleSessionDurationChange}
          onAddSession={handleAddSession}
          onRemoveSession={handleRemoveSession}
        />
      ))}
      
      <div className="pt-6">
        <Button
          onClick={onContinue}
          disabled={selectedDays.length === 0 || isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};
