
import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useOnboardingState } from './onboarding/useOnboardingState';
import { createOnboardingActions } from './onboarding/onboardingActions';
import { OnboardingContextType } from './onboarding/types';

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  const {
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
  } = useOnboardingState(state.user?.id);

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
      ...actions
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
