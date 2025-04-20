
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { motion } from 'framer-motion';
import { PlanGenerationStep } from './PlanGenerationStep';
import { StudyPlanResults } from './StudyPlanResults';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { generateDefaultStudySlots } from '@/utils/studyPlanUtils';
import { supabase } from '@/lib/supabase';
import { ConfidenceLabel } from '@/types/confidence';

export const StudyPlanContainer: React.FC = () => {
  const { selectedSubjects, completeOnboarding, updateOnboardingStep, studySlots } = useOnboarding();
  const { state } = useAuth();
  const navigate = useNavigate();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [createdCalendarEvents, setCreatedCalendarEvents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cleanupExistingPlan = async (userId: string) => {
    try {
      // Delete any existing study plan sessions
      const { data: existingPlan } = await supabase
        .from('study_plans')
        .select('id')
        .eq('student_id', userId)
        .eq('is_active', true)
        .single();

      if (existingPlan) {
        // Delete associated calendar events
        const { data: planSessions } = await supabase
          .from('study_plan_sessions')
          .select('calendar_event_id')
          .eq('plan_id', existingPlan.id);
          
        if (planSessions) {
          const eventIds = planSessions
            .map(session => session.calendar_event_id)
            .filter(id => id);
            
          if (eventIds.length > 0) {
            await supabase
              .from('calendar_events')
              .delete()
              .in('id', eventIds);
          }
        }

        // Delete study plan and its sessions
        await Promise.all([
          supabase
            .from('study_plan_sessions')
            .delete()
            .eq('plan_id', existingPlan.id),
          supabase
            .from('study_plans')
            .delete()
            .eq('id', existingPlan.id)
        ]);
      }
    } catch (error) {
      console.error('Error cleaning up existing plan:', error);
    }
  };

  const generateStudyPlan = async () => {
    if (!state.user) {
      toast.error("You need to be logged in to generate a study plan");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      // Clean up existing plan first
      await cleanupExistingPlan(state.user.id);
      setGenerationProgress(15);
      
      const slotsToUse = studySlots.length > 0 ? 
        studySlots : 
        generateDefaultStudySlots(state.user.id);

      setGenerationProgress(30);
      
      // Create subject distribution based on confidence levels
      const subjectDistribution = selectedSubjects.map(subject => ({
        subject: subject.subject,
        confidence: subject.confidence,
        sessionsPerWeek: calculateSessionsPerWeek(subject.confidence)
      }));

      setStudyPlan(subjectDistribution);
      setGenerationProgress(50);

      // Save subject preferences first
      await Promise.all(selectedSubjects.map(subject => 
        supabase
          .from('student_subject_preferences')
          .upsert({
            student_id: state.user!.id,
            subject: subject.subject,
            confidence_level: subject.confidence,
          })
      ));

      // Generate actual sessions
      const sessions = await createStudySessions(subjectDistribution, slotsToUse);
      
      if (sessions && sessions.length > 0) {
        setGenerationProgress(70);

        // Create new study plan
        const { data: planData, error: planError } = await supabase
          .from('study_plans')
          .insert({
            student_id: state.user.id,
            name: 'Personalized Study Plan',
            description: 'AI-generated study plan based on your subject preferences',
            start_date: new Date().toISOString().split('T')[0],
            end_date: addDays(new Date(), 30).toISOString().split('T')[0],
            is_active: true
          })
          .select()
          .single();

        if (planError) throw planError;
        
        // Create calendar events and study plan sessions
        const eventIds = await saveSessionsToDatabase(sessions, state.user.id, planData.id);
        setCreatedCalendarEvents(eventIds.filter(id => id));
        
        setUpcomingSessions(sessions.slice(0, 5));
        setGenerationProgress(100);
        setIsComplete(true);
        
        toast.success("Your personalized study plan has been created!");
      } else {
        throw new Error("Failed to generate study sessions");
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
      setError(error instanceof Error ? error.message : "Failed to generate study plan");
      toast.error("Failed to generate study plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateSessionsPerWeek = (confidence: ConfidenceLabel) => {
    switch(confidence) {
      case 'Very Low': return 5;
      case 'Low': return 4;
      case 'Neutral': return 3;
      case 'High': return 2;
      case 'Very High': return 1;
      default: return 3;
    }
  };

  const saveStudyPlanMetadata = async (userId: string, distribution: any[]) => {
    try {
      const { data: planData, error: planError } = await supabase
        .from('study_plans')
        .insert({
          student_id: userId,
          name: 'Personalized Study Plan',
          description: 'AI-generated study plan based on your subject preferences',
          start_date: new Date().toISOString().split('T')[0],
          end_date: addDays(new Date(), 30).toISOString().split('T')[0],
          is_active: true
        })
        .select('id')
        .single();

      if (planError) throw planError;
      return planData?.id;
    } catch (error) {
      console.error('Error saving study plan metadata:', error);
      throw error;
    }
  };

  const saveSessionsToDatabase = async (sessions: any[], userId: string, planId: string): Promise<string[]> => {
    try {
      const eventIds: string[] = [];
      
      // Use a sequential approach for more reliable insertion
      for (const session of sessions) {
        const eventDescription = {
          subject: session.subject,
          topic: session.topic || '',
          isPomodoro: true,
          pomodoroWorkMinutes: 25,
          pomodoroBreakMinutes: 5
        };

        try {
          const { data: eventData, error: eventError } = await supabase
            .from('calendar_events')
            .insert({
              user_id: userId,
              student_id: userId,
              title: `${session.subject} Study Session`,
              description: JSON.stringify(eventDescription),
              event_type: 'study_session',
              start_time: session.startTime.toISOString(),
              end_time: session.endTime.toISOString()
            })
            .select('id')
            .single();

          if (eventError) {
            console.error("Error inserting calendar event:", eventError);
            eventIds.push("");
          } else if (eventData) {
            console.log("Successfully created calendar event:", eventData.id);
            
            // Also create a study plan session entry
            try {
              const { error: sessionError } = await supabase
                .from('study_plan_sessions')
                .insert({
                  plan_id: planId,
                  subject: session.subject,
                  topic: session.topic || '',
                  start_time: session.startTime.toISOString(),
                  end_time: session.endTime.toISOString(),
                  calendar_event_id: eventData.id
                });
                
              if (sessionError) {
                console.error("Error creating study plan session:", sessionError);
              }
            } catch (err) {
              console.error("Exception creating study plan session:", err);
            }
            
            eventIds.push(eventData.id);
          }
        } catch (err) {
          console.error("Exception when creating calendar event:", err);
          eventIds.push("");
        }
      }

      return eventIds;
    } catch (error) {
      console.error('Error in batch saving sessions to database:', error);
      return [];
    }
  };

  const createStudySessions = async (subjectDistribution: any[], slots: any[]) => {
    const today = new Date();
    const sessions = [];
    
    let slotIndex = 0;
    for (const subjectData of subjectDistribution) {
      for (let i = 0; i < subjectData.sessionsPerWeek; i++) {
        if (slotIndex >= slots.length) {
          slotIndex = 0;
        }
        
        const slot = slots[slotIndex];
        
        const dayOfWeek = slot.day_of_week;
        const currentDay = today.getDay() || 7; // Convert 0 (Sunday) to 7
        let daysToAdd = dayOfWeek - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        
        daysToAdd += Math.floor(i / slots.length) * 7;
        
        const sessionDate = addDays(today, daysToAdd);
        
        const startHour = slot.preferred_start_hour || 15;
        const sessionStartTime = new Date(sessionDate);
        sessionStartTime.setHours(startHour, 0, 0, 0);
        
        const sessionEndTime = new Date(sessionStartTime);
        sessionEndTime.setMinutes(sessionEndTime.getMinutes() + slot.slot_duration_minutes);
        
        sessions.push({
          subject: subjectData.subject,
          confidence: subjectData.confidence,
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          formattedStart: format(sessionStartTime, 'EEEE, h:mm a'),
          formattedEnd: format(sessionEndTime, 'h:mm a'),
          day: format(sessionStartTime, 'EEEE'),
          date: format(sessionStartTime, 'MMM d'),
          duration: slot.slot_duration_minutes
        });
        
        slotIndex++;
      }
    }
    
    // Sort sessions by date/time
    sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    return sessions;
  };

  const handleBack = () => {
    updateOnboardingStep('style');
  };

  const handleComplete = async () => {
    try {
      setIsGenerating(true);
      
      // Verify that calendar events were actually created
      if (createdCalendarEvents.length === 0) {
        console.warn("No calendar events were created during plan generation");
        toast.warning("Study plan created but calendar events may be missing");
      } else {
        console.log(`Successfully created ${createdCalendarEvents.length} calendar events`);
      }
      
      await completeOnboarding();
      toast.success("Onboarding completed successfully!");
      
      // Force a delay to ensure database operations complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Pass flags to ensure the calendar refreshes when loaded
      navigate('/calendar?fromSetup=true&refresh=true');
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("There was an error completing onboarding. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Personalized Study Plan</h2>
        <p className="text-muted-foreground">Let's create your AI-optimized study schedule</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {!isComplete ? (
        <PlanGenerationStep
          isGenerating={isGenerating}
          progress={generationProgress}
          onGenerate={generateStudyPlan}
          disabled={isGenerating || !state.user || selectedSubjects.length === 0}
        />
      ) : (
        <StudyPlanResults
          studyPlan={studyPlan}
          upcomingSessions={upcomingSessions}
          onBack={handleBack}
          onComplete={handleComplete}
          isSubmitting={isGenerating}
        />
      )}
    </motion.div>
  );
};
