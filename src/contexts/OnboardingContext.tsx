
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { PreferredStudySlot } from '@/types/study';
import { ConfidenceLabel } from '@/types/confidence';

interface SubjectPreference {
  subject: string;
  confidence: ConfidenceLabel;
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
  learningPreferences: Record<string, any>;
  selectSubject: (subject: string, confidence: ConfidenceLabel) => void;
  removeSubject: (subject: string) => void;
  updateAvailability: (availability: Availability[]) => void;
  completeOnboarding: () => Promise<void>;
  updateOnboardingStep: (step: string) => void;
  setStudySlots: (slots: PreferredStudySlot[]) => void;
  updateStudySlots: (slot: { dayOfWeek: number, slotCount: number, slotDurationMinutes: number, preferredStartHour: number }) => void;
  updateLearningPreferences: (preferences: Record<string, any>) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  const [currentStep, setCurrentStep] = useState('welcome'); // Start with welcome step
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectPreference[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [studySlots, setStudySlots] = useState<PreferredStudySlot[]>([]);
  const [learningPreferences, setLearningPreferences] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchOnboardingStep = async () => {
      if (!state.user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('onboarding_progress')
          .select('current_step')
          .eq('student_id', state.user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching onboarding step:', error);
          return;
        }
        
        if (data && data.current_step) {
          setCurrentStep(data.current_step);
        }
      } catch (err) {
        console.error('Error in fetchOnboardingStep:', err);
      }
    };
    
    fetchOnboardingStep();
  }, [state.user]);
  
  const updateOnboardingStep = useCallback(async (step: string) => {
    console.log('Updating onboarding step to:', step);
    setCurrentStep(step);
    
    if (state.user?.id) {
      try {
        const { error } = await supabase
          .from('onboarding_progress')
          .upsert({ 
            student_id: state.user.id, 
            current_step: step 
          }, { 
            onConflict: 'student_id' 
          });
            
        if (error) {
          console.error('Error updating onboarding step:', error);
        }
      } catch (error) {
        console.error('Error in updateOnboardingStep:', error);
      }
    }
  }, [state.user]);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!state.user) return;
      
      try {
        console.log("Fetching onboarding data for user:", state.user.id);
        
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
        
        const { data: progress } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('student_id', state.user.id)
          .maybeSingle();
          
        if (progress && progress.current_step) {
          setCurrentStep(progress.current_step);
        }
        
      } catch (err) {
        console.error('Error fetching onboarding data:', err);
      }
    };
    
    fetchOnboardingData();
  }, [state.user]);

  const selectSubject = useCallback((subject: string, confidence: ConfidenceLabel) => {
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

  const updateLearningPreferences = useCallback((preferences: Record<string, any>) => {
    setLearningPreferences(prev => ({
      ...prev,
      ...preferences
    }));
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

      // Mark onboarding as complete
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

      // Wait for all subject preferences to be saved
      await Promise.all(subjectPreferencesPromises);

      // Update local step state to completed
      setCurrentStep('completed');

      return;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const updateStudySlots = useCallback(({ dayOfWeek, slotCount, slotDurationMinutes, preferredStartHour }: {
    dayOfWeek: number,
    slotCount: number,
    slotDurationMinutes: number,
    preferredStartHour: number
  }) => {
    if (!state.user?.id) return;
    
    const newSlot = {
      id: `temp-${Date.now()}`,
      user_id: state.user.id,
      day_of_week: dayOfWeek,
      slot_count: slotCount,
      slot_duration_minutes: slotDurationMinutes,
      preferred_start_hour: preferredStartHour,
      created_at: new Date().toISOString()
    };
    
    setStudySlots(prev => [...prev, newSlot]);
    
    if (state.user?.id) {
      try {
        supabase
          .from('preferred_study_slots')
          .insert({
            user_id: state.user.id,
            day_of_week: dayOfWeek,
            slot_count: slotCount,
            slot_duration_minutes: slotDurationMinutes,
            preferred_start_hour: preferredStartHour
          })
          .then(({ error }) => {
            if (error) {
              console.error('Error adding study slot:', error);
            }
          });
      } catch (error) {
        console.error('Error in updateStudySlots:', error);
      }
    }
  }, [state.user, setStudySlots]);

  return (
    <OnboardingContext.Provider value={{
      currentStep,
      selectedSubjects,
      availability,
      studySlots,
      learningPreferences,
      selectSubject,
      removeSubject,
      updateAvailability,
      completeOnboarding,
      updateOnboardingStep,
      setStudySlots,
      updateStudySlots,
      updateLearningPreferences
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
