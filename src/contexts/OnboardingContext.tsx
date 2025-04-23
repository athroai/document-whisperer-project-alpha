
import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useOnboardingState } from './onboarding/useOnboardingState';
import { createOnboardingActions } from './onboarding/onboardingActions';
import { SubjectPreference, Availability, PreferredStudySlot } from '@/types/study';
import { ConfidenceLabel } from '@/types/study';

export interface OnboardingContextType {
  currentStep: string;
  selectedSubjects: SubjectPreference[];
  availability: Availability[];
  studySlots: PreferredStudySlot[];
  learningPreferences: Record<string, any>;
  selectSubject: (subject: string, confidence: ConfidenceLabel) => void;
  removeSubject: (subject: string) => void;
  updateAvailability: (availability: Availability[]) => void;
  updateLearningPreferences: (preferences: Record<string, any>) => void;
  completeOnboarding: () => Promise<void>;
  updateOnboardingStep: (step: string) => Promise<void>;
  updateStudySlots: (params: {
    dayOfWeek: number,
    slotCount: number,
    slotDurationMinutes: number,
    preferredStartHour: number,
    subject: string  
  }) => Promise<void>;
  setStudySlots: (slots: PreferredStudySlot[]) => void;
  setSelectedSubjects: (subjects: SubjectPreference[]) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  
  // Use the imported onboarding state hook
  const {
    currentStep, setCurrentStep,
    selectedSubjects, setSelectedSubjects,
    availability, setAvailability,
    studySlots, setStudySlots,
    learningPreferences, setLearningPreferences
  } = useOnboardingState(state.user?.id);

  // Use the imported actions creator
  const actions = createOnboardingActions(
    state.user?.id,
    setSelectedSubjects,
    setAvailability,
    setStudySlots,
    setLearningPreferences,
    setCurrentStep,
  );

  return (
    <OnboardingContext.Provider value={{
      currentStep,
      selectedSubjects,
      availability,
      studySlots,
      learningPreferences,
      setStudySlots,
      setSelectedSubjects,
      ...actions
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
