
import { supabase } from '@/lib/supabase';
import { SubjectPreference, Availability } from './types';
import { PreferredStudySlot } from '@/types/study';
import { ConfidenceLabel } from '@/types/confidence';

export const createOnboardingActions = (
  userId: string | undefined,
  setSelectedSubjects: React.Dispatch<React.SetStateAction<SubjectPreference[]>>,
  setAvailability: React.Dispatch<React.SetStateAction<Availability[]>>,
  setStudySlots: React.Dispatch<React.SetStateAction<PreferredStudySlot[]>>,
  setLearningPreferences: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>,
) => ({
  selectSubject: (subject: string, confidence: ConfidenceLabel) => {
    setSelectedSubjects(prev => {
      const existingIndex = prev.findIndex(s => s.subject === subject);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { subject, confidence };
        return updated;
      }
      return [...prev, { subject, confidence }];
    });
  },

  removeSubject: (subject: string) => {
    setSelectedSubjects(prev => prev.filter(s => s.subject !== subject));
  },

  updateAvailability: (newAvailability: Availability[]) => {
    setAvailability(newAvailability);
  },

  updateLearningPreferences: (preferences: Record<string, any>) => {
    setLearningPreferences(prev => ({
      ...prev,
      ...preferences
    }));
  },

  updateStudySlots: async ({ dayOfWeek, slotCount, slotDurationMinutes, preferredStartHour }: {
    dayOfWeek: number,
    slotCount: number,
    slotDurationMinutes: number,
    preferredStartHour: number
  }) => {
    if (!userId) return;
    
    const newSlot = {
      id: `temp-${Date.now()}`,
      user_id: userId,
      day_of_week: dayOfWeek,
      slot_count: slotCount,
      slot_duration_minutes: slotDurationMinutes,
      preferred_start_hour: preferredStartHour,
      created_at: new Date().toISOString()
    };
    
    setStudySlots(prev => [...prev, newSlot]);
    
    try {
      await supabase
        .from('preferred_study_slots')
        .insert({
          user_id: userId,
          day_of_week: dayOfWeek,
          slot_count: slotCount,
          slot_duration_minutes: slotDurationMinutes,
          preferred_start_hour: preferredStartHour
        });
    } catch (error) {
      console.error('Error in updateStudySlots:', error);
    }
  },

  completeOnboarding: async () => {
    if (!userId) throw new Error('No user logged in');

    try {
      console.log("Completing onboarding for user:", userId);
      
      // Get the current selected subjects
      let subjectPrefs: SubjectPreference[] = [];
      setSelectedSubjects(prev => {
        subjectPrefs = [...prev];
        return prev;
      });
      
      // Create an array of promises for subject preferences
      const subjectPromises = subjectPrefs.map(subject => 
        supabase.from('student_subject_preferences').insert({
          student_id: userId,
          subject: subject.subject,
          confidence_level: subject.confidence,
          priority: subject.priority
        })
      );

      // First check if there's an existing record
      const { data: existingProgress } = await supabase
        .from('onboarding_progress')
        .select('id')
        .eq('student_id', userId)
        .maybeSingle();
      
      // Use insert or update based on whether a record exists
      if (existingProgress) {
        await supabase
          .from('onboarding_progress')
          .update({
            current_step: 'completed',
            has_completed_subjects: true,
            has_completed_availability: true,
            has_generated_plan: true,
            has_completed_diagnostic: true,
            completed_at: new Date().toISOString()
          })
          .eq('student_id', userId);
      } else {
        await supabase
          .from('onboarding_progress')
          .insert({
            student_id: userId,
            current_step: 'completed',
            has_completed_subjects: true,
            has_completed_availability: true,
            has_generated_plan: true,
            has_completed_diagnostic: true,
            completed_at: new Date().toISOString()
          });
      }

      // Execute all subject preference updates in parallel
      if (subjectPromises.length > 0) {
        await Promise.all(subjectPromises);
      }
      
      setCurrentStep('completed');

      // Persist onboarding completed flag locally for smoother onboarding check
      localStorage.setItem('onboarding_completed', 'true');
      return;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  },

  updateOnboardingStep: async (step: string) => {
    console.log('Updating onboarding step to:', step);
    setCurrentStep(step);
    
    if (userId) {
      try {
        // First check if there's an existing record
        const { data: existingProgress } = await supabase
          .from('onboarding_progress')
          .select('id')
          .eq('student_id', userId)
          .maybeSingle();
        
        // Use insert or update based on whether a record exists
        if (existingProgress) {
          await supabase
            .from('onboarding_progress')
            .update({ current_step: step })
            .eq('student_id', userId);
        } else {
          await supabase
            .from('onboarding_progress')
            .insert({ 
              student_id: userId, 
              current_step: step 
            });
        }
      } catch (error) {
        console.error('Error in updateOnboardingStep:', error);
      }
    }
  },
});
