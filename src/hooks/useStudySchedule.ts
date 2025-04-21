
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
  const [error, setError] = useState<string | null>(null);
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const { createEvent } = useCalendarEvents();
  
  const sessionOptions = [
    { value: 1, label: '1 session (long)', durationMinutes: 120 },
    { value: 2, label: '2 sessions', durationMinutes: 60 },
    { value: 4, label: '4 sessions (short)', durationMinutes: 30 },
    { value: 6, label: 'Many short sessions', durationMinutes: 20 },
  ];

  const getDefaultSessionTimes = (count: number) => {
    const duration = getSessionDurationForCount(count);
    return Array(count).fill(null).map((_, i) => ({
      startHour: 15 + i,
      durationMinutes: duration
    }));
  };

  useEffect(() => {
    setDayPreferences(prevPrefs => {
      let updated = [...prevPrefs];
      selectedDays.forEach(day => {
        if (!updated.some(p => p.dayIndex === day)) {
          updated.push({
            dayIndex: day,
            sessionTimes: getDefaultSessionTimes(sessionsPerDay)
          });
        }
      });
      updated = updated.filter(p => selectedDays.includes(p.dayIndex));
      updated = updated.map(p => {
        if (p.sessionTimes.length !== sessionsPerDay) {
          if (p.sessionTimes.length < sessionsPerDay) {
            return {
              ...p,
              sessionTimes: [
                ...p.sessionTimes,
                ...getDefaultSessionTimes(sessionsPerDay - p.sessionTimes.length)
              ]
            };
          }
          return {
            ...p,
            sessionTimes: p.sessionTimes.slice(0, sessionsPerDay)
          };
        }
        return p;
      });
      return updated;
    });
  }, [selectedDays, sessionsPerDay]);

  const handleDayToggle = (dayIndex: number) => {
    setError(null);
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
    setDayPreferences(prevPrefs => prevPrefs.map(p => {
      if (p.dayIndex !== dayIndex) return p;
      const updatedTimes = [...p.sessionTimes];
      updatedTimes[sessionIndex] = {
        ...updatedTimes[sessionIndex],
        startHour: hour
      };
      return { ...p, sessionTimes: updatedTimes };
    }));
  };

  const handleSessionDurationChange = (dayIndex: number, sessionIndex: number, minutes: number) => {
    setDayPreferences(prevPrefs => prevPrefs.map(p => {
      if (p.dayIndex !== dayIndex) return p;
      const updatedTimes = [...p.sessionTimes];
      updatedTimes[sessionIndex] = {
        ...updatedTimes[sessionIndex],
        durationMinutes: minutes
      };
      return { ...p, sessionTimes: updatedTimes };
    }));
  };

  const handleAddSession = (dayIndex: number) => {
    setDayPreferences(prevPrefs => prevPrefs.map(p => {
      if (p.dayIndex !== dayIndex) return p;
      return {
        ...p,
        sessionTimes: [...p.sessionTimes, { startHour: 15, durationMinutes: 45 }]
      };
    }));
    
    // Update sessions per day if we're adding beyond the current setting
    setSessionsPerDay(prevCount => {
      const dayPref = dayPreferences.find(p => p.dayIndex === dayIndex);
      if (dayPref && dayPref.sessionTimes.length + 1 > prevCount) {
        return dayPref.sessionTimes.length + 1;
      }
      return prevCount;
    });
  };

  const handleRemoveSession = (dayIndex: number, sessionIndex: number) => {
    setDayPreferences(prevPrefs => prevPrefs.map(p => {
      if (p.dayIndex !== dayIndex) return p;
      if (p.sessionTimes.length <= 1) return p;
      const newTimes = p.sessionTimes.filter((_, idx) => idx !== sessionIndex);
      return { ...p, sessionTimes: newTimes };
    }));
  };

  const handleSessionsPerDayChange = (newCount: number) => {
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
    setError(null);
    
    if (selectedDays.length === 0) {
      setError("Please select at least one day for your study schedule.");
      toast({
        title: "No Days Selected",
        description: "Please select at least one day for your study schedule.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate that each day has at least one study session
    for (const dayIndex of selectedDays) {
      const dayPref = dayPreferences.find(p => p.dayIndex === dayIndex);
      if (!dayPref || dayPref.sessionTimes.length === 0) {
        setError(`Please add at least one study session for ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex - 1]}`);
        toast({
          title: "Missing Sessions",
          description: `Please add at least one study session for ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex - 1]}`,
          variant: "destructive"
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const newSlots: PreferredStudySlot[] = [];
      
      // Convert each individual session to a study slot
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
        
        // Save onboarding progress
        try {
          if (userId) {
            // First check if the record exists
            const { data, error: fetchError } = await supabase
              .from('onboarding_progress')
              .select('*')
              .eq('student_id', userId)
              .maybeSingle();
                
            if (fetchError) {
              console.warn('Error checking onboarding progress:', fetchError);
            } 
            
            const progressData = {
              has_completed_availability: true,
              current_step: 'calendar',
              updated_at: new Date().toISOString()
            };
            
            if (data) {
              // Update existing record
              await supabase
                .from('onboarding_progress')
                .update(progressData)
                .eq('student_id', userId);
            } else {
              // Insert new record
              await supabase
                .from('onboarding_progress')
                .insert({
                  student_id: userId,
                  ...progressData
                });
            }
          }
        } catch (progressError) {
          console.error('Error handling onboarding progress:', progressError);
        }
      } else {
        localStorage.setItem('athro_study_slots', JSON.stringify(newSlots));
      }
      
      updateOnboardingStep('calendar');
      
      navigate('/calendar?fromSetup=true');
      
      toast({
        title: "Success",
        description: "Your study schedule has been created successfully.",
      });
    } catch (error: any) {
      console.error('Error saving study slots:', error);
      setError(error.message || "Failed to save study schedule. Please try again.");
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
    error,
    handleDayToggle,
    handleSessionTimeChange,
    handleSessionDurationChange,
    handleSessionsPerDayChange,
    handleAddSession,
    handleRemoveSession,
    handleContinue
  };
};
