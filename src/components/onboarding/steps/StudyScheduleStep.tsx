
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { DaySelector } from '../DaySelector';
import { DayTimePreferences } from '../DayTimePreferences';
import { useStudySchedule } from '@/hooks/useStudySchedule';

export const StudyScheduleStep: React.FC = () => {
  const {
    selectedDays,
    sessionsPerDay,
    dayPreferences,
    isSubmitting,
    handleDayToggle,
    handleSessionTimeChange,
    handleSessionsPerDayChange,
    handleContinue
  } = useStudySchedule();

  return (
    <div className="space-y-6">
      <DaySelector 
        selectedDays={selectedDays} 
        toggleDaySelection={handleDayToggle} 
      />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">Sessions per Day</Label>
          <span className="text-sm font-medium">
            {sessionsPerDay} {sessionsPerDay === 1 ? 'session' : 'sessions'}
          </span>
        </div>
        <Slider
          value={[sessionsPerDay]}
          min={1}
          max={4}
          step={1}
          onValueChange={handleSessionsPerDayChange}
        />
      </div>
      
      {selectedDays.map((dayIndex) => (
        <DayTimePreferences
          key={dayIndex}
          dayIndex={dayIndex}
          dayName={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex - 1]}
          isSelected={selectedDays.includes(dayIndex)}
          sessionsCount={sessionsPerDay}
          sessionTimes={dayPreferences.find(p => p.dayIndex === dayIndex)?.sessionTimes || []}
          onSessionTimeChange={handleSessionTimeChange}
        />
      ))}
      
      <div className="pt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/subjects'}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={selectedDays.length === 0 || isSubmitting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? "Saving..." : "Continue to Generate Study Plan"}
        </Button>
      </div>
    </div>
  );
};
