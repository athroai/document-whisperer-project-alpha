
import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

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
  selectSubject: (subject: string, confidence: number) => void;
  removeSubject: (subject: string) => void;
  updateAvailability: (availability: Availability[]) => void;
  completeOnboarding: () => Promise<void>;
  updateOnboardingStep: (step: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  const [currentStep, setCurrentStep] = useState('subjects');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectPreference[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);

  const updateOnboardingStep = useCallback((step: string) => {
    setCurrentStep(step);
  }, []);

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
      // Save subject preferences
      const subjectPreferencesPromises = selectedSubjects.map(subject => 
        supabase.from('student_subject_preferences').insert({
          student_id: state.user!.id,
          subject: subject.subject,
          confidence_level: subject.confidence,
          priority: subject.priority
        })
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
      selectSubject,
      removeSubject,
      updateAvailability,
      completeOnboarding,
      updateOnboardingStep
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
