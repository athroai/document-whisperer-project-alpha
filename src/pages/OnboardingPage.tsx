import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SubjectSelector } from '@/components/onboarding/core/SubjectSelector';
import { AvailabilitySettings } from '@/components/onboarding/core/AvailabilitySettings';
import { StudyPreferences } from '@/components/onboarding/core/StudyPreferences';
import { PlanGenerator } from '@/components/onboarding/core/PlanGenerator';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type OnboardingStep = 'subjects' | 'availability' | 'preferences' | 'generate';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRestarting = searchParams.get('restart') === 'true';
  const { toast } = useToast();
  const { state: authState } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('subjects');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  const [onboardingData, setOnboardingData] = useState({
    subjects: [] as {subject: string, confidence: 'low' | 'medium' | 'high'}[],
    availability: {
      days: [1, 2, 3, 4, 5] as number[],
      sessionsPerDay: 2,
      sessionDuration: 45,
    },
    preferences: {
      focusMode: 'pomodoro' as 'pomodoro' | 'continuous',
      preferredTime: 'afternoon' as 'morning' | 'afternoon' | 'evening',
      reviewFrequency: 'weekly' as 'daily' | 'weekly',
    }
  });

  const [generationComplete, setGenerationComplete] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!authState.user || authState.isLoading) return;

      try {
        if (isRestarting) {
          console.log('Restarting onboarding, skipping completion check');
          setInitialCheckDone(true);
          return;
        }

        if (localStorage.getItem('onboarding_completed') === 'true' && !isRestarting) {
          navigate('/calendar');
          return;
        }

        const { data } = await supabase
          .from('onboarding_progress')
          .select('completed_at')
          .eq('student_id', authState.user.id)
          .maybeSingle();

        if (data?.completed_at && !isRestarting) {
          localStorage.setItem('onboarding_completed', 'true');
          navigate('/calendar');
        }
        
        setInitialCheckDone(true);
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        setInitialCheckDone(true);
      }
    };

    checkOnboardingStatus();
  }, [authState.user, authState.isLoading, navigate, isRestarting]);

  useEffect(() => {
    if (isRestarting && authState.user && !authState.isLoading) {
      console.log('Clearing onboarding completion data for restart');
      localStorage.removeItem('onboarding_completed');
    }
  }, [isRestarting, authState.user, authState.isLoading]);

  function nextStep() {
    switch (currentStep) {
      case 'subjects':
        if (onboardingData.subjects.length === 0) {
          toast({
            title: "No subjects selected",
            description: "Please select at least one subject to continue.",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep('availability');
        break;
      case 'availability':
        setCurrentStep('preferences');
        break;
      case 'preferences':
        setCurrentStep('generate');
        break;
      default:
        break;
    }
  }

  function prevStep() {
    switch (currentStep) {
      case 'availability':
        setCurrentStep('subjects');
        break;
      case 'preferences':
        setCurrentStep('availability');
        break;
      case 'generate':
        setCurrentStep('preferences');
        break;
      default:
        break;
    }
  }

  function updateSubjects(subjects: {subject: string, confidence: 'low' | 'medium' | 'high'}[]) {
    setOnboardingData(prev => ({
      ...prev,
      subjects
    }));
  }

  function updateAvailability(availability: typeof onboardingData.availability) {
    setOnboardingData(prev => ({
      ...prev,
      availability
    }));
  }

  function updatePreferences(preferences: typeof onboardingData.preferences) {
    setOnboardingData(prev => ({
      ...prev,
      preferences
    }));
  }

  async function completeOnboarding() {
    if (!authState.user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your study plan.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setGenerationProgress(10);

    try {
      setGenerationProgress(20);
      const subjectPromises = onboardingData.subjects.map(subject =>
        supabase.from('student_subject_preferences').upsert({
          student_id: authState.user!.id,
          subject: subject.subject,
          confidence_level: subject.confidence
        })
      );
      await Promise.all(subjectPromises);

      setGenerationProgress(40);

      let studySlotsData = [];
      try {
        const { data, error } = await supabase
          .from('preferred_study_slots')
          .select('*')
          .eq('user_id', authState.user.id);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          studySlotsData = data;
          console.log(`Found ${data.length} saved study slots`);
        } else {
          console.log('No study slots found in database, checking local storage');
          if (localStorage.getItem('athro_study_slots')) {
            studySlotsData = JSON.parse(localStorage.getItem('athro_study_slots') || '[]');
          }
        }
      } catch (err) {
        console.error('Error fetching study slots:', err);
        if (localStorage.getItem('athro_study_slots')) {
          studySlotsData = JSON.parse(localStorage.getItem('athro_study_slots') || '[]');
        }
      }

      if (studySlotsData.length === 0) {
        toast({
          title: "No study schedule found",
          description: "You must set up your custom study sessions before generating a plan.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      setGenerationProgress(60);

      const calendarEvents = [];
      const today = new Date();

      for (let slot of studySlotsData) {
        let slotDay = slot.day_of_week;
        let nowDay = today.getDay() || 7;
        let daysUntil = slotDay - nowDay;
        if (daysUntil <= 0) daysUntil += 7;

        let sessionDate = new Date(today);
        sessionDate.setDate(today.getDate() + daysUntil);

        let startTime = new Date(sessionDate);
        startTime.setHours(slot.preferred_start_hour, 0, 0, 0);
        
        let endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + slot.slot_duration_minutes);

        const subjIndex = calendarEvents.length % onboardingData.subjects.length;
        const subjectObj = onboardingData.subjects[subjIndex];

        calendarEvents.push({
          title: `${subjectObj.subject} Study Session`,
          description: JSON.stringify({
            subject: subjectObj.subject,
            isPomodoro: onboardingData.preferences.focusMode === 'pomodoro',
            pomodoroWorkMinutes: 25,
            pomodoroBreakMinutes: 5
          }),
          event_type: 'study_session',
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          user_id: authState.user.id,
          student_id: authState.user.id
        });
      }

      setGenerationProgress(80);

      if (calendarEvents.length > 0) {
        try {
          const { data, error } = await supabase
            .from('calendar_events')
            .insert(calendarEvents)
            .select();
          
          if (error) {
            console.error('Error creating calendar events:', error);
            throw new Error(`Failed to create calendar events: ${error.message}`);
          }
          
          console.log(`Successfully created ${data?.length || 0} calendar events`);
        } catch (insertError) {
          console.error('Error inserting calendar events:', insertError);
        }
      }

      setGenerationProgress(95);

      try {
        await supabase
          .from('onboarding_progress')
          .upsert({
            student_id: authState.user.id,
            current_step: 'completed',
            has_completed_subjects: true,
            has_completed_availability: true,
            has_generated_plan: true,
            completed_at: new Date().toISOString()
          });

        localStorage.setItem('onboarding_completed', 'true');
      } catch (progressError) {
        console.error('Error updating onboarding progress:', progressError);
      }

      setGenerationProgress(100);
      setGenerationComplete(true);

      toast({
        title: "Study Plan Created!",
        description: `${calendarEvents.length} study sessions added to your calendar.`
      });

    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: `Failed to complete setup: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToCalendar() {
    navigate('/calendar?fromSetup=true&refresh=true');
  }

  function renderStep() {
    switch (currentStep) {
      case 'subjects':
        return (
          <SubjectSelector 
            subjects={onboardingData.subjects}
            updateSubjects={updateSubjects}
          />
        );
      case 'availability':
        return (
          <AvailabilitySettings
            availability={onboardingData.availability}
            updateAvailability={updateAvailability}
          />
        );
      case 'preferences':
        return (
          <StudyPreferences
            preferences={onboardingData.preferences}
            updatePreferences={updatePreferences}
          />
        );
      case 'generate':
        return (
          <PlanGenerator
            onboardingData={onboardingData}
            completeOnboarding={completeOnboarding}
            generationComplete={generationComplete}
            generationProgress={generationProgress}
            isSubmitting={isSubmitting}
            goToCalendar={goToCalendar}
          />
        );
      default:
        return null;
    }
  }

  function getProgressPercentage() {
    switch (currentStep) {
      case 'subjects': return 25;
      case 'availability': return 50;
      case 'preferences': return 75;
      case 'generate': return generationComplete ? 100 : 90;
      default: return 0;
    }
  }

  if (authState.isLoading || (!initialCheckDone && !isRestarting)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-lg">Checking onboarding status...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Setup Your Study Plan</h1>
        
        <div className="mt-8 mb-6">
          <div className="flex justify-between mb-2 text-sm">
            <span className={currentStep === 'subjects' ? 'font-bold text-purple-700' : ''}>Subjects</span>
            <span className={currentStep === 'availability' ? 'font-bold text-purple-700' : ''}>Schedule</span>
            <span className={currentStep === 'preferences' ? 'font-bold text-purple-700' : ''}>Preferences</span>
            <span className={currentStep === 'generate' ? 'font-bold text-purple-700' : ''}>Create Plan</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {renderStep()}
      </div>

      {currentStep !== 'generate' && (
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 'subjects'}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={nextStep}
            disabled={currentStep === 'subjects' && onboardingData.subjects.length === 0}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
