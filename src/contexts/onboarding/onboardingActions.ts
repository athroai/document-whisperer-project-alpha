
import { supabase } from '@/lib/supabase';
import { SubjectPreference, Availability, LearningStylePreference } from './types';
import { PreferredStudySlot } from '@/types/study';
import { ConfidenceLabel } from '@/types/confidence';

export const createOnboardingActions = (
  userId: string | undefined,
  setSelectedSubjects: React.Dispatch<React.SetStateAction<SubjectPreference[]>>,
  setAvailability: React.Dispatch<React.SetStateAction<Availability[]>>,
  setStudySlots: React.Dispatch<React.SetStateAction<PreferredStudySlot[]>>,
  setLearningPreferences: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  setLearningStyle: React.Dispatch<React.SetStateAction<LearningStylePreference | undefined>>,
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>,
) => ({
  selectSubject: (subject: string, confidence: ConfidenceLabel) => {
    setSelectedSubjects(prev => {
      const existingIndex = prev.findIndex(s => s.subject === subject);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], subject, confidence };
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
  
  updateLearningStyle: (style: LearningStylePreference) => {
    setLearningStyle(style);
    
    // Save to database if user ID exists
    if (userId) {
      supabase.from('learning_preferences').upsert({
        user_id: userId,
        visual_score: style.visual,
        auditory_score: style.auditory,
        reading_score: style.reading,
        kinesthetic_score: style.kinesthetic,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' }).then(({ error }) => {
        if (error) {
          console.error('Error saving learning style:', error);
        }
      });
    }
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
        supabase.from('student_subject_preferences').upsert({
          student_id: userId,
          subject: subject.subject,
          confidence_level: subject.confidence,
          priority: subject.priority
        }, { onConflict: 'student_id, subject' })
      );

      // Get current learning style
      let currentLearningStyle: LearningStylePreference | undefined;
      setLearningStyle(prev => {
        currentLearningStyle = prev;
        return prev;
      });

      // Save learning style if available
      if (currentLearningStyle) {
        await supabase.from('learning_preferences').upsert({
          user_id: userId,
          visual_score: currentLearningStyle.visual,
          auditory_score: currentLearningStyle.auditory,
          reading_score: currentLearningStyle.reading,
          kinesthetic_score: currentLearningStyle.kinesthetic,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }

      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          student_id: userId,
          current_step: 'completed',
          has_completed_subjects: true,
          has_completed_availability: true,
          has_generated_plan: true,
          has_completed_diagnostic: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'student_id'
        });

      if (error) throw error;

      // Execute all subject preference updates in parallel
      if (subjectPromises.length > 0) {
        await Promise.all(subjectPromises);
      }
      
      setCurrentStep('completed');

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
        const { error } = await supabase
          .from('onboarding_progress')
          .upsert({ 
            student_id: userId, 
            current_step: step 
          }, { 
            onConflict: 'student_id' 
          });
            
        if (error) {
          console.error('Error updating onboarding step:', error);
        }
      } catch (error) {
        console.error('Error in updateOnboardingStep:', error);
      }
    }
  },
});
