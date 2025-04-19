
import { PreferredStudySlot } from '@/types/study';
import { ConfidenceLabel } from '@/types/confidence';

export interface SubjectPreference {
  subject: string;
  confidence: ConfidenceLabel;
  priority?: number;
}

export interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface OnboardingContextType {
  currentStep: string;
  selectedSubjects: SubjectPreference[];
  availability: Availability[];
  studySlots: PreferredStudySlot[];
  learningPreferences: Record<string, any>;
  selectSubject: (subject: string, confidence: ConfidenceLabel) => void;
  removeSubject: (subject: string) => void;
  updateAvailability: (availability: Availability[]) => void;
  completeOnboarding: () => Promise<void>;
  updateOnboardingStep: (step: string) => void;
  setStudySlots: (slots: PreferredStudySlot[]) => void;
  updateStudySlots: (slot: { 
    dayOfWeek: number, 
    slotCount: number, 
    slotDurationMinutes: number, 
    preferredStartHour: number 
  }) => void;
  updateLearningPreferences: (preferences: Record<string, any>) => void;
}
