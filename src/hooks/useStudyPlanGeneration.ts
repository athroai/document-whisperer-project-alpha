
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSessionCreation } from '@/hooks/calendar/useSessionCreation';
import { format, addDays } from 'date-fns';
import { SubjectPreference } from '@/contexts/onboarding/types';

export const useStudyPlanGeneration = (
  userId: string | undefined, 
  selectedSubjects: SubjectPreference[]
) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [authVerified, setAuthVerified] = useState(!!userId);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const { createBatchCalendarSessions } = useSessionCreation();
  
  const calculateSessionsPerWeek = (confidenceLevel: string) => {
    switch(confidenceLevel) {
      case 'Very Low': return 5;
      case 'Low': return 4;
      case 'Neutral': return 3;
      case 'High': return 2;
      case 'Very High': return 1;
      default: return 3;
    }
  };
  
  const generateStudyPlan = useCallback(async (studySlots: any[]) => {
    if (!userId) {
      setError("User authentication required");
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(10);
    setError(null);
    
    try {
      // Clean up any existing study plan
      const { data: existingPlan } = await supabase
        .from('study_plans')
        .select('id')
        .eq('student_id', userId)
        .eq('is_active', true)
        .single();
      
      if (existingPlan) {
        // Delete old sessions
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
      
      setGenerationProgress(30);
      
      // Create subject distribution
      const subjectDistribution = selectedSubjects.map(subject => ({
        subject: subject.subject,
        confidence: subject.confidence,
        sessionsPerWeek: calculateSessionsPerWeek(subject.confidence)
      }));
      
      setStudyPlan(subjectDistribution);
      setGenerationProgress(50);
      
      // Generate session dates and times
      const sessionData = [];
      const today = new Date();
      
      // Create a map of day index -> slots
      const daySlotMap = studySlots.reduce((acc: any, slot) => {
        if (!acc[slot.day_of_week]) {
          acc[slot.day_of_week] = [];
        }
        acc[slot.day_of_week].push(slot);
        return acc;
      }, {});
      
      // Distribute subject sessions across available slots
      for (const subject of subjectDistribution) {
        let sessionsLeft = subject.sessionsPerWeek;
        let weekOffset = 0;
        
        // Continue until we've assigned all sessions for this subject
        while (sessionsLeft > 0) {
          // Loop through each day of the week (1-7, Monday-Sunday)
          for (let dayIndex = 1; dayIndex <= 7; dayIndex++) {
            if (sessionsLeft <= 0) break;
            
            // Skip days with no slots
            if (!daySlotMap[dayIndex] || daySlotMap[dayIndex].length === 0) {
              continue;
            }
            
            // Get a slot for this day
            const slot = daySlotMap[dayIndex][0]; // Just use the first slot for simplicity
            
            const dayOfWeek = dayIndex;
            const currentDay = today.getDay() || 7; // Convert JS Sunday (0) to 7
            let daysToAdd = dayOfWeek - currentDay;
            if (daysToAdd <= 0) daysToAdd += 7;
            
            // Add week offset
            daysToAdd += weekOffset * 7;
            
            const sessionDate = addDays(today, daysToAdd);
            
            const startHour = slot.preferred_start_hour || 15;
            const sessionStartTime = new Date(sessionDate);
            sessionStartTime.setHours(startHour, 0, 0, 0);
            
            const sessionEndTime = new Date(sessionStartTime);
            sessionEndTime.setMinutes(sessionEndTime.getMinutes() + slot.slot_duration_minutes);
            
            sessionData.push({
              title: `${subject.subject} Study Session`,
              subject: subject.subject,
              startTime: sessionStartTime,
              endTime: sessionEndTime
            });
            
            sessionsLeft--;
          }
          
          weekOffset++;
        }
      }
      
      setGenerationProgress(70);
      
      // Create study plan record
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
      
      // Create calendar events
      const createdEvents = await createBatchCalendarSessions(sessionData);
      
      // Create study plan sessions
      if (createdEvents.length > 0) {
        const sessionEntries = createdEvents.map((event, index) => ({
          plan_id: planData.id,
          subject: sessionData[index].subject,
          start_time: event.start_time,
          end_time: event.end_time,
          calendar_event_id: event.id,
          is_pomodoro: true,
          pomodoro_work_minutes: 25,
          pomodoro_break_minutes: 5
        }));
        
        await supabase
          .from('study_plan_sessions')
          .insert(sessionEntries);
      }
      
      setCalendarEvents(createdEvents);
      setGenerationProgress(100);
      setIsGenerationComplete(true);
    } catch (err) {
      console.error('Error generating study plan:', err);
      setError(err instanceof Error ? err.message : 'An error occurred generating your study plan');
    } finally {
      setIsGenerating(false);
    }
  }, [userId, selectedSubjects, createBatchCalendarSessions]);
  
  // Verify auth on initial load
  useEffect(() => {
    setAuthVerified(!!userId);
  }, [userId]);
  
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
