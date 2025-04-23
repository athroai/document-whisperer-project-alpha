
import { useState, useEffect, useCallback } from 'react';

export interface SessionTime {
  startHour: number;
  durationMinutes: number;
}

export interface DayPreference {
  dayIndex: number;
  sessionTimes: SessionTime[];
}

export function useDayPreferences(sessionsPerDay: number, sessionDurationForCount: (count: number) => number) {
  // Include weekend days (0 = Sunday, 6 = Saturday) in the default selection
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [dayPreferences, setDayPreferences] = useState<DayPreference[]>([]);

  const getDefaultSessionTimes = useCallback((count: number) => {
    const duration = sessionDurationForCount(count);

    return Array(count).fill(null).map((_, i) => {
      const startHour = 9 + Math.floor(i * (11 / Math.max(count, 1))) % 12;
      return {
        startHour: startHour < 8 ? startHour + 8 : startHour,
        durationMinutes: duration
      };
    });
  }, [sessionDurationForCount]);

  // Initialize day preferences for selected days
  useEffect(() => {
    const initializePreferences = () => {
      const initialPreferences: DayPreference[] = [];

      selectedDays.forEach(day => {
        if (!dayPreferences.some(p => p.dayIndex === day)) {
          initialPreferences.push({
            dayIndex: day,
            sessionTimes: getDefaultSessionTimes(sessionsPerDay)
          });
        }
      });

      if (initialPreferences.length > 0) {
        setDayPreferences(prev => [...prev, ...initialPreferences]);
      }
    };

    initializePreferences();
    // eslint-disable-next-line
  }, [selectedDays, sessionsPerDay, getDefaultSessionTimes]);

  // Update session counts when session count changes or days change
  useEffect(() => {
    setDayPreferences(prevPrefs => {
      let updated = [...prevPrefs];

      updated = updated.filter(p => selectedDays.includes(p.dayIndex));

      updated = updated.map(p => {
        if (p.sessionTimes.length === sessionsPerDay) return p;

        if (p.sessionTimes.length < sessionsPerDay) {
          const additionalSessions = getDefaultSessionTimes(sessionsPerDay - p.sessionTimes.length);

          const existingHours = new Set(p.sessionTimes.map(s => s.startHour));
          const adjustedAdditionalSessions = additionalSessions.map(session => {
            let hour = session.startHour;
            while (existingHours.has(hour)) {
              hour = (hour + 1) % 24;
              if (hour < 8) hour = 8;
              if (hour > 20) hour = 8;
            }
            existingHours.add(hour);

            return { startHour: hour, durationMinutes: session.durationMinutes };
          });

          return {
            ...p,
            sessionTimes: [...p.sessionTimes, ...adjustedAdditionalSessions]
          };
        } else {
          return {
            ...p,
            sessionTimes: p.sessionTimes.slice(0, sessionsPerDay)
          };
        }
      });

      return updated;
    });
  }, [sessionsPerDay, selectedDays, getDefaultSessionTimes]);

  const handleDayToggle = (dayIndex: number) => {
    const newSelectedDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter(d => d !== dayIndex)
      : [...selectedDays, dayIndex].sort();

    setSelectedDays(newSelectedDays);
  };

  const handleSessionTimeChange = (dayIndex: number, sessionIndex: number, hour: number) => {
    setDayPreferences(prevPrefs => prevPrefs.map(p => {
      if (p.dayIndex !== dayIndex) return p;
      const updatedTimes = [...p.sessionTimes];
      if (updatedTimes[sessionIndex]) {
        updatedTimes[sessionIndex] = {
          ...updatedTimes[sessionIndex],
          startHour: hour
        };
      }
      return { ...p, sessionTimes: updatedTimes };
    }));
  };

  const handleSessionDurationChange = (dayIndex: number, sessionIndex: number, minutes: number) => {
    setDayPreferences(prevPrefs => prevPrefs.map(p => {
      if (p.dayIndex !== dayIndex) return p;
      const updatedTimes = [...p.sessionTimes];
      if (updatedTimes[sessionIndex]) {
        updatedTimes[sessionIndex] = {
          ...updatedTimes[sessionIndex],
          durationMinutes: minutes
        };
      }
      return { ...p, sessionTimes: updatedTimes };
    }));
  };

  const handleAddSession = (dayIndex: number) => {
    setDayPreferences(prevPrefs => prevPrefs.map(p => {
      if (p.dayIndex !== dayIndex) return p;

      const existingHours = new Set(p.sessionTimes.map(s => s.startHour));
      let newHour = 16;
      for (let h = 8; h <= 20; h++) {
        if (!existingHours.has(h)) {
          newHour = h;
          break;
        }
      }

      return {
        ...p,
        sessionTimes: [...p.sessionTimes, { startHour: newHour, durationMinutes: 45 }]
      };
    }));
  };

  const handleRemoveSession = (dayIndex: number, sessionIndex: number) => {
    setDayPreferences(prevPrefs => prevPrefs.map(p => {
      if (p.dayIndex !== dayIndex) return p;
      if (p.sessionTimes.length <= 1) return p;

      const newTimes = [...p.sessionTimes];
      newTimes.splice(sessionIndex, 1);
      return { ...p, sessionTimes: newTimes };
    }));
  };

  return {
    selectedDays,
    setSelectedDays,
    dayPreferences,
    setDayPreferences,
    handleDayToggle,
    handleSessionTimeChange,
    handleSessionDurationChange,
    handleAddSession,
    handleRemoveSession
  };
}
