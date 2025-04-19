
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SubjectPreference, Availability } from './types';
import { PreferredStudySlot } from '@/types/study';
import { ConfidenceLabel } from '@/types/confidence';

export const useOnboardingState = (userId: string | undefined) => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectPreference[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [studySlots, setStudySlots] = useState<PreferredStudySlot[]>([]);
  const [learningPreferences, setLearningPreferences] = useState<Record<string, any>>({});

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
            confidence: pref.confidence_level,
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
  };
};
