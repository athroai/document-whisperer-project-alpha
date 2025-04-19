
import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useOnboardingState } from './onboarding/useOnboardingState';
import { createOnboardingActions } from './onboarding/onboardingActions';
import { OnboardingContextType, LearningStylePreference } from './onboarding/types';

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
    learningStyle,
    setLearningStyle,
  } = useOnboardingState(state.user?.id);

  const actions = createOnboardingActions(
    state.user?.id,
    setSelectedSubjects,
    setAvailability,
    setStudySlots,
    setLearningPreferences,
    setLearningStyle,
    setCurrentStep,
  );

  return (
    <OnboardingContext.Provider value={{
      currentStep,
      selectedSubjects,
      availability,
      studySlots,
      learningPreferences,
      learningStyle,
      setStudySlots,
      updateLearningStyle: setLearningStyle,
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
