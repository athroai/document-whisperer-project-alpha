
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

export const StudyPlanContainer: React.FC = () => {
  const { selectedSubjects, completeOnboarding, updateOnboardingStep, studySlots } = useOnboarding();
  const { state } = useAuth();
  const navigate = useNavigate();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateStudyPlan = async () => {
    if (!state.user) {
      toast.error("You need to be logged in to generate a study plan");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      // Simulate API delay for first step
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationProgress(15);
      
      const slotsToUse = studySlots.length > 0 ? 
        studySlots : 
        generateDefaultStudySlots(state.user.id);

      setGenerationProgress(30);
      
      // Create subject distribution based on confidence levels
      const subjectDistribution = selectedSubjects.map(subject => {
        let sessionsPerWeek = 3;
        
        switch(subject.confidence) {
          case 'Very Low':
            sessionsPerWeek = 5;
            break;
          case 'Low':
            sessionsPerWeek = 4;
            break;
          case 'Neutral':
            sessionsPerWeek = 3;
            break;
          case 'High':
            sessionsPerWeek = 2;
            break;
          case 'Very High':
            sessionsPerWeek = 1;
            break;
        }
        
        return {
          subject: subject.subject,
          confidence: subject.confidence,
          sessionsPerWeek
        };
      });

      setStudyPlan(subjectDistribution);
      setGenerationProgress(50);

      // Generate actual sessions
      const sessions = await createStudySessions(subjectDistribution, slotsToUse);
      
      if (sessions && sessions.length > 0) {
        // If we have an active user, save to Supabase
        if (state.user) {
          setGenerationProgress(70);
          await saveSessionsToDatabase(sessions, subjectDistribution, state.user.id);
        }
        
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
  
  const saveSessionsToDatabase = async (sessions: any[], subjectDistribution: any[], userId: string) => {
    if (!userId || sessions.length === 0) return;
    
    try {
      // Create a study plan record
      const { data: planData, error: planError } = await supabase
        .from('study_plans')
        .insert({
          student_id: userId,
          name: 'Personalized Study Plan',
          description: 'AI-generated study plan based on your subject preferences',
          start_date: new Date().toISOString().split('T')[0],
          end_date: addDays(new Date(), 30).toISOString().split('T')[0]
        })
        .select('id');
      
      if (planError) throw planError;
      if (!planData || planData.length === 0) throw new Error("Failed to create study plan");
      
      const planId = planData[0].id;
      
      // Create calendar events for each session
      const eventPromises = sessions.map(async (session) => {
        const eventDescription = {
          subject: session.subject,
          isPomodoro: true,
          pomodoroWorkMinutes: 25,
          pomodoroBreakMinutes: 5
        };
        
        // Create calendar event
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
          .select('id');
          
        if (eventError) throw eventError;
        if (!eventData || eventData.length === 0) throw new Error("Failed to create calendar event");
        
        // Link session to study plan
        await supabase
          .from('study_plan_sessions')
          .insert({
            plan_id: planId,
            subject: session.subject,
            start_time: session.startTime.toISOString(),
            end_time: session.endTime.toISOString(),
            is_pomodoro: true,
            pomodoro_work_minutes: 25,
            pomodoro_break_minutes: 5,
            calendar_event_id: eventData[0].id
          });
          
        return eventData[0].id;
      });
      
      await Promise.all(eventPromises);
    } catch (error) {
      console.error("Error saving sessions to database:", error);
      throw error;
    }
  };

  const handleBack = () => {
    updateOnboardingStep('style');
  };

  const handleComplete = async () => {
    try {
      setIsGenerating(true);
      await completeOnboarding();
      toast.success("Onboarding completed successfully!");
      navigate('/calendar');
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("There was an error completing onboarding. Please try again.");
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
