
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/calendar';
import { SubjectPreference } from '@/contexts/onboarding/types';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { useSessionCreation } from './calendar/useSessionCreation';
import { PreferredStudySlot } from '@/types/study';
import { ConfidenceLabel } from '@/types/confidence';
import { verifyAuth } from '@/lib/supabase';

interface StudyPlanSession {
  subject: string;
  confidence: ConfidenceLabel;
  startTime: Date;
  endTime: Date;
  formattedStart: string;
  formattedEnd: string;
  day: string;
  date: string;
  duration: number;
  topic?: string;
}

export const useStudyPlanGeneration = (userId?: string, subjects?: SubjectPreference[]) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [authVerified, setAuthVerified] = useState<boolean | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { toast } = useToast();
  const { createCalendarSession, createBatchCalendarSessions } = useSessionCreation();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await verifyAuth();
        setAuthVerified(true);
      } catch (err) {
        console.error("Auth verification failed:", err);
        setAuthVerified(false);
      }
    };
    
    if (userId) {
      checkAuth();
    }
  }, [userId]);

  const cleanupExistingPlan = async (userId: string) => {
    try {
      setGenerationProgress(5);
      
      const { data: existingPlan } = await supabase
        .from('study_plans')
        .select('id')
        .eq('student_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (existingPlan) {
        console.log("Found existing plan, cleaning up:", existingPlan.id);
        setGenerationProgress(10);
        
        const { data: planSessions } = await supabase
          .from('study_plan_sessions')
          .select('calendar_event_id')
          .eq('plan_id', existingPlan.id);
          
        if (planSessions && planSessions.length > 0) {
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
      
      setGenerationProgress(15);
    } catch (error) {
      console.error('Error cleaning up existing plan:', error);
    }
  };

  const generateStudyPlan = async (studySlots: PreferredStudySlot[]) => {
    if (!userId) {
      setError('No user ID provided');
      return;
    }

    if (!subjects || subjects.length === 0) {
      setError('No subjects provided');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      // Clean up any existing study plan
      await cleanupExistingPlan(userId);
      
      // Generate slot distribution based on subject confidence
      const subjectDistribution = subjects.map(subject => ({
        subject: subject.subject,
        confidence: subject.confidence,
        sessionsPerWeek: calculateSessionsPerWeek(subject.confidence)
      }));

      setStudyPlan(subjectDistribution);
      setGenerationProgress(30);

      // Create study sessions based on slots and subjects
      const sessions = await createStudySessions(subjectDistribution, studySlots);
      
      if (sessions && sessions.length > 0) {
        setGenerationProgress(50);
        
        // Create a new study plan in the database
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
          .select()
          .single();

        if (planError) throw planError;
        
        setGenerationProgress(70);
        
        // Create calendar events for each session
        const calendarSessionsData = sessions.map(session => ({
          title: `${session.subject} Study Session`,
          subject: session.subject,
          topic: session.topic || '',
          startTime: session.startTime,
          endTime: session.endTime,
          eventType: 'study_session'
        }));
        
        // Batch create all calendar events
        const createdEvents = await createBatchCalendarSessions(calendarSessionsData);
        
        if (createdEvents.length > 0) {
          // Link sessions to the study plan
          const sessionEntries = createdEvents.map((event, index) => ({
            plan_id: planData.id,
            subject: sessions[index].subject,
            topic: sessions[index].topic || '',
            start_time: event.start_time,
            end_time: event.end_time,
            calendar_event_id: event.id,
            is_pomodoro: true,
            pomodoro_work_minutes: 25,
            pomodoro_break_minutes: 5
          }));
          
          // Insert all study plan sessions
          const { error: sessionError } = await supabase
            .from('study_plan_sessions')
            .insert(sessionEntries);
          
          if (sessionError) {
            console.error("Error creating study plan sessions:", sessionError);
          }
          
          setCalendarEvents(createdEvents);
          setGenerationProgress(100);
          setIsGenerationComplete(true);
          
          toast({
            title: "Success",
            description: `Created ${createdEvents.length} study sessions in your calendar.`
          });
        } else {
          throw new Error("Failed to create calendar events");
        }
      } else {
        throw new Error("Failed to generate study sessions");
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
      setError(error instanceof Error ? error.message : "Failed to generate study plan");
      toast({
        title: "Error",
        description: "Failed to generate your study plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateSessionsPerWeek = (confidence: ConfidenceLabel): number => {
    switch(confidence) {
      case 'Very Low': return 5;
      case 'Low': return 4;
      case 'Neutral': return 3;
      case 'High': return 2;
      case 'Very High': return 1;
      default: return 3;
    }
  };

  const createStudySessions = async (
    subjectDistribution: any[], 
    slots: PreferredStudySlot[]
  ): Promise<StudyPlanSession[]> => {
    // Make sure we have slots to work with
    if (!slots || slots.length === 0) {
      throw new Error("No study slots provided");
    }
    
    const today = new Date();
    const sessions: StudyPlanSession[] = [];
    console.log("Creating study sessions with slots:", slots);
    
    let slotIndex = 0;
    for (const subjectData of subjectDistribution) {
      for (let i = 0; i < subjectData.sessionsPerWeek; i++) {
        if (slotIndex >= slots.length) {
          slotIndex = 0;
        }
        
        const slot = slots[slotIndex];
        
        const dayOfWeek = slot.day_of_week;
        const currentDay = today.getDay() || 7;
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
    
    // Sort by start time
    sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    return sessions;
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
