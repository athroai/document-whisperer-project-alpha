
import { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { PreferredStudySlot } from '@/types/study';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDayPreferences, DayPreference } from './useDayPreferences';
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

  // Get available subjects from the database
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([
    'Mathematics', 'English', 'Science', 'History', 'Geography', 'Languages',
    'Computer Science', 'Art', 'Music', 'Physical Education'
  ]);

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

    // Validate that each selected day has at least one session
    for (const dayIndex of selectedDays) {
      const dayPref = dayPreferences.find(p => p.dayIndex === dayIndex);
      if (!dayPref || dayPref.sessionTimes.length === 0) {
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
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
      
      // Try to get student subjects
      let subjects: string[] = [];
      try {
        const { data } = await supabase
          .from('student_subject_preferences')
          .select('subject')
          .eq('student_id', authState.user?.id || '');
          
        if (data && data.length > 0) {
          subjects = data.map(item => item.subject);
          console.log("Found user subjects for schedule:", subjects);
        } else {
          console.log("No subjects found in student_subject_preferences, checking onboarding context");
          
          // Try to get subjects from onboarding context
          try {
            const { selectedSubjects } = useOnboarding();
            if (selectedSubjects && selectedSubjects.length > 0) {
              subjects = selectedSubjects.map(s => s.subject);
              console.log("Using subjects from onboarding context:", subjects);
            }
          } catch (err) {
            console.error("Error getting subjects from onboarding context:", err);
          }
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
      
      // If no subjects found, use default subjects
      if (subjects.length === 0) {
        console.warn("No subjects found, falling back to default subjects");
        subjects = availableSubjects;
      }

      console.log("Creating study slots with subjects:", subjects);

      // Convert day preferences to study slots and assign subjects in rotation
      selectedDays.forEach(dayOfWeek => {
        const dayPreference = dayPreferences.find(p => p.dayIndex === dayOfWeek);
        if (dayPreference) {
          dayPreference.sessionTimes.forEach((session, i) => {
            // Assign a subject in rotation
            const subjectIndex = newSlots.length % subjects.length;
            const subjectForSlot = subjects[subjectIndex];
            
            console.log(`Assigning subject ${subjectForSlot} to slot on day ${dayOfWeek}`);
            
            newSlots.push({
              id: getSessionId(dayOfWeek, i),
              user_id: authState.user?.id || 'temp-user-id',
              day_of_week: dayOfWeek,
              slot_count: 1,
              slot_duration_minutes: session.durationMinutes,
              preferred_start_hour: session.startHour,
              subject: subjectForSlot // Assign subject
            });
          });
        }
      });

      console.log("Created study slots with subjects:", newSlots.map(s => `${s.day_of_week}: ${s.subject}`));
      setStudySlots(newSlots);

      const userId = authState.user?.id;

      if (!userId) {
        throw new Error('Authentication required to save study schedule');
      }
      
      // Save the study slots to the database
      await saveStudySlotsToDatabase(userId, newSlots);
      
      // Create calendar events for the sessions
      const events = await createCalendarEvents(newSlots, true);
      console.log(`Created ${events.length} calendar events with subjects:`, 
                 events.map(e => e.subject || 'Unknown'));

      try {
        // Update onboarding progress
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

      // Save slots to localStorage for backup
      localStorage.setItem('athro_study_slots', JSON.stringify(newSlots));

      // Move to the next step in the onboarding flow
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
