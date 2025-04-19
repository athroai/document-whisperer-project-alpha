
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { DaySelector } from '../DaySelector';
import { DayTimePreferences } from '../DayTimePreferences';
import { Badge } from '@/components/ui/badge';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface SessionTime {
  startHour: number;
}

interface DayPreference {
  dayIndex: number;
  sessionTimes: SessionTime[];
}

export const StudyScheduleStep: React.FC = () => {
  const { updateOnboardingStep, setStudySlots } = useOnboarding();
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(2);
  const [dayPreferences, setDayPreferences] = useState<DayPreference[]>([]);

  const handleDayToggle = (dayIndex: number) => {
    const newSelectedDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter(d => d !== dayIndex)
      : [...selectedDays, dayIndex].sort();
    
    setSelectedDays(newSelectedDays);
    
    // Initialize session times for newly selected days
    if (!selectedDays.includes(dayIndex) && newSelectedDays.includes(dayIndex)) {
      setDayPreferences(prev => [
        ...prev,
        {
          dayIndex,
          sessionTimes: Array(sessionsPerDay).fill({ startHour: 15 }) // Default to 3 PM
        }
      ]);
    }
  };

  const handleSessionTimeChange = (dayIndex: number, sessionIndex: number, hour: number) => {
    setDayPreferences(prev => {
      const dayPrefIndex = prev.findIndex(p => p.dayIndex === dayIndex);
      if (dayPrefIndex === -1) {
        return [
          ...prev,
          {
            dayIndex,
            sessionTimes: Array(sessionsPerDay).fill({ startHour: 15 }).map((time, i) =>
              i === sessionIndex ? { startHour: hour } : time
            )
          }
        ];
      }

      const newPrefs = [...prev];
      newPrefs[dayPrefIndex] = {
        ...newPrefs[dayPrefIndex],
        sessionTimes: newPrefs[dayPrefIndex].sessionTimes.map((time, i) =>
          i === sessionIndex ? { startHour: hour } : time
        )
      };
      return newPrefs;
    });
  };

  const handleSessionsPerDayChange = (value: number[]) => {
    const newCount = value[0];
    setSessionsPerDay(newCount);
    
    // Update existing day preferences with new session count
    setDayPreferences(prev => prev.map(pref => ({
      ...pref,
      sessionTimes: Array(newCount).fill(null).map((_, i) =>
        pref.sessionTimes[i] || { startHour: 15 }
      )
    })));
  };

  const handleContinue = () => {
    const slots = selectedDays.map(dayIndex => {
      const dayPref = dayPreferences.find(p => p.dayIndex === dayIndex);
      return {
        id: `temp-${Date.now()}-${dayIndex}`,
        user_id: 'temp-user-id',
        day_of_week: dayIndex,
        slot_count: sessionsPerDay,
        slot_duration_minutes: 45, // Fixed duration for now
        preferred_start_hour: dayPref?.sessionTimes[0]?.startHour || 15
      };
    });

    setStudySlots(slots);
    updateOnboardingStep('style');
  };

  const totalSessions = selectedDays.length * sessionsPerDay;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Set Your Study Schedule</h2>
        <p className="text-muted-foreground">Choose your study days and preferred times</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Day Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Study Days</Label>
            <DaySelector
              selectedDays={selectedDays}
              toggleDaySelection={handleDayToggle}
            />
          </div>

          {/* Sessions per day */}
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
            <p className="text-sm text-muted-foreground">
              Total: {totalSessions} sessions per week
            </p>
          </div>

          {/* Per-day time preferences */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Session Times</Label>
            {DAYS_OF_WEEK.map((day, index) => (
              <DayTimePreferences
                key={index}
                dayIndex={index + 1}
                dayName={day}
                isSelected={selectedDays.includes(index + 1)}
                sessionsCount={sessionsPerDay}
                sessionTimes={dayPreferences.find(p => p.dayIndex === index + 1)?.sessionTimes || []}
                onSessionTimeChange={handleSessionTimeChange}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => updateOnboardingStep('subjects')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={selectedDays.length === 0}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};
