import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { PreferredStudySlot } from '@/types/study';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDayPreferences } from './useDayPreferences';
import { useSessionSlotOperations } from './useSessionSlotOperations';
import { supabase } from '@/lib/supabase';

const sessionOptions = [
  { value: 1, label: '1 session (long)', durationMinutes: 120 },
  { value: 2, label: '2 sessions', durationMinutes: 60 },
  { value: 3, label: '3 sessions', durationMinutes: 45 },
  { value: 4, label: '4 sessions (short)', durationMinutes: 30 },
  { value: 6, label: 'Many short sessions', durationMinutes: 20 },
];

const sessionDurationForCount = (count: number) => {
  const option = sessionOptions.find(opt => opt.value === count);
  return option ? option.durationMinutes : 45;
};

export function useStudyScheduleCore() {
  const navigate = useNavigate();
  const { updateOnboardingStep, updateStudySlots, setStudySlots } = useOnboarding();
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const { createCalendarEvents, saveStudySlotsToDatabase } = useSessionSlotOperations();

  const {
    selectedDays,
    setSelectedDays,
    dayPreferences,
    setDayPreferences,
    handleDayToggle,
    handleSessionTimeChange,
    handleSessionDurationChange,
    handleAddSession,
    handleRemoveSession
  } = useDayPreferences(sessionsPerDay, sessionDurationForCount);

  const handleSessionsPerDayChange = (newCount: number) => {
    setSessionsPerDay(newCount);
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

      selectedDays.forEach(dayOfWeek => {
        const dayPreference = dayPreferences.find(p => p.dayIndex === dayOfWeek);
        if (dayPreference) {
          dayPreference.sessionTimes.forEach((session, i) => {
            newSlots.push({
              id: getSessionId(dayOfWeek, i),
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

      const userId = authState.user?.id;

      if (!userId) {
        throw new Error('Authentication required to save study schedule');
      }
      await saveStudySlotsToDatabase(userId, newSlots);
      const events = await createCalendarEvents(newSlots, true);

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
    } catch (error: any) {
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
}
