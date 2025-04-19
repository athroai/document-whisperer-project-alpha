import { useState, useEffect } from 'react';
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
  
  const sessionOptions = [
    { value: 1, label: '1 session (long)', durationMinutes: 120 },
    { value: 2, label: '2 sessions', durationMinutes: 60 },
    { value: 4, label: '4 sessions (short)', durationMinutes: 30 },
    { value: 6, label: 'Many short sessions', durationMinutes: 20 },
  ];

  useEffect(() => {
    const updateSessionsForSelectedDays = () => {
      setDayPreferences(prevPrefs => {
        const updatedPrefs = [...prevPrefs];
        
        selectedDays.forEach(dayIndex => {
          const existingPrefIndex = updatedPrefs.findIndex(p => p.dayIndex === dayIndex);
          
          if (existingPrefIndex === -1) {
            const defaultDuration = getSessionDurationForCount(sessionsPerDay);
            const sessionTimes: SessionTime[] = Array(sessionsPerDay).fill(null).map((_, i) => ({
              startHour: 15 + i,
              durationMinutes: defaultDuration
            }));
            
            updatedPrefs.push({
              dayIndex,
              sessionTimes
            });
          } else {
            const currentSessionCount = updatedPrefs[existingPrefIndex].sessionTimes.length;
            const defaultDuration = getSessionDurationForCount(sessionsPerDay);
            
            if (currentSessionCount < sessionsPerDay) {
              const lastSessionTime = updatedPrefs[existingPrefIndex].sessionTimes[currentSessionCount - 1];
              const lastEndTime = lastSessionTime ? lastSessionTime.startHour + 1 : 16;
              
              const newSessions = Array(sessionsPerDay - currentSessionCount)
                .fill(null)
                .map((_, i) => ({
                  startHour: Math.min(21, lastEndTime + i),
                  durationMinutes: defaultDuration
                }));
              
              updatedPrefs[existingPrefIndex].sessionTimes = [
                ...updatedPrefs[existingPrefIndex].sessionTimes,
                ...newSessions
              ];
            } else if (currentSessionCount > sessionsPerDay) {
              updatedPrefs[existingPrefIndex].sessionTimes = 
                updatedPrefs[existingPrefIndex].sessionTimes.slice(0, sessionsPerDay);
            }
          }
        });
        
        return updatedPrefs.filter(pref => selectedDays.includes(pref.dayIndex));
      });
    };
    
    updateSessionsForSelectedDays();
  }, [selectedDays, sessionsPerDay]);

  const handleDayToggle = (dayIndex: number) => {
    const newSelectedDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter(d => d !== dayIndex)
      : [...selectedDays, dayIndex].sort();
    
    setSelectedDays(newSelectedDays);
  };

  const getSessionDurationForCount = (count: number): number => {
    const option = sessionOptions.find(opt => opt.value === count);
    return option ? option.durationMinutes : 45;
  };

  const handleSessionTimeChange = (dayIndex: number, sessionIndex: number, hour: number) => {
    setDayPreferences(prev => {
      const dayPrefIndex = prev.findIndex(p => p.dayIndex === dayIndex);
      let newPrefs = [...prev];
      
      if (dayPrefIndex === -1) {
        const defaultTimes = Array(sessionsPerDay).fill(null).map((_, i) => ({
          startHour: 15 + i,
          durationMinutes: getSessionDurationForCount(sessionsPerDay)
        }));
        defaultTimes[sessionIndex] = { ...defaultTimes[sessionIndex], startHour: hour };
        
        newPrefs = [
          ...prev,
          {
            dayIndex,
            sessionTimes: defaultTimes
          }
        ];
      } else {
        const updatedTimes = [...newPrefs[dayPrefIndex].sessionTimes];
        updatedTimes[sessionIndex] = { 
          ...updatedTimes[sessionIndex], 
          startHour: hour 
        };
        
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
            sessionTimes: Array(sessionsPerDay).fill(null).map((_, i) => ({
              startHour: 15 + i,
              durationMinutes: i === sessionIndex ? minutes : getSessionDurationForCount(sessionsPerDay)
            }))
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
    
    const defaultDuration = getSessionDurationForCount(newCount);
    
    setDayPreferences(prev => prev.map(pref => {
      const sessionTimes = Array(newCount).fill(null).map((_, i) => {
        if (i < pref.sessionTimes.length) {
          return pref.sessionTimes[i];
        }
        
        const lastSessionIndex = i - 1;
        const lastSession = lastSessionIndex >= 0 && lastSessionIndex < pref.sessionTimes.length 
          ? pref.sessionTimes[lastSessionIndex]
          : { startHour: 14, durationMinutes: defaultDuration };
        
        const nextStartHour = Math.min(21, lastSession.startHour + 1);
        
        return { 
          startHour: nextStartHour, 
          durationMinutes: defaultDuration 
        };
      });
      
      return {
        ...pref,
        sessionTimes
      };
    }));
  };

  const createCalendarEvents = async (slots: PreferredStudySlot[], useLocalFallback: boolean = true) => {
    if (!slots.length) return [];
    
    try {
      const events = [];
      const today = new Date();
      const weekStartDate = today.getDate() - today.getDay() + 1; // Monday
      
      for (const slot of slots) {
        let dayDiff = slot.day_of_week - today.getDay();
        if (dayDiff <= 0) dayDiff += 7;
        
        const nextDate = new Date(today);
        nextDate.setDate(weekStartDate + slot.day_of_week - 1);
        
        const startTime = new Date(nextDate);
        startTime.setHours(slot.preferred_start_hour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + slot.slot_duration_minutes);
        
        try {
          const event = await createEvent({
            title: "Study Session",
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            subject: "General",
            event_type: 'study_session'
          }, useLocalFallback);
          
          if (event) {
            events.push(event);
          }
        } catch (err) {
          console.error('Error creating calendar event:', err);
          // Continue with other slots even if one fails
        }
      }
      
      return events;
    } catch (error) {
      console.error('Error creating calendar events:', error);
      return [];
    }
  };

  const saveStudySlotsToDatabase = async (userId: string, slots: PreferredStudySlot[]) => {
    try {
      console.log('Saving slots to database for user:', userId);
      
      try {
        await supabase
          .from('preferred_study_slots')
          .delete()
          .eq('user_id', userId);
      } catch (deleteError) {
        console.warn('Error deleting existing slots:', deleteError);
        // Continue even if delete fails
      }
        
      if (slots.length === 0) {
        return true;
      }
      
      const slotsToInsert = slots.map(({ id, ...slot }) => ({
        user_id: userId,
        day_of_week: slot.day_of_week,
        slot_count: slot.slot_count,
        slot_duration_minutes: slot.slot_duration_minutes,
        preferred_start_hour: slot.preferred_start_hour
      }));
      
      console.log('Inserting slots:', slotsToInsert);
      
      const { error } = await supabase
        .from('preferred_study_slots')
        .insert(slotsToInsert);
      
      if (error) {
        console.error('Error inserting slots:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving study slots to database:', error);
      throw error;
    }
  };

  const handleContinue = async () => {
    if (selectedDays.length === 0) {
      toast({
        title: "No Days Selected",
        description: "Please select at least one day for your study schedule.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newSlots: PreferredStudySlot[] = [];
      
      selectedDays.forEach(dayOfWeek => {
        const dayPreference = dayPreferences.find(p => p.dayIndex === dayOfWeek);
        
        if (dayPreference) {
          dayPreference.sessionTimes.forEach((session) => {
            newSlots.push({
              id: `temp-${Date.now()}-${dayOfWeek}-${Math.random()}`,
              user_id: authState.user?.id || 'temp-user-id',
              day_of_week: dayOfWeek,
              slot_count: 1,
              slot_duration_minutes: session.durationMinutes,
              preferred_start_hour: session.startHour
            });
          });
        } else {
          for (let i = 0; i < sessionsPerDay; i++) {
            newSlots.push({
              id: `temp-${Date.now()}-${dayOfWeek}-${i}`,
              user_id: authState.user?.id || 'temp-user-id',
              day_of_week: dayOfWeek,
              slot_count: 1,
              slot_duration_minutes: getSessionDurationForCount(sessionsPerDay),
              preferred_start_hour: 15 + i
            });
          }
        }
      });
      
      setStudySlots(newSlots);
      
      let userId = authState.user?.id;
      
      if (!userId && localStorage.getItem('athro_user')) {
        try {
          const mockUser = JSON.parse(localStorage.getItem('athro_user') || '{}');
          if (mockUser.id) {
            userId = mockUser.id;
            console.log('Using mock user ID for study slots:', userId);
          }
        } catch (err) {
          console.warn('Error parsing mock user:', err);
        }
      }
      
      if (userId) {
        try {
          await saveStudySlotsToDatabase(userId, newSlots);
        } catch (dbError) {
          console.error('Database error when saving slots - continuing with local storage:', dbError);
          
          localStorage.setItem('athro_study_slots', JSON.stringify(newSlots));
        }
        
        await createCalendarEvents(newSlots, true);
        
        try {
          const { data, error } = await supabase
            .from('onboarding_progress')
            .select('*')
            .eq('student_id', userId)
            .maybeSingle();
            
          if (error) {
            console.warn('Error checking onboarding progress:', error);
          } else if (data) {
            try {
              await supabase
                .from('onboarding_progress')
                .update({
                  has_completed_availability: true,
                  current_step: 'calendar',
                  updated_at: new Date().toISOString()
                })
                .eq('student_id', userId);
            } catch (updateError) {
              console.warn('Error updating onboarding progress:', updateError);
            }
          } else {
            try {
              await supabase
                .from('onboarding_progress')
                .insert({
                  student_id: userId,
                  current_step: 'calendar',
                  has_completed_availability: true
                });
            } catch (insertError) {
              console.warn('Error creating onboarding progress:', insertError);
            }
          }
        } catch (progressError) {
          console.error('Error handling onboarding progress:', progressError);
        }
      } else {
        localStorage.setItem('athro_study_slots', JSON.stringify(newSlots));
      }
      
      updateOnboardingStep('calendar');
      
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
      
      navigate('/calendar?fromSetup=true');
      
      toast({
        title: "Success",
        description: "Your study schedule has been created successfully.",
      });
    } catch (error: any) {
      console.error('Error saving study slots:', error);
      toast({
        title: "Warning",
        description: "Study schedule saved locally only. You can still use the calendar.",
        variant: "default"
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
