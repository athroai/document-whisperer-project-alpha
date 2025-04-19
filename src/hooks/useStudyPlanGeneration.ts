
import { useState, useEffect } from 'react';
import { supabase, verifyAuth } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  calculateSessionsPerWeek, 
  generateDefaultStudySlots, 
  createCalendarEvents,
  createStudyPlan
} from '@/utils/studyPlanGenerationUtils';
import { PreferredStudySlot } from '@/types/study';

export const useStudyPlanGeneration = (userId: string | undefined, selectedSubjects: any[]) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [authVerified, setAuthVerified] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<Record<string, number>>({});
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const supabaseUser = await verifyAuth();
      if (supabaseUser) {
        setAuthVerified(true);
      } else {
        setAuthVerified(false);
        setError("Authentication error: You need to be signed in to generate a study plan.");
      }
    };

    if (userId) {
      checkAuth();
    }
  }, [userId]);

  useEffect(() => {
    const fetchDiagnosticResults = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('diagnostic_results')
          .select('subject_name, percentage_accuracy')
          .eq('student_id', userId);

        if (error) throw error;

        const resultsMap: Record<string, number> = {};
        data?.forEach(item => {
          resultsMap[item.subject_name] = item.percentage_accuracy;
        });

        setDiagnosticResults(resultsMap);
      } catch (error) {
        console.error('Error fetching diagnostic results:', error);
      }
    };

    fetchDiagnosticResults();
  }, [userId]);

  const generateStudyPlan = async (studySlots: PreferredStudySlot[]) => {
    setError(null);
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      if (!userId) {
        toast({
          title: "Authentication Required",
          description: "You need to be signed in to generate a study plan.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      if (!authVerified) {
        toast({
          title: "Authentication Error",
          description: "You're not properly authenticated. Please refresh the page or sign in again.",
          variant: "destructive"
        });
        setIsGenerating(false);
        setError("Authentication error with Supabase. Please refresh the page.");
        return;
      }

      setGenerationProgress(10);

      if (!selectedSubjects || selectedSubjects.length === 0) {
        setError("No subjects selected. Please go back to the subjects step and select at least one subject.");
        setIsGenerating(false);
        return;
      }

      let slotsToUse = studySlots;
      
      if (!slotsToUse || slotsToUse.length === 0) {
        console.log('No stored study slots found, generating default slots');
        slotsToUse = generateDefaultStudySlots(userId);
      }
      
      if (slotsToUse.length === 0) {
        setError("Could not generate study slots. Please try refreshing the page.");
        setIsGenerating(false);
        return;
      }

      setGenerationProgress(30);

      // Create study plan record
      const plan = await createStudyPlan(userId);
      const planId = plan.id;
      
      setGenerationProgress(50);

      const sessionDistribution = selectedSubjects.map(subject => {
        const score = diagnosticResults[subject.subject];
        const sessionsPerWeek = calculateSessionsPerWeek(score);
        
        return {
          subject: subject.subject,
          sessionsPerWeek,
          score: score
        };
      });

      // Create calendar events for the study plan
      const savedEvents = await createCalendarEvents(
        userId,
        planId,
        sessionDistribution,
        slotsToUse
      );

      setCalendarEvents(savedEvents);
      setStudyPlan(sessionDistribution);
      setIsGenerationComplete(true);
      setGenerationProgress(100);
      
      toast({
        title: "Study Plan Created",
        description: `Successfully scheduled ${savedEvents.length} study sessions.`,
      });

    } catch (error) {
      console.error('Error generating study plan:', error);
      setError(error instanceof Error ? error.message : "Failed to generate study plan");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate study plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    isGenerationComplete,
    studyPlan,
    calendarEvents,
    error,
    authVerified,
    generationProgress,
    generateStudyPlan
  };
};
