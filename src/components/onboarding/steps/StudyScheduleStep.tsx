
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DaySelector } from '../DaySelector';
import { DayTimePreferences } from '../DayTimePreferences';
import { useStudySchedule } from '@/hooks/useStudySchedule';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

export const StudyScheduleStep: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedDays,
    sessionsPerDay,
    dayPreferences,
    isSubmitting,
    sessionOptions,
    handleDayToggle,
    handleSessionTimeChange,
    handleSessionDurationChange,
    handleSessionsPerDayChange,
    handleContinue
  } = useStudySchedule();

  const onContinue = async () => {
    await handleContinue();
    navigate('/calendar');  // Navigate to calendar after completion
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
            You can customize the time and duration for each session below
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
          sessionTimes={dayPreferences.find(p => p.dayIndex === dayIndex)?.sessionTimes || 
            Array(sessionsPerDay).fill({ startHour: 15, durationMinutes: 45 })}
          onSessionTimeChange={handleSessionTimeChange}
          onSessionDurationChange={handleSessionDurationChange}
        />
      ))}
      
      <div className="pt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/subjects')}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          onClick={onContinue}
          disabled={selectedDays.length === 0 || isSubmitting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? "Saving..." : "Continue to Calendar"}
        </Button>
      </div>
    </div>
  );
};
