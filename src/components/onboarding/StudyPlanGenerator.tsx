
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PreferredStudySlot } from '@/types/study';
import { generateDefaultStudySlots } from '@/utils/studyPlanGenerationUtils';
import { supabase } from '@/lib/supabase';
import { AuthVerification } from './study-plan/AuthVerification';
import { GenerationProgress } from './study-plan/GenerationProgress';
import { StudyPlanInfo } from './study-plan/StudyPlanInfo';
import { StudyPlanResults } from './study-plan/StudyPlanResults';
import { useStudyPlanGeneration } from '@/hooks/useStudyPlanGeneration';
import { useNavigate } from 'react-router-dom';

export const StudyPlanGenerator: React.FC = () => {
  const { state } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { selectedSubjects, completeOnboarding, studySlots } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localStudySlots, setLocalStudySlots] = useState<PreferredStudySlot[]>([]);
  
  const {
    isGenerating,
    isGenerationComplete,
    studyPlan,
    calendarEvents,
    error,
    authVerified,
    generationProgress,
    generateStudyPlan
  } = useStudyPlanGeneration(state.user?.id, selectedSubjects);

  useEffect(() => {
    if (studySlots && studySlots.length > 0) {
      console.log('Using study slots from context:', studySlots);
      setLocalStudySlots(studySlots);
      return;
    }
    
    const fetchStudySlots = async () => {
      if (!state.user) return;
      
      try {
        const { data, error } = await supabase
          .from('preferred_study_slots')
          .select('*')
          .eq('user_id', state.user.id);
          
        if (error) {
          console.error('Error fetching study slots:', error);
          return;
        }
        
        if (data && data.length > 0) {
          console.log('Found study slots from database:', data);
          setLocalStudySlots(data);
        } else {
          console.warn('No study slots found in database for user:', state.user.id);
          
          // Generate default slots if none found
          if (state.user) {
            const defaultSlots = generateDefaultStudySlots(state.user.id);
            setLocalStudySlots(defaultSlots);
          }
        }
      } catch (err) {
        console.error('Exception when fetching study slots:', err);
      }
    };
    
    if (state.user) {
      fetchStudySlots();
    }
  }, [state.user, studySlots]);

  const handleGenerateStudyPlan = async () => {
    console.log("Generating study plan with slots:", localStudySlots);
    await generateStudyPlan(localStudySlots);
  };

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);

      // Save to database if user exists
      if (state.user) {
        await completeOnboarding();

        // Ensure onboarding_completed flag is set; this guards against localStorage being out of sync
        localStorage.setItem('onboarding_completed', 'true');
      }

      toast({
        title: "Success",
        description: "Your study plan has been created successfully!",
      });

      // Wait briefly for Supabase propagation if needed
      setTimeout(() => {
        // Now navigate to calendar
        navigate('/calendar?fromSetup=true');
      }, 500);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <AuthVerification 
        isAuthenticated={!!state.user} 
        isLoading={state.isLoading} 
        authVerified={authVerified}
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isGenerating && (
        <GenerationProgress progress={generationProgress} />
      )}
      
      {!isGenerationComplete && !isGenerating ? (
        <StudyPlanInfo 
          onGenerate={handleGenerateStudyPlan}
          isGenerating={isGenerating}
          disabled={!state.user || state.isLoading || selectedSubjects.length === 0 || !authVerified}
        />
      ) : null}
      
      {isGenerationComplete && calendarEvents.length > 0 && (
        <StudyPlanResults 
          studyPlan={studyPlan}
          calendarEvents={calendarEvents}
          onComplete={handleComplete}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
