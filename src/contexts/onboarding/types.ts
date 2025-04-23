
import { ConfidenceLabel } from '@/types/confidence';
import { PreferredStudySlot } from '@/types/study';

export interface SubjectPreference {
  subject: string;
  confidence: ConfidenceLabel;
  priority?: number;
}

export interface Availability {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
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
  updateLearningPreferences: (preferences: Record<string, any>) => void;
  completeOnboarding: () => Promise<void>;
  updateOnboardingStep: (step: string) => Promise<void>;
  updateStudySlots: (params: {
    dayOfWeek: number,
    slotCount: number,
    slotDurationMinutes: number,
    preferredStartHour: number
  }) => Promise<void>;
  setStudySlots: (slots: PreferredStudySlot[]) => void;
  setSelectedSubjects: (subjects: SubjectPreference[]) => void;
}
