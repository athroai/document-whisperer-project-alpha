import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SubjectPreference, Availability, PreferredStudySlot } from '@/types/study';
import { ConfidenceLabel } from "@/types/confidence";

export const useOnboardingState = (userId: string | undefined) => {
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectPreference[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [studySlots, setStudySlots] = useState<PreferredStudySlot[]>([]);
  const [learningPreferences, setLearningPreferences] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!userId) return;
      
      try {
        console.log("Fetching onboarding data for user:", userId);
        
        // Fetch subject preferences
        const { data: subjectPrefs, error: subjectError } = await supabase
          .from('student_subject_preferences')
          .select('*')
          .eq('student_id', userId);
          
        if (subjectError) {
          console.error("Error fetching subject preferences:", subjectError);
        } else if (subjectPrefs && subjectPrefs.length > 0) {
          console.log("Found subject preferences:", subjectPrefs);
          const formattedSubjects = subjectPrefs.map(pref => ({
            subject: pref.subject,
            confidence: pref.confidence_level,
            priority: pref.priority
          }));
          setSelectedSubjects(formattedSubjects);
        }
        
        // Fetch study slots
        const { data: studySlotsData, error: slotsError } = await supabase
          .from('preferred_study_slots')
          .select('*')
          .eq('user_id', userId);
          
        if (slotsError) {
          console.error("Error fetching study slots:", slotsError);
        } else if (studySlotsData && studySlotsData.length > 0) {
          console.log("Found study slots:", studySlotsData);
          setStudySlots(studySlotsData);
        }
        
        // Fetch onboarding progress
        const { data: progress, error: progressError } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('student_id', userId)
          .maybeSingle();
          
        if (progressError && progressError.code !== 'PGRST116') {
          console.error("Error fetching onboarding progress:", progressError);
        } else if (progress && progress.current_step) {
          console.log("Found onboarding progress, current step:", progress.current_step);
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
