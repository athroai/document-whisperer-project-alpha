
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { PreferredStudySlot } from '@/types/study';

interface SubjectPreference {
  subject: string;
  confidence: number;
  priority?: number;
}

interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface OnboardingContextType {
  currentStep: string;
  selectedSubjects: SubjectPreference[];
  availability: Availability[];
  studySlots: PreferredStudySlot[];
  selectSubject: (subject: string, confidence: number) => void;
  removeSubject: (subject: string) => void;
  updateAvailability: (availability: Availability[]) => void;
  completeOnboarding: () => Promise<void>;
  updateOnboardingStep: (step: string) => void;
  setStudySlots: (slots: PreferredStudySlot[]) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  const [currentStep, setCurrentStep] = useState('subjects');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectPreference[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [studySlots, setStudySlots] = useState<PreferredStudySlot[]>([]);

  const updateOnboardingStep = useCallback((step: string) => {
    setCurrentStep(step);
    
    // If user is authenticated, also update in database
    if (state.user?.id) {
      supabase
        .from('onboarding_progress')
        .upsert({
          student_id: state.user.id,
          current_step: step
        }, {
          onConflict: 'student_id'
        })
        .then(({ error }) => {
          if (error) {
            console.error('Error updating onboarding step:', error);
          }
        });
    }
  }, [state.user]);

  // Fetch existing data when user is available
  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!state.user) return;
      
      try {
        console.log("Fetching onboarding data for user:", state.user.id);
        
        // Fetch subject preferences
        const { data: subjectPrefs } = await supabase
          .from('student_subject_preferences')
          .select('*')
          .eq('student_id', state.user.id);
          
        if (subjectPrefs && subjectPrefs.length > 0) {
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
          .eq('user_id', state.user.id);
          
        if (slotsError) {
          console.error("Error fetching study slots:", slotsError);
        } else if (studySlotsData && studySlotsData.length > 0) {
          console.log("Found study slots in context initialization:", studySlotsData);
          setStudySlots(studySlotsData);
        }
        
        // Fetch onboarding progress
        const { data: progress } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('student_id', state.user.id)
          .single();
          
        if (progress && progress.current_step) {
          setCurrentStep(progress.current_step);
        }
        
      } catch (err) {
        console.error('Error fetching onboarding data:', err);
      }
    };
    
    fetchOnboardingData();
  }, [state.user]);

  const selectSubject = useCallback((subject: string, confidence: number) => {
    setSelectedSubjects(prev => {
      const existingIndex = prev.findIndex(s => s.subject === subject);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { subject, confidence };
        return updated;
      }
      return [...prev, { subject, confidence }];
    });
  }, []);

  const removeSubject = useCallback((subject: string) => {
    setSelectedSubjects(prev => prev.filter(s => s.subject !== subject));
  }, []);

  const updateAvailability = useCallback((newAvailability: Availability[]) => {
    setAvailability(newAvailability);
  }, []);

  const completeOnboarding = async () => {
    if (!state.user) throw new Error('No user logged in');

    try {
      console.log("Completing onboarding for user:", state.user.id);
      
      // Save subject preferences
      const subjectPreferencesPromises = selectedSubjects.map(subject => 
        supabase.from('student_subject_preferences').upsert({
          student_id: state.user!.id,
          subject: subject.subject,
          confidence_level: subject.confidence,
          priority: subject.priority
        }, { onConflict: 'student_id, subject' })
      );

      // Update onboarding progress
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert({
          student_id: state.user!.id,
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

      await Promise.all(subjectPreferencesPromises);

      return;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  return (
    <OnboardingContext.Provider value={{
      currentStep,
      selectedSubjects,
      availability,
      studySlots,
      selectSubject,
      removeSubject,
      updateAvailability,
      completeOnboarding,
      updateOnboardingStep,
      setStudySlots
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
