
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
  updateAvailability: (availability: Availability[]) => void;
  completeOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  const [currentStep, setCurrentStep] = useState('subjects');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectPreference[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);

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

  const updateAvailability = useCallback((newAvailability: Availability[]) => {
    setAvailability(newAvailability);
  }, []);

  const completeOnboarding = async () => {
    if (!state.user) throw new Error('No user logged in');

    // Insert subject preferences
    const subjectPreferencesPromises = selectedSubjects.map(subject => 
      supabase.from('student_subject_preferences').insert({
        student_id: state.user!.id,
        subject: subject.subject,
        confidence_level: subject.confidence,
        priority: subject.priority
      })
    );

    // Insert availability
    const availabilityPromises = availability.map(slot => 
      supabase.from('student_availability').insert({
        student_id: state.user!.id,
        day_of_week: slot.dayOfWeek,
        start_time: slot.startTime,
        end_time: slot.endTime
      })
    );

    // Update onboarding progress
    const onboardingProgressPromise = supabase.from('onboarding_progress').insert({
      student_id: state.user!.id,
      current_step: 'completed',
      has_completed_subjects: true,
      has_completed_availability: true,
      completed_at: new Date().toISOString()
    });

    await Promise.all([
      ...subjectPreferencesPromises, 
      ...availabilityPromises, 
      onboardingProgressPromise
    ]);
  };

  return (
    <OnboardingContext.Provider value={{
      currentStep,
      selectedSubjects,
      availability,
      selectSubject,
      updateAvailability,
      completeOnboarding
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
