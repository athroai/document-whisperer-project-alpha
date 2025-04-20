
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SubjectPreference } from '@/contexts/onboarding/types';
import { CalendarEvent } from '@/types/calendar';
import { PreferredStudySlot } from '@/types/study';
import { verifyAuth } from '@/lib/supabase';
import { useSessionCreation } from '@/hooks/calendar/useSessionCreation';

export const useStudyPlanGeneration = (
  userId: string | undefined,
  selectedSubjects: SubjectPreference[]
) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [authVerified, setAuthVerified] = useState<boolean | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { createBatchCalendarSessions } = useSessionCreation();

  // Verify auth when userId changes
  useEffect(() => {
    const checkAuth = async () => {
      if (!userId) {
        setAuthVerified(false);
        return;
      }
      
      try {
        const isAuthenticated = await verifyAuth();
        setAuthVerified(Boolean(isAuthenticated));
      } catch (err) {
        console.error("Auth verification error:", err);
        setAuthVerified(false);
      }
    };
    
    checkAuth();
  }, [userId]);

  const generateStudyPlan = async (studySlots: PreferredStudySlot[]) => {
    if (!userId || selectedSubjects.length === 0) {
      setError("Cannot generate study plan: missing user ID or subjects");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(10);

    try {
      // Create a new study plan
      const planId = `plan-${Date.now()}`;
      const now = new Date();
      const startDate = new Date(now);
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 14); // Two week plan
      
      setGenerationProgress(30);
      
      // Generate study sessions for each subject based on study slots
      const sessionPayloads = [];
      
      // Distribute subjects across available slots
      const slotCount = studySlots.length;
      if (slotCount === 0) {
        throw new Error("No study slots available");
      }
      
      setGenerationProgress(50);
      
      for (let i = 0; i < selectedSubjects.length; i++) {
        const subject = selectedSubjects[i];
        // Pick study slot with round-robin distribution
        const slot = studySlots[i % slotCount];
        
        // Set current date to next occurrence of this day of week
        const sessionDate = new Date();
        const currentDay = sessionDate.getDay();
        const daysUntilSlot = (7 + slot.day_of_week - currentDay) % 7;
        sessionDate.setDate(sessionDate.getDate() + daysUntilSlot);
        
        // Set hours based on slot preference
        const startTime = new Date(sessionDate);
        startTime.setHours(slot.preferred_start_hour, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + slot.slot_duration_minutes);
        
        sessionPayloads.push({
          title: `${subject.subject} Study Session`,
          subject: subject.subject,
          startTime,
          endTime,
          eventType: 'study_session'
        });
      }
      
      setGenerationProgress(70);
      
      // Create calendar events
      const createdEvents = await createBatchCalendarSessions(sessionPayloads, { 
        selfCreated: true,
        maxRetries: 3 
      });
      
      setGenerationProgress(90);
      
      // Create local study plan object
      const generatedPlan = {
        id: planId,
        name: "Your Study Plan",
        startDate,
        endDate,
        subjects: selectedSubjects.map(s => s.subject),
        sessionCount: createdEvents.length
      };
      
      setStudyPlan(generatedPlan);
      setCalendarEvents(createdEvents);
      setGenerationProgress(100);
      setIsGenerationComplete(true);
      
      return generatedPlan;
    } catch (error: any) {
      console.error("Error generating study plan:", error);
      setError(`Failed to generate study plan: ${error.message}`);
      return null;
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
