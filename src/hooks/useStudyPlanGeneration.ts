import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { SubjectPreference, PreferredStudySlot } from '@/types/study';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingContextType } from '@/contexts/onboarding/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface StudyPlanGenerationResult {
  studySlots: PreferredStudySlot[];
  isLoading: boolean;
  error: string | null;
  generateStudyPlan: () => Promise<void>;
}

export const useStudyPlanGeneration = (): StudyPlanGenerationResult => {
  const { state } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    selectedSubjects,
    availability,
    studySlots,
    setStudySlots,
    completeOnboarding,
  } = useOnboarding() as OnboardingContextType;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStudySlots = useCallback((): PreferredStudySlot[] => {
    if (!selectedSubjects || selectedSubjects.length === 0) {
      console.warn("No subjects selected, cannot generate study slots.");
      return [];
    }

    if (!availability || availability.length === 0) {
      console.warn("No availability set, cannot generate study slots.");
      return [];
    }

    const generatedSlots: PreferredStudySlot[] = [];

    selectedSubjects.forEach(subjectPref => {
      availability.forEach(avail => {
        // Generate a unique ID for each slot
        const slotId = `${subjectPref.subject}-${avail.dayOfWeek}-${avail.startHour}`;

        const newSlot: Omit<PreferredStudySlot, 'id' | 'user_id' | 'created_at'> = {
          day_of_week: avail.dayOfWeek,
          slot_count: 1, // Default to 1 slot for now
          slot_duration_minutes: 60, // Default duration
          preferred_start_hour: avail.startHour,
          subject: subjectPref.subject,
        };

        generatedSlots.push({
          ...newSlot,
          id: slotId,
          user_id: state.user?.id || 'default_user',
          created_at: new Date().toISOString(),
        } as PreferredStudySlot);
      });
    });

    return generatedSlots;
  }, [selectedSubjects, availability, state.user]);

  const saveStudySlots = useCallback(async (slots: PreferredStudySlot[]) => {
    if (!state.user) {
      console.error("User not authenticated, cannot save study slots.");
      setError("User not authenticated.");
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('preferred_study_slots')
        .upsert(
          slots.map(slot => ({
            ...slot,
            user_id: state.user!.id,
          })),
          { onConflict: 'id' }
        )
        .select();

      if (error) {
        console.error("Error saving study slots:", error);
        setError(error.message);
        return false;
      }

      console.log("Successfully saved study slots:", data);
      return true;
    } catch (err: any) {
      console.error("Error saving study slots:", err);
      setError(err.message);
      return false;
    }
  }, [state.user, supabase]);

  const generateStudyPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!state.user) {
        throw new Error("User not authenticated.");
      }

      // 1. Generate study slots
      const generatedSlots = generateStudySlots();
      setStudySlots(generatedSlots);

      // 2. Save study slots to database
      const saveSuccessful = await saveStudySlots(generatedSlots);
      if (!saveSuccessful) {
        throw new Error("Failed to save study slots.");
      }

      // 3. Mark onboarding as complete
      await completeOnboarding();

      toast({
        title: "Study plan generated!",
        description: "Your personalized study plan is ready.",
      });

      navigate('/home');
    } catch (err: any) {
      console.error("Error generating study plan:", err);
      setError(err.message || "Failed to generate study plan.");
      toast({
        title: "Error generating study plan",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    state.user,
    generateStudySlots,
    saveStudySlots,
    completeOnboarding,
    toast,
    navigate,
    setStudySlots,
  ]);

  useEffect(() => {
    if (studySlots && studySlots.length > 0) {
      console.log("Study slots:", studySlots);
    }
  }, [studySlots]);

  return { studySlots, isLoading, error, generateStudyPlan };
};
