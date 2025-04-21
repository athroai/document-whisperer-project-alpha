
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { toast } = useToast();
  const { state: authState } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('subjects');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Combined state for the entire onboarding process
  const [onboardingData, setOnboardingData] = useState({
    subjects: [] as {subject: string, confidence: 'low' | 'medium' | 'high'}[],
    availability: {
      days: [1, 2, 3, 4, 5] as number[], // Default to weekdays
      sessionsPerDay: 2,
      sessionDuration: 45, // in minutes
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

  // Check if the user has completed onboarding before
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!authState.user || authState.isLoading) return;

      try {
        // First check local storage for a quick decision
        if (localStorage.getItem('onboarding_completed') === 'true') {
          navigate('/calendar');
          return;
        }

        // Then verify with the database
        const { data } = await supabase
          .from('onboarding_progress')
          .select('completed_at')
          .eq('student_id', authState.user.id)
          .maybeSingle();

        if (data?.completed_at) {
          // If database says completed but localStorage disagrees, update localStorage
          localStorage.setItem('onboarding_completed', 'true');
          navigate('/calendar');
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      }
    };

    checkOnboardingStatus();
  }, [authState.user, authState.isLoading, navigate]);

  // Step navigation
  const nextStep = () => {
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
  };

  const prevStep = () => {
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
  };

  // Update onboarding data
  const updateSubjects = (subjects: {subject: string, confidence: 'low' | 'medium' | 'high'}[]) => {
    setOnboardingData(prev => ({
      ...prev,
      subjects
    }));
  };

  const updateAvailability = (availability: typeof onboardingData.availability) => {
    setOnboardingData(prev => ({
      ...prev,
      availability
    }));
  };

  const updatePreferences = (preferences: typeof onboardingData.preferences) => {
    setOnboardingData(prev => ({
      ...prev,
      preferences
    }));
  };

  // Complete onboarding
  const completeOnboarding = async () => {
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
      // 1. Save subject preferences to database
      setGenerationProgress(20);
      const subjectPromises = onboardingData.subjects.map(subject => 
        supabase.from('student_subject_preferences').upsert({
          student_id: authState.user!.id,
          subject: subject.subject,
          confidence_level: subject.confidence
        })
      );
      await Promise.all(subjectPromises);
      
      // 2. Save study slots
      setGenerationProgress(40);
      
      // Clear existing slots first
      await supabase
        .from('preferred_study_slots')
        .delete()
        .eq('user_id', authState.user.id);
      
      // Create study slots based on availability settings
      const studySlotsToInsert = onboardingData.availability.days.flatMap(day => {
        const slots = [];
        
        // Calculate start hours based on preferred time
        let baseStartHour = 15; // default to afternoon (3pm)
        if (onboardingData.preferences.preferredTime === 'morning') baseStartHour = 9;
        if (onboardingData.preferences.preferredTime === 'evening') baseStartHour = 18;
        
        // Create slots for each session per day
        for (let i = 0; i < onboardingData.availability.sessionsPerDay; i++) {
          slots.push({
            user_id: authState.user!.id,
            day_of_week: day,
            slot_count: 1,
            slot_duration_minutes: onboardingData.availability.sessionDuration,
            preferred_start_hour: baseStartHour + i
          });
        }
        
        return slots;
      });
      
      if (studySlotsToInsert.length > 0) {
        await supabase.from('preferred_study_slots').insert(studySlotsToInsert);
      }
      
      // 3. Generate calendar events
      setGenerationProgress(60);
      
      // Create a study plan
      const { data: planData, error: planError } = await supabase
        .from('study_plans')
        .insert({
          name: "Personalized Study Plan",
          student_id: authState.user.id,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .select()
        .single();
        
      if (planError) throw planError;
      
      // Store plan ID for reference
      setPlanId(planData.id);
      
      // 4. Create calendar events from study slots and subjects
      setGenerationProgress(80);
      
      // Generate the next 2 weeks of study sessions
      const calendarEvents = [];
      const today = new Date();
      
      // Match subjects to days with round-robin distribution
      for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
        const date = new Date(today);
        date.setDate(date.getDate() + dayOffset);
        const dayOfWeek = date.getDay() || 7; // Convert Sunday from 0 to 7
        
        // Check if this day is in our selected days
        if (onboardingData.availability.days.includes(dayOfWeek)) {
          // Determine which subjects to study on this day
          // We'll rotate through all subjects to ensure coverage
          const subjectsForDay = onboardingData.subjects.filter(
            (_, i) => i % 7 === (dayOffset % 7)
          );
          
          // For each subject that falls on this day, create a session
          for (let sessionIndex = 0; sessionIndex < Math.min(subjectsForDay.length, onboardingData.availability.sessionsPerDay); sessionIndex++) {
            const subject = subjectsForDay[sessionIndex];
            
            // Calculate start time based on preferences and session index
            let baseStartHour = 15; // default to afternoon
            if (onboardingData.preferences.preferredTime === 'morning') baseStartHour = 9;
            if (onboardingData.preferences.preferredTime === 'evening') baseStartHour = 18;
            
            const startHour = baseStartHour + sessionIndex;
            
            // Create start and end times
            const startTime = new Date(date);
            startTime.setHours(startHour, 0, 0, 0);
            
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + onboardingData.availability.sessionDuration);
            
            // Prepare event for insertion
            const eventData = {
              title: `${subject.subject} Study Session`,
              description: JSON.stringify({
                subject: subject.subject,
                isPomodoro: onboardingData.preferences.focusMode === 'pomodoro',
                pomodoroWorkMinutes: 25,
                pomodoroBreakMinutes: 5
              }),
              event_type: 'study_session',
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              user_id: authState.user.id,
              student_id: authState.user.id
            };
            
            calendarEvents.push(eventData);
          }
        }
      }
      
      // Insert all calendar events
      if (calendarEvents.length > 0) {
        await supabase.from('calendar_events').insert(calendarEvents);
      }
      
      // 5. Mark onboarding as complete
      setGenerationProgress(95);
      
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
        
      // Set local flag to avoid redirect loops
      localStorage.setItem('onboarding_completed', 'true');
      
      setGenerationProgress(100);
      setGenerationComplete(true);
      
      // Success message
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
  };
  
  // Go to calendar after completion
  const goToCalendar = () => {
    navigate('/calendar?fromSetup=true');
  };

  // Render current step
  const renderStep = () => {
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
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    switch (currentStep) {
      case 'subjects': return 25;
      case 'availability': return 50;
      case 'preferences': return 75;
      case 'generate': return generationComplete ? 100 : 90;
      default: return 0;
    }
  };

  if (authState.isLoading) {
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
        
        {/* Progress indicator */}
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

      {/* Current step content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {renderStep()}
      </div>

      {/* Navigation buttons */}
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
