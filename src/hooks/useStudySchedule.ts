import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { PreferredStudySlot } from '@/types/study';

interface SessionTime {
  startHour: number;
  durationMinutes: number;
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
  
  // Session type options
  const sessionOptions = [
    { value: 1, label: '1 session (long)', durationMinutes: 120 },
    { value: 2, label: '2 sessions', durationMinutes: 60 },
    { value: 4, label: '4 sessions (short)', durationMinutes: 30 },
    { value: 6, label: 'Many short sessions', durationMinutes: 20 },
  ];

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
          sessionTimes: Array(sessionsPerDay).fill({
            startHour: 15,
            durationMinutes: getSessionDurationForCount(sessionsPerDay)
          })
        }
      ]);
    }
  };

  const getSessionDurationForCount = (count: number): number => {
    // Find appropriate duration based on count
    const option = sessionOptions.find(opt => opt.value === count);
    return option ? option.durationMinutes : 45; // Default to 45 minutes
  };

  const handleSessionTimeChange = (dayIndex: number, sessionIndex: number, hour: number) => {
    setDayPreferences(prev => {
      const dayPrefIndex = prev.findIndex(p => p.dayIndex === dayIndex);
      let newPrefs = [...prev];
      
      if (dayPrefIndex === -1) {
        // Initialize new day preferences
        const defaultTimes = Array(sessionsPerDay).fill({
          startHour: 15,
          durationMinutes: getSessionDurationForCount(sessionsPerDay)
        });
        defaultTimes[sessionIndex] = { ...defaultTimes[sessionIndex], startHour: hour };
        
        newPrefs = [
          ...prev,
          {
            dayIndex,
            sessionTimes: defaultTimes
          }
        ];
      } else {
        // Update existing day preferences
        const updatedTimes = [...newPrefs[dayPrefIndex].sessionTimes];
        updatedTimes[sessionIndex] = { 
          ...updatedTimes[sessionIndex], 
          startHour: hour 
        };
        
        // Sort sessions by start time
        updatedTimes.sort((a, b) => a.startHour - b.startHour);
        
        newPrefs[dayPrefIndex] = {
          ...newPrefs[dayPrefIndex],
          sessionTimes: updatedTimes
        };
      }
      
      return newPrefs;
    });
  };
  
  const handleSessionDurationChange = (dayIndex: number, sessionIndex: number, minutes: number) => {
    setDayPreferences(prev => {
      const dayPrefIndex = prev.findIndex(p => p.dayIndex === dayIndex);
      if (dayPrefIndex === -1) {
        return [
          ...prev,
          {
            dayIndex,
            sessionTimes: Array(sessionsPerDay).fill({
              startHour: 15,
              durationMinutes: getSessionDurationForCount(sessionsPerDay)
            }).map((time, i) =>
              i === sessionIndex ? { ...time, durationMinutes: minutes } : time
            )
          }
        ];
      }

      const newPrefs = [...prev];
      newPrefs[dayPrefIndex] = {
        ...newPrefs[dayPrefIndex],
        sessionTimes: newPrefs[dayPrefIndex].sessionTimes.map((time, i) =>
          i === sessionIndex ? { ...time, durationMinutes: minutes } : time
        )
      };
      return newPrefs;
    });
  };

  const handleSessionsPerDayChange = (value: number[]) => {
    const newCount = value[0];
    setSessionsPerDay(newCount);
    
    // Calculate appropriate duration for the new session count
    const defaultDuration = getSessionDurationForCount(newCount);
    
    setDayPreferences(prev => prev.map(pref => ({
      ...pref,
      sessionTimes: Array(newCount).fill(null).map((_, i) => 
        pref.sessionTimes[i] || { startHour: 15, durationMinutes: defaultDuration }
      )
    })));
  };

  const handleContinue = async () => {
    if (selectedDays.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      setStudySlots([]);
      
      const newSlots: PreferredStudySlot[] = [];
      
      // Create a slot for each session in each selected day
      selectedDays.forEach(dayOfWeek => {
        const dayPreference = dayPreferences.find(p => p.dayIndex === dayOfWeek);
        
        if (dayPreference) {
          dayPreference.sessionTimes.forEach((session, sessionIndex) => {
            newSlots.push({
              id: `temp-${Date.now()}-${dayOfWeek}-${sessionIndex}`,
              user_id: 'temp-user-id',
              day_of_week: dayOfWeek,
              slot_count: 1, // Each slot represents one session now
              slot_duration_minutes: session.durationMinutes,
              preferred_start_hour: session.startHour
            });
          });
        } else {
          // Fallback if no preferences were set
          for (let i = 0; i < sessionsPerDay; i++) {
            newSlots.push({
              id: `temp-${Date.now()}-${dayOfWeek}-${i}`,
              user_id: 'temp-user-id',
              day_of_week: dayOfWeek,
              slot_count: 1,
              slot_duration_minutes: getSessionDurationForCount(sessionsPerDay),
              preferred_start_hour: 15 + i // Space them out a bit
            });
          }
        }
      });
      
      setStudySlots(newSlots);
      
      // Update study slots through the context
      selectedDays.forEach(dayOfWeek => {
        const dayPreference = dayPreferences.find(p => p.dayIndex === dayOfWeek);
        
        if (dayPreference) {
          dayPreference.sessionTimes.forEach(session => {
            updateStudySlots({
              dayOfWeek,
              slotCount: 1,
              slotDurationMinutes: session.durationMinutes,
              preferredStartHour: session.startHour
            });
          });
        }
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
    sessionOptions,
    handleDayToggle,
    handleSessionTimeChange,
    handleSessionDurationChange,
    handleSessionsPerDayChange,
    handleContinue
  };
};
