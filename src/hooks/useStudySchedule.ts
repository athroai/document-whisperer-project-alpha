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
    
    // Distribute sessions throughout the day (9am to 8pm)
    return Array(count).fill(null).map((_, i) => {
      // Start at 9am and distribute evenly
      const startHour = 9 + Math.floor(i * (11 / Math.max(count, 1)));
      return {
        startHour,
        durationMinutes: duration
      };
    });
  };

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
  }, [selectedDays]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setDayPreferences(prevPrefs => {
      let updated = [...prevPrefs];
      
      // Filter to only include selected days
      updated = updated.filter(p => selectedDays.includes(p.dayIndex));
      
      // Update session counts as needed
      updated = updated.map(p => {
        // Only adjust if the current session count doesn't match the target count
        if (p.sessionTimes.length === sessionsPerDay) {
          return p;
        }
        
        if (p.sessionTimes.length < sessionsPerDay) {
          // Add more sessions if needed
          const additionalSessions = getDefaultSessionTimes(sessionsPerDay - p.sessionTimes.length);
          
          // Try to distribute new sessions at different times than existing ones
          const existingHours = new Set(p.sessionTimes.map(s => s.startHour));
          const adjustedAdditionalSessions = additionalSessions.map(session => {
            let hour = session.startHour;
            
            // Find a free hour by incrementing until we find one that's not used
            while (existingHours.has(hour)) {
              hour = (hour + 1) % 24;
              if (hour < 8) hour = 8; // Don't go before 8am
              if (hour > 20) hour = 8; // If we reach 8pm, wrap back to 8am
            }
            
            return {
              startHour: hour,
              durationMinutes: session.durationMinutes
            };
          });
          
          return {
            ...p,
            sessionTimes: [...p.sessionTimes, ...adjustedAdditionalSessions]
          };
        } else {
          // If we need fewer sessions, keep the first 'sessionsPerDay' ones
          return {
            ...p,
            sessionTimes: p.sessionTimes.slice(0, sessionsPerDay)
          };
        }
      });
      
      return updated;
    });
  }, [sessionsPerDay, selectedDays]);

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
      
      // Find an available hour that's not already used
      const existingHours = new Set(p.sessionTimes.map(s => s.startHour));
      let newHour = 16; // Default to 4pm
      
      // Try hours between 8am and 8pm
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
    
    // Update sessions per day if needed
    const dayPref = dayPreferences.find(p => p.dayIndex === dayIndex);
    if (dayPref && dayPref.sessionTimes.length + 1 > sessionsPerDay) {
      setSessionsPerDay(dayPref.sessionTimes.length + 1);
    }
  };

  const handleRemoveSession = (dayIndex: number, sessionIndex: number) => {
    setDayPreferences(prevPrefs => prevPrefs.map(p => {
      if (p.dayIndex !== dayIndex) return p;
      if (p.sessionTimes.length <= 1) return p; // Keep at least one session
      
      const newTimes = [...p.sessionTimes];
      newTimes.splice(sessionIndex, 1);
      return { ...p, sessionTimes: newTimes };
    }));
  };

  const handleSessionsPerDayChange = (newCount: number) => {
    setSessionsPerDay(newCount);
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
        startTime.setHours(slot.preferred_start_hour || 16, 0, 0, 0);
        
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
    if (!userId) {
      console.error('No user ID provided when saving study slots');
      throw new Error('Authentication required');
    }
    
    try {
      console.log('Saving slots to database for user:', userId);
      
      // First, delete any existing slots for this user
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
      
      const { data, error } = await supabase
        .from('preferred_study_slots')
        .insert(slotsToInsert)
        .select();
      
      if (error) {
        console.error('Error inserting slots:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('Successfully saved study slots:', data);
      return true;
    } catch (error) {
      console.error('Error saving study slots to database:', error);
      throw error;
    }
  };

  const getSessionId = (day: number, sessIdx: number) => `session-${day}-${sessIdx}-${Date.now()}`;

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
    
    for (const dayIndex of selectedDays) {
      const dayPref = dayPreferences.find(p => p.dayIndex === dayIndex);
      if (!dayPref || dayPref.sessionTimes.length === 0) {
        const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex - 1];
        setError(
          `Please add at least one study session for ${dayName}`
        );
        toast({
          title: "Missing Sessions",
          description: `Please add at least one study session for ${dayName}`,
          variant: "destructive"
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const newSlots: PreferredStudySlot[] = [];
      
      // Create individual slots for each session time
      selectedDays.forEach(dayOfWeek => {
        const dayPreference = dayPreferences.find(p => p.dayIndex === dayOfWeek);
        
        if (dayPreference) {
          dayPreference.sessionTimes.forEach((session, i) => {
            newSlots.push({
              id: getSessionId(dayOfWeek, i),
              user_id: authState.user?.id || 'temp-user-id',
              day_of_week: dayOfWeek,
              slot_count: 1,  // Each session is a single slot
              slot_duration_minutes: session.durationMinutes,
              preferred_start_hour: session.startHour
            });
          });
        }
      });
      
      setStudySlots(newSlots);
      
      // Get the authenticated user ID
      const userId = authState.user?.id;
      
      if (!userId) {
        throw new Error('Authentication required to save study schedule');
      }
      
      try {
        await saveStudySlotsToDatabase(userId, newSlots);
        console.log('Study slots saved successfully');
        
        // Create calendar events for the sessions
        const events = await createCalendarEvents(newSlots, true);
        console.log(`Created ${events.length} calendar events`);
        
        // Update onboarding progress
        try {
          const { data, error: fetchError } = await supabase
            .from('onboarding_progress')
            .select('*')
            .eq('student_id', userId)
            .maybeSingle();

          const progressData = {
            has_completed_availability: true,
            current_step: 'calendar',
            updated_at: new Date().toISOString()
          };

          if (fetchError) {
            console.warn('Error checking onboarding progress:', fetchError);
          }

          if (data) {
            await supabase
              .from('onboarding_progress')
              .update(progressData)
              .eq('student_id', userId);
          } else {
            await supabase
              .from('onboarding_progress')
              .insert({
                student_id: userId,
                ...progressData
              });
          }
        } catch (progressError) {
          console.error('Error handling onboarding progress:', progressError);
        }
        
        updateOnboardingStep('calendar');
        
        toast({
          title: "Success",
          description: `Your study schedule with ${newSlots.length} custom sessions has been created.`,
        });
      } catch (dbError: any) {
        console.error('Database error when saving slots:', dbError);
        throw new Error(`Failed to save study schedule: ${dbError.message}`);
      }
    } catch (error: any) {
      console.error('Error saving study slots:', error);
      setError(error.message || "Failed to save study schedule. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to save study schedule",
        variant: "destructive"
      });
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
