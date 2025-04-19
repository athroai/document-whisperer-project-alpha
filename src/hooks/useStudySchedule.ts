
import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { PreferredStudySlot } from '@/types/study';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCalendarEvents } from './useCalendarEvents';

interface SessionTime {
  startHour: number;
  durationMinutes: number;
}

interface DayPreference {
  dayIndex: number;
  sessionTimes: SessionTime[];
}

export const useStudySchedule = () => {
  const navigate = useNavigate();
  const { updateOnboardingStep, updateStudySlots, setStudySlots } = useOnboarding();
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(2);
  const [dayPreferences, setDayPreferences] = useState<DayPreference[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const { createEvent } = useCalendarEvents();
  
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

  const createCalendarEvents = async (slots: PreferredStudySlot[]) => {
    if (!slots.length) return;
    
    try {
      // Create initial calendar events for the next 4 weeks
      for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
        for (const slot of slots) {
          // Calculate the date for this slot
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
          
          // Calculate days to add to get to the target day of this week
          let daysToAdd = slot.day_of_week - dayOfWeek;
          if (daysToAdd <= 0) daysToAdd += 7; // Move to next week if day has passed
          
          // Add weeks for future events
          daysToAdd += weekOffset * 7;
          
          const eventDate = new Date(today);
          eventDate.setDate(today.getDate() + daysToAdd);
          eventDate.setHours(slot.preferred_start_hour, 0, 0, 0);
          
          const endTime = new Date(eventDate);
          endTime.setMinutes(endTime.getMinutes() + slot.slot_duration_minutes);
          
          await createEvent({
            subject: "Study Session",
            start_time: eventDate.toISOString(),
            end_time: endTime.toISOString(),
            event_type: 'study_session'
          });
        }
      }
    } catch (error) {
      console.error('Error creating calendar events:', error);
    }
  };

  const handleContinue = async () => {
    if (selectedDays.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Remove any existing study slots first
      if (authState.user?.id) {
        await supabase
          .from('preferred_study_slots')
          .delete()
          .eq('user_id', authState.user.id);
      }
      
      setStudySlots([]);
      
      const newSlots: PreferredStudySlot[] = [];
      
      // Create a slot for each session in each selected day
      selectedDays.forEach(dayOfWeek => {
        const dayPreference = dayPreferences.find(p => p.dayIndex === dayOfWeek);
        
        if (dayPreference) {
          dayPreference.sessionTimes.forEach((session, sessionIndex) => {
            newSlots.push({
              id: `temp-${Date.now()}-${dayOfWeek}-${sessionIndex}`,
              user_id: authState.user?.id || 'temp-user-id',
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
              user_id: authState.user?.id || 'temp-user-id',
              day_of_week: dayOfWeek,
              slot_count: 1,
              slot_duration_minutes: getSessionDurationForCount(sessionsPerDay),
              preferred_start_hour: 15 + i // Space them out a bit
            });
          }
        }
      });
      
      setStudySlots(newSlots);
      
      // Create slots for each session in each selected day
      const slots = selectedDays.flatMap(dayOfWeek => {
        const dayPref = dayPreferences.find(p => p.dayIndex === dayOfWeek);
        
        if (dayPref) {
          return dayPref.sessionTimes.map((session) => ({
            user_id: authState.user?.id,
            day_of_week: dayOfWeek,
            slot_count: 1,
            slot_duration_minutes: session.durationMinutes,
            preferred_start_hour: session.startHour
          }));
        }
        
        return [];
      });

      // Only insert if user is authenticated
      if (slots.length > 0 && authState.user?.id) {
        const { error } = await supabase
          .from('preferred_study_slots')
          .insert(slots.filter(slot => !!slot.user_id));

        if (error) throw error;
        
        // Create calendar events from these slots
        await createCalendarEvents(slots as PreferredStudySlot[]);
      }
      
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
      
      updateOnboardingStep('calendar');
      navigate('/calendar');
    } catch (error) {
      console.error('Error saving study slots:', error);
      toast({
        title: "Error",
        description: "Failed to save your study schedule. Please try again.",
        variant: "destructive"
      });
      updateOnboardingStep('calendar');
      navigate('/calendar');
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
