
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SubjectPreference, Availability, LearningStylePreference } from './types';
import { PreferredStudySlot } from '@/types/study';
import { ConfidenceLabel } from '@/types/confidence';

export const useOnboardingState = (userId: string | undefined) => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectPreference[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [studySlots, setStudySlots] = useState<PreferredStudySlot[]>([]);
  const [learningPreferences, setLearningPreferences] = useState<Record<string, any>>({});
  const [learningStyle, setLearningStyle] = useState<LearningStylePreference | undefined>();

  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!userId) return;
      
      try {
        console.log("Fetching onboarding data for user:", userId);
        
        const { data: subjectPrefs } = await supabase
          .from('student_subject_preferences')
          .select('*')
          .eq('student_id', userId);
          
        if (subjectPrefs && subjectPrefs.length > 0) {
          const formattedSubjects = subjectPrefs.map(pref => ({
            subject: pref.subject,
            confidence: pref.confidence_level as ConfidenceLabel,
            priority: pref.priority
          }));
          setSelectedSubjects(formattedSubjects);
        }
        
        const { data: studySlotsData, error: slotsError } = await supabase
          .from('preferred_study_slots')
          .select('*')
          .eq('user_id', userId);
          
        if (slotsError) {
          console.error("Error fetching study slots:", slotsError);
        } else if (studySlotsData && studySlotsData.length > 0) {
          console.log("Found study slots in context initialization:", studySlotsData);
          setStudySlots(studySlotsData);
        }
        
        // Fetch learning style preferences if available
        const { data: learningStyleData } = await supabase
          .from('learning_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (learningStyleData) {
          setLearningStyle({
            visual: learningStyleData.visual_score || 0,
            auditory: learningStyleData.auditory_score || 0,
            reading: learningStyleData.reading_score || 0,
            kinesthetic: learningStyleData.kinesthetic_score || 0
          });
          
          setLearningPreferences({
            ...learningPreferences,
            preferredTimeOfDay: learningStyleData.preferred_time_of_day,
            preferredEnvironment: learningStyleData.preferred_environment
          });
        }
        
        const { data: progress } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('student_id', userId)
          .maybeSingle();
          
        if (progress && progress.current_step) {
          setCurrentStep(progress.current_step);
        }
      } catch (err) {
        console.error('Error fetching onboarding data:', err);
      }
    };
    
    fetchOnboardingData();
  }, [userId]);

  return {
    currentStep,
    setCurrentStep,
    selectedSubjects,
    setSelectedSubjects,
    availability,
    setAvailability,
    studySlots,
    setStudySlots,
    learningPreferences,
    setLearningPreferences,
    learningStyle,
    setLearningStyle,
  };
};
