
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';

interface SessionCreationData {
  title: string;
  subject: string;
  topic?: string;
  startTime: Date;
  endTime: Date;
  eventType?: string;
}

export const useSessionCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { state } = useAuth();
  
  const createCalendarSession = async (sessionData: SessionCreationData) => {
    if (!state.user?.id) {
      throw new Error("User not authenticated");
    }
    
    setIsCreating(true);
    
    try {
      const eventId = uuidv4();
      
      const event = {
        id: eventId,
        title: sessionData.title,
        description: JSON.stringify({
          subject: sessionData.subject,
          topic: sessionData.topic
        }),
        start_time: sessionData.startTime.toISOString(),
        end_time: sessionData.endTime.toISOString(),
        event_type: sessionData.eventType || 'study_session',
        user_id: state.user.id,
        student_id: state.user.id
      };
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(event)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error("Error creating calendar session:", error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  const createBatchCalendarSessions = async (sessionsData: SessionCreationData[]) => {
    if (!state.user?.id) {
      throw new Error("User not authenticated");
    }
    
    setIsCreating(true);
    
    try {
      const events = sessionsData.map(session => ({
        id: uuidv4(),
        title: session.title,
        description: JSON.stringify({
          subject: session.subject,
          topic: session.topic
        }),
        start_time: session.startTime.toISOString(),
        end_time: session.endTime.toISOString(),
        event_type: session.eventType || 'study_session',
        user_id: state.user!.id,
        student_id: state.user!.id
      }));
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(events)
        .select();
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error creating batch calendar sessions:", error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  return {
    createCalendarSession,
    createBatchCalendarSessions,
    isCreating
  };
};
