
import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { PreferredStudySlot } from '@/types/study';

interface SessionTime {
  startHour: number;
}

interface DayPreference {
  dayIndex: number;
  sessionTimes: SessionTime[];
}

export const useStudySchedule = () => {
  const { updateOnboardingStep, updateStudySlots, setStudySlots } = useOnboarding();
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(2);
  const [dayPreferences, setDayPreferences] = useState<DayPreference[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleDayToggle = (dayIndex: number) => {
    const newSelectedDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter(d => d !== dayIndex)
      : [...selectedDays, dayIndex].sort();
    
    setSelectedDays(newSelectedDays);
    
    if (!selectedDays.includes(dayIndex) && newSelectedDays.includes(dayIndex)) {
      setDayPreferences(prev => [
        ...prev,
        {
          dayIndex,
          sessionTimes: Array(sessionsPerDay).fill({ startHour: 15 })
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
    
    setDayPreferences(prev => prev.map(pref => ({
      ...pref,
      sessionTimes: Array(newCount).fill(null).map((_, i) =>
        pref.sessionTimes[i] || { startHour: 15 }
      )
    })));
  };

  const handleContinue = async () => {
    if (selectedDays.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      setStudySlots([]);
      
      const newSlots: PreferredStudySlot[] = selectedDays.map(dayOfWeek => {
        const dayPreference = dayPreferences.find(p => p.dayIndex === dayOfWeek);
        return {
          id: `temp-${Date.now()}-${dayOfWeek}`,
          user_id: 'temp-user-id',
          day_of_week: dayOfWeek,
          slot_count: sessionsPerDay,
          slot_duration_minutes: 45,
          preferred_start_hour: dayPreference?.sessionTimes[0]?.startHour || 15
        };
      });
      
      setStudySlots(newSlots);
      
      selectedDays.forEach(dayOfWeek => {
        const dayPreference = dayPreferences.find(p => p.dayIndex === dayOfWeek);
        updateStudySlots({
          dayOfWeek,
          slotCount: sessionsPerDay,
          slotDurationMinutes: 45,
          preferredStartHour: dayPreference?.sessionTimes[0]?.startHour || 15
        });
      });
      
      updateOnboardingStep('generatePlan');
    } catch (error) {
      console.error('Error saving study slots:', error);
      updateOnboardingStep('generatePlan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedDays,
    sessionsPerDay,
    dayPreferences,
    isSubmitting,
    handleDayToggle,
    handleSessionTimeChange,
    handleSessionsPerDayChange,
    handleContinue
  };
};
