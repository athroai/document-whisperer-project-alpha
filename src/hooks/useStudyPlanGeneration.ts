import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/supabase';
import { SubjectPreference } from '@/contexts/onboarding/types';
import { PreferredStudySlot } from '@/types/study';
import { format, addDays, getDay, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface StudySession {
  subject: string;
  startTime: Date;
  endTime: Date;
  formattedStart: string;
  formattedEnd: string;
  day: string;
  date: string;
  duration: number;
  topic?: string;
}

export const useStudyPlanGeneration = (userId: string | undefined, subjects: SubjectPreference[]) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [authVerified, setAuthVerified] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await verifyAuth();
        setAuthVerified(!!user);
      } catch (err) {
        console.error("Auth verification failed:", err);
        setAuthVerified(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const generateStudyPlan = async (studySlots: PreferredStudySlot[]) => {
    if (!userId) {
      setError("You must be logged in to generate a study plan");
      toast({
        title: "Authentication Required",
        description: "You must be logged in to generate a study plan",
        variant: "destructive"
      });
      return;
    }
    
    if (subjects.length === 0) {
      setError("Please select at least one subject");
      toast({
        title: "No Subjects Selected",
        description: "Please select at least one subject to generate a study plan",
        variant: "destructive"
      });
      return;
    }
    
    if (!studySlots || studySlots.length === 0) {
      setError("Please set up your study schedule first");
      toast({
        title: "No Study Schedule",
        description: "Please set up your study schedule before generating a plan",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(10);
    setError(null);
    
    try {
      // First, clean up any existing study plan
      await cleanupExistingPlan(userId);
      setGenerationProgress(25);
      
      // Create the study plan distribution based on confidence
      const subjectDistribution = subjects.map(subject => ({
        subject: subject.subject,
        confidence: subject.confidence,
        sessionsPerWeek: getSessionsForConfidence(subject.confidence)
      }));
      
      setStudyPlan(subjectDistribution);
      setGenerationProgress(40);
      
      // Generate the study sessions
      const sessions = generateStudySessions(subjectDistribution, studySlots);
      setGenerationProgress(60);
      
      if (sessions.length === 0) {
        throw new Error("No study sessions could be generated");
      }
      
      // Create the study plan in the database
      const planData = {
        student_id: userId,
        name: 'Personalized Study Plan',
        description: 'AI-generated study plan based on your preferences',
        start_date: new Date().toISOString().split('T')[0],
        end_date: addDays(new Date(), 30).toISOString().split('T')[0],
        is_active: true
      };
      
      const { data: plan, error: planError } = await supabase
        .from('study_plans')
        .insert(planData)
        .select()
        .single();
        
      if (planError) {
        console.error("Error creating study plan:", planError);
        throw new Error("Failed to create study plan in database. Please try again later.");
      }
      
      setGenerationProgress(75);
      
      // Create calendar events for the sessions
      const calendarEventsData = sessions.map(session => ({
        title: `${session.subject} Study Session`,
        description: JSON.stringify({
          subject: session.subject,
          topic: session.topic,
          isPomodoro: true,
          pomodoroWorkMinutes: 25,
          pomodoroBreakMinutes: 5
        }),
        start_time: session.startTime.toISOString(),
        end_time: session.endTime.toISOString(),
        event_type: 'study_session',
        user_id: userId,
        student_id: userId
      }));
      
      const { data: createdEvents, error: eventsError } = await supabase
        .from('calendar_events')
        .insert(calendarEventsData)
        .select();
        
      if (eventsError) {
        console.error("Error creating calendar events:", eventsError);
        throw new Error("Failed to create calendar events. Please try again later.");
      }
      
      setGenerationProgress(90);
      
      // Link the calendar events to the study plan
      if (createdEvents && createdEvents.length > 0 && plan) {
        const studyPlanSessions = createdEvents.map((event, i) => ({
          plan_id: plan.id,
          subject: sessions[i].subject,
          topic: sessions[i].topic || '',
          start_time: event.start_time,
          end_time: event.end_time,
          calendar_event_id: event.id,
          is_pomodoro: true,
          pomodoro_work_minutes: 25,
          pomodoro_break_minutes: 5
        }));
        
        const { error: sessionsError } = await supabase
          .from('study_plan_sessions')
          .insert(studyPlanSessions);
          
        if (sessionsError) {
          console.error("Error creating study plan sessions:", sessionsError);
          // Non-critical error, just log it and continue
        }
      }
      
      setCalendarEvents(createdEvents || []);
      setGenerationProgress(100);
      setIsGenerationComplete(true);
      
      toast({
        title: "Success",
        description: "Your study plan has been generated successfully!",
      });
    } catch (err: any) {
      console.error("Error generating study plan:", err);
      setError(err instanceof Error ? err.message : "An error occurred while generating your study plan");
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to generate study plan",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const cleanupExistingPlan = async (userId: string) => {
    try {
      const { data: existingPlans } = await supabase
        .from('study_plans')
        .select('id')
        .eq('student_id', userId)
        .eq('is_active', true);
        
      if (existingPlans && existingPlans.length > 0) {
        for (const plan of existingPlans) {
          const { data: sessions } = await supabase
            .from('study_plan_sessions')
            .select('calendar_event_id')
            .eq('plan_id', plan.id);
            
          if (sessions && sessions.length > 0) {
            const eventIds = sessions
              .map(session => session.calendar_event_id)
              .filter(Boolean);
              
            if (eventIds.length > 0) {
              await supabase
                .from('calendar_events')
                .delete()
                .in('id', eventIds);
            }
          }
          
          await supabase
            .from('study_plan_sessions')
            .delete()
            .eq('plan_id', plan.id);
        }
        
        await supabase
          .from('study_plans')
          .update({ is_active: false })
          .eq('student_id', userId);
      }
    } catch (error) {
      console.error("Error cleaning up existing plan:", error);
      // Continue anyway, we'll create a new plan
    }
  };
  
  const getSessionsForConfidence = (confidence: string) => {
    switch (confidence) {
      case 'low': return 5;
      case 'medium': return 3;
      case 'high': return 2;
      default: return 3;
    }
  };
  
  const generateStudySessions = (
    subjectDistribution: { subject: string; confidence: string; sessionsPerWeek: number }[],
    slots: PreferredStudySlot[]
  ): StudySession[] => {
    const result: StudySession[] = [];
    
    if (!slots || slots.length === 0) {
      slots = [1, 2, 3, 4, 5].map(day => ({
        id: `default-${day}`,
        user_id: userId!,
        day_of_week: day,
        slot_count: 1,
        slot_duration_minutes: 45,
        preferred_start_hour: 16
      }));
    }
    
    const today = startOfDay(new Date());
    let daysOut = 1;
    
    const subjectsToSchedule = subjectDistribution.flatMap(subj => 
      Array(subj.sessionsPerWeek).fill(subj)
    );
    
    while (subjectsToSchedule.length > 0 && daysOut <= 21) {
      const dateToCheck = addDays(today, daysOut);
      const dayOfWeekIndex = getDay(dateToCheck);
      
      console.log(`Checking day ${daysOut}: ${format(dateToCheck, 'yyyy-MM-dd')} (day of week: ${dayOfWeekIndex})`);
      
      const slotsForDay = slots.filter(slot => slot.day_of_week === dayOfWeekIndex);
      
      if (slotsForDay.length > 0) {
        console.log(`Found ${slotsForDay.length} slots for day ${dayOfWeekIndex}`);
        
        for (let i = 0; i < slotsForDay.length && subjectsToSchedule.length > 0; i++) {
          const slot = slotsForDay[i];
          const subject = subjectsToSchedule.shift();
          
          if (subject) {
            const startHour = slot.preferred_start_hour || 16;
            const sessionDate = new Date(dateToCheck);
            sessionDate.setHours(startHour, 0, 0, 0);
            
            const endDate = new Date(sessionDate);
            endDate.setMinutes(sessionDate.getMinutes() + slot.slot_duration_minutes);
            
            result.push({
              subject: subject.subject,
              startTime: sessionDate,
              endTime: endDate,
              formattedStart: format(sessionDate, 'EEEE, h:mm a'),
              formattedEnd: format(endDate, 'h:mm a'),
              day: format(sessionDate, 'EEEE'),
              date: format(sessionDate, 'MMM d'),
              duration: slot.slot_duration_minutes
            });
            
            console.log(`Scheduled ${subject.subject} on ${format(sessionDate, 'EEEE, MMM d')} at ${format(sessionDate, 'h:mm a')}`);
          }
        }
      }
      
      daysOut++;
    }
    
    return result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };
  
  return {
    isGenerating,
    isGenerationComplete,
    generationProgress,
    studyPlan,
    calendarEvents,
    error,
    authVerified,
    generateStudyPlan
  };
};
