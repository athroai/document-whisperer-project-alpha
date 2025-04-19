
import { useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { useStudentRecord } from '@/contexts/StudentRecordContext';
import { useSubjects } from '@/hooks/useSubjects';
import { findAvailableTimeSlots } from '@/utils/timeUtils';

export const useSuggestedEvents = (events: CalendarEvent[]) => {
  const [suggestedEvents, setSuggestedEvents] = useState<CalendarEvent[]>([]);
  const { toast } = useToast();
  const { studentRecord, getRecommendedSubject } = useStudentRecord();
  const { subjectsWithConfidence } = useSubjects();

  const generateSuggestedSessions = () => {
    try {
      const recommendedSubject = getRecommendedSubject();
      if (!recommendedSubject) return;

      const subjectData = subjectsWithConfidence.find(s => 
        s.subject.toLowerCase() === recommendedSubject.toLowerCase()
      );
      
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      
      const availableSlots = findAvailableTimeSlots(now, nextWeek, 45, events);
      
      if (availableSlots.length === 0) return;
      
      const newSuggestions = availableSlots.slice(0, 3).map((slot, index) => ({
        id: `suggested-${studentRecord?.id}-${recommendedSubject}-${index}`,
        title: `Suggested ${recommendedSubject} Study`,
        subject: recommendedSubject,
        topic: '',
        start_time: slot.start.toISOString(),
        end_time: slot.end.toISOString(),
        event_type: 'study_session',
        suggested: true
      }));
      
      setSuggestedEvents(newSuggestions);
      
    } catch (error) {
      console.error('Error generating suggested sessions:', error);
    }
  };

  const acceptSuggestedEvent = async (suggestedEvent: CalendarEvent): Promise<boolean> => {
    try {
      const { id, suggested, ...eventData } = suggestedEvent;
      
      // Remove from suggestions
      setSuggestedEvents(prev => prev.filter(e => e.id !== suggestedEvent.id));
      
      toast({
        title: "Study Session Added",
        description: `${eventData.subject} study session has been added to your calendar.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error accepting suggested event:', error);
      return false;
    }
  };

  return {
    suggestedEvents,
    generateSuggestedSessions,
    acceptSuggestedEvent
  };
};
