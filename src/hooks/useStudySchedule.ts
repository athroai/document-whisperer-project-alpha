
import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { PreferredStudySlot } from '@/types/study';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCalendarEvents } from './useCalendarEvents';
import { format, addDays } from 'date-fns';

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
    const option = sessionOptions.find(opt => opt.value === count);
    return option ? option.durationMinutes : 45;
  };

  const handleSessionTimeChange = (dayIndex: number, sessionIndex: number, hour: number) => {
    setDayPreferences(prev => {
      const dayPrefIndex = prev.findIndex(p => p.dayIndex === dayIndex);
      let newPrefs = [...prev];
      
      if (dayPrefIndex === -1) {
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
        const updatedTimes = [...newPrefs[dayPrefIndex].sessionTimes];
        updatedTimes[sessionIndex] = { 
          ...updatedTimes[sessionIndex], 
          startHour: hour 
        };
        
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
    
    const defaultDuration = getSessionDurationForCount(newCount);
    
    setDayPreferences(prev => prev.map(pref => ({
      ...pref,
      sessionTimes: Array(newCount).fill(null).map((_, i) => 
        pref.sessionTimes[i] || { startHour: 15, durationMinutes: defaultDuration }
      )
    })));
  };

  const createCalendarEvents = async (slots: PreferredStudySlot[], useLocalFallback: boolean = true) => {
    if (!slots.length) return [];
    
    try {
      const events = [];
      const today = new Date();
      const weekStartDate = today.getDate() - today.getDay() + 1; // Monday
      
      for (const slot of slots) {
        // Calculate the next occurrence of this day
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
          }, useLocalFallback); // Allow local fallback if database fails
          
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
      
      // First delete any existing slots
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
      
      // Prepare slots for insertion (remove temporary IDs)
      const slotsToInsert = slots.map(({ id, ...slot }) => ({
        user_id: userId,
        day_of_week: slot.day_of_week,
        slot_count: slot.slot_count,
        slot_duration_minutes: slot.slot_duration_minutes,
        preferred_start_hour: slot.preferred_start_hour
      }));
      
      console.log('Inserting slots:', slotsToInsert);
      
      // Insert new slots
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
      // Prepare study slots from selected days and preferences
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
      
      // Save slots to context
      setStudySlots(newSlots);
      
      // Get user ID (either from auth or mock user)
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
        // Try to save to database but don't block on failure
        try {
          await saveStudySlotsToDatabase(userId, newSlots);
        } catch (dbError) {
          console.error('Database error when saving slots - continuing with local storage:', dbError);
          
          // Save to local storage instead
          localStorage.setItem('athro_study_slots', JSON.stringify(newSlots));
        }
        
        // Create calendar events for these slots with local fallback
        await createCalendarEvents(newSlots, true);
        
        // Try to update onboarding progress if needed, but don't block on failure
        try {
          const { data, error } = await supabase
            .from('onboarding_progress')
            .select('*')
            .eq('student_id', userId)
            .maybeSingle();
            
          if (error) {
            console.warn('Error checking onboarding progress:', error);
          } else if (data) {
            // Update existing progress
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
            // Create new progress record
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
        // Save to local storage if no user ID
        localStorage.setItem('athro_study_slots', JSON.stringify(newSlots));
      }
      
      // Update context
      updateOnboardingStep('calendar');
      
      // Create study slots in context
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
      
      // Navigate to calendar page with a success flag
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
      
      // Still navigate to calendar in case of error
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
