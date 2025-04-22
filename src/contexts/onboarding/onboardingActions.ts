
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

    // Also update in database immediately if user is logged in
    if (userId) {
      try {
        console.log(`Immediately saving subject ${subject} with confidence ${confidence} to database`);
        supabase
          .from('student_subject_preferences')
          .upsert({
            student_id: userId,
            subject: subject,
            confidence_level: confidence
          })
          .then(({ error }) => {
            if (error) {
              console.error('Error saving subject to database:', error);
            } else {
              console.log(`Successfully saved subject ${subject} to database`);
            }
          });
      } catch (err) {
        console.error('Error in immediate subject save:', err);
      }
    }
  },

  removeSubject: (subject: string) => {
    setSelectedSubjects(prev => prev.filter(s => s.subject !== subject));
    
    // Also remove from database if user is logged in
    if (userId) {
      try {
        console.log(`Immediately removing subject ${subject} from database`);
        supabase
          .from('student_subject_preferences')
          .delete()
          .eq('student_id', userId)
          .eq('subject', subject)
          .then(({ error }) => {
            if (error) {
              console.error('Error removing subject from database:', error);
            } else {
              console.log(`Successfully removed subject ${subject} from database`);
            }
          });
      } catch (err) {
        console.error('Error in immediate subject removal:', err);
      }
    }
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
      
      // Log the subjects we're about to save
      console.log("Saving the following subjects during onboarding completion:", 
        subjectPrefs.map(p => `${p.subject} (${p.confidence})`).join(', '));
      
      // Create an array of promises for subject preferences
      const subjectPromises = subjectPrefs.map(subject => 
        supabase.from('student_subject_preferences').upsert({
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
        console.log(`Saving ${subjectPromises.length} subject preferences...`);
        const results = await Promise.allSettled(subjectPromises);
        
        // Log success/failure for each subject
        results.forEach((result, index) => {
          const subject = subjectPrefs[index].subject;
          if (result.status === 'fulfilled') {
            console.log(`Successfully saved subject: ${subject}`);
          } else {
            console.error(`Failed to save subject ${subject}:`, result.reason);
          }
        });
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
