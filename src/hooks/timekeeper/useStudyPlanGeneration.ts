import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSubjects, UserSubject } from '@/hooks/useUserSubjects';
import { toast } from '@/hooks/use-toast';
import { format, addDays, startOfDay, nextDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface StudyPlanGenerationProps {
  redistributeOnFail: boolean;
  useConfidenceWeighting: boolean;
  startDate?: Date;
  daysToGenerate?: number;
}

interface StudySession {
  id: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  day: string;
  formattedStartTime: string;
  formattedEndTime: string;
}

export const useStudyPlanGeneration = (options: StudyPlanGenerationProps = { 
  redistributeOnFail: true, 
  useConfidenceWeighting: true,
  daysToGenerate: 14
}) => {
  const { state: authState } = useAuth();
  const { subjects } = useUserSubjects();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateStudyPlan = useCallback(async () => {
    const userId = authState.user?.id;
    if (!userId) {
      setError('You must be logged in to generate a study plan.');
      return false;
    }

    if (subjects.length === 0) {
      setError('You need to select at least one subject before generating a study plan.');
      return false;
    }

    setIsGenerating(true);
    setGenerationProgress(10);
    setError(null);
    
    try {
      // Step 1: Get user's preferred study slots
      setGenerationProgress(20);
      const { data: studySlots, error: slotsError } = await supabase
        .from('preferred_study_slots')
        .select('*')
        .eq('user_id', userId);
      
      if (slotsError) {
        throw new Error(`Failed to fetch study slots: ${slotsError.message}`);
      }
      
      if (!studySlots || studySlots.length === 0) {
        throw new Error('No study slots found. Please set up your availability first.');
      }

      // Step 2: Clear existing calendar events (optional, depending on use case)
      setGenerationProgress(30);
      const today = startOfDay(new Date());
      const endDate = addDays(today, options.daysToGenerate || 14);
      
      // Only delete future events
      const { error: deleteError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', userId)
        .eq('event_type', 'study_session')
        .gte('start_time', today.toISOString())
        .lte('start_time', endDate.toISOString());
        
      if (deleteError) {
        console.error('Error clearing existing events:', deleteError);
      }

      // Step 3: Generate sessions based on study slots and preferences
      setGenerationProgress(50);
      const generatedSessions = generateSessionsFromSlots(
        studySlots, 
        subjects, 
        today,
        options
      );
      
      if (generatedSessions.length === 0) {
        throw new Error('Failed to generate study sessions. Please check your availability settings.');
      }

      // Step 4: Create calendar events
      setGenerationProgress(75);
      const calendarEvents = generatedSessions.map(session => ({
        id: uuidv4(),
        title: `${session.subject} Study Session`,
        description: '',
        subject: session.subject,
        start_time: session.startTime.toISOString(),
        end_time: session.endTime.toISOString(),
        event_type: 'study_session',
        user_id: userId,
        student_id: userId
      }));
      
      const { error: insertError } = await supabase
        .from('calendar_events')
        .insert(calendarEvents);
        
      if (insertError) {
        throw new Error(`Failed to save calendar events: ${insertError.message}`);
      }

      setGenerationProgress(100);
      setSessions(generatedSessions);
      
      return true;
    } catch (err: any) {
      console.error('Error generating study plan:', err);
      setError(err.message || 'Failed to generate study plan');
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [authState.user?.id, subjects, options]);

  // Helper function to generate study sessions from slots and subjects
  const generateSessionsFromSlots = (
    slots: any[],
    subjects: UserSubject[],
    startDate: Date,
    options: StudyPlanGenerationProps
  ): StudySession[] => {
    const sessions: StudySession[] = [];
    const today = startOfDay(startDate);
    const daysToGenerate = options.daysToGenerate || 14;
    const endDate = addDays(today, daysToGenerate);
    
    // Create a priority map based on confidence levels
    const subjectPriorities = subjects.map(subj => {
      let priority: number;
      
      if (options.useConfidenceWeighting) {
        // Convert confidence to numeric priority
        if (typeof subj.confidence === 'string') {
          priority = subj.confidence === 'low' ? 5 :
                    subj.confidence === 'medium' ? 3 : 1;
        } else {
          // Assume numeric confidence (1-10)
          const numConfidence = Number(subj.confidence) || 5;
          priority = Math.max(1, Math.ceil((10 - numConfidence) / 2));
        }
      } else {
        // Equal priority for all subjects
        priority = 1;
      }
      
      return {
        subject: subj.subject,
        priority,
        sessionCount: 0 // Track how many sessions are allocated
      };
    });
    
    // Generate a schedule by day and slot
    let currentDate = new Date(today);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      // Find slots for this day of the week
      const slotsForDay = slots.filter(slot => slot.day_of_week === dayOfWeek);
      
      for (const slot of slotsForDay) {
        // Determine the subject for this slot
        let subjectForSlot: string;
        
        // First try the slot's assigned subject if it exists
        if (slot.subject) {
          subjectForSlot = slot.subject;
        } else {
          // Otherwise use priority-based selection
          // Sort by priority, then by number of sessions (to balance)
          const sortedSubjects = [...subjectPriorities]
            .sort((a, b) => {
              // Higher priority first
              if (a.priority !== b.priority) return b.priority - a.priority;
              // Then fewer sessions first
              return a.sessionCount - b.sessionCount;
            });
          
          // Select the highest priority subject
          subjectForSlot = sortedSubjects[0]?.subject;
          
          // Update session count for the selected subject
          const subjectIndex = subjectPriorities.findIndex(s => s.subject === subjectForSlot);
          if (subjectIndex >= 0) {
            subjectPriorities[subjectIndex].sessionCount++;
          }
        }
        
        // Create the session
        const startHour = slot.preferred_start_hour || 16;
        const durationMinutes = slot.slot_duration_minutes || 45;
        
        const sessionStart = new Date(currentDate);
        sessionStart.setHours(startHour, 0, 0, 0);
        
        const sessionEnd = new Date(sessionStart);
        sessionEnd.setMinutes(sessionStart.getMinutes() + durationMinutes);
        
        sessions.push({
          id: uuidv4(),
          subject: subjectForSlot,
          startTime: sessionStart,
          endTime: sessionEnd,
          day: format(sessionStart, 'EEEE'),
          formattedStartTime: format(sessionStart, 'h:mm a'),
          formattedEndTime: format(sessionEnd, 'h:mm a')
        });
      }
      
      // Move to next day
      currentDate = addDays(currentDate, 1);
    }
    
    return sessions;
  };

  return {
    isGenerating,
    generationProgress,
    sessions,
    error,
    generateStudyPlan
  };
};
