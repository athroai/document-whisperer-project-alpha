
import { useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useDbCalendarEvents = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createDbEvent = async (userId: string, eventData: Partial<CalendarEvent>) => {
    try {
      setIsLoading(true);
      
      console.log('Creating DB event for user:', userId, eventData);
      
      const eventDescription = eventData.description || JSON.stringify({
        subject: eventData.subject || '',
        topic: eventData.topic || '',
        isPomodoro: true,
        pomodoroWorkMinutes: 25,
        pomodoroBreakMinutes: 5
      });

      const eventInsert = {
        title: eventData.title || `${eventData.subject || 'Study'} Session`,
        description: eventDescription,
        user_id: userId,
        student_id: userId,
        event_type: eventData.event_type || 'study_session',
        start_time: eventData.start_time,
        end_time: eventData.end_time
      };

      console.log('Inserting event into database:', eventInsert);

      const { data, error } = await supabase
        .from('calendar_events')
        .insert(eventInsert)
        .select();

      if (error) {
        console.error('Error creating calendar event in database:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.error('No data returned from calendar event creation');
        return null;
      }

      console.log('Successfully created event in database:', data[0]);

      const eventWithSubject = {
        id: data[0].id,
        title: data[0].title,
        description: data[0].description,
        subject: eventData.subject || '',
        topic: eventData.topic || '',
        start_time: data[0].start_time,
        end_time: data[0].end_time,
        event_type: data[0].event_type || 'study_session',
        user_id: data[0].user_id,
        student_id: data[0].student_id
      };

      return eventWithSubject;
    } catch (error) {
      console.error('Exception creating calendar event:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDbEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      setIsLoading(true);
      
      console.log('Updating DB event:', id, updates);

      let updateData: any = { ...updates };
      
      // Remove properties that aren't in the database schema
      delete updateData.subject;
      delete updateData.topic;
      
      // If we have subject/topic, update the description JSON
      if (updates.subject || updates.topic) {
        try {
          const { data } = await supabase
            .from('calendar_events')
            .select('description')
            .eq('id', id)
            .single();
            
          if (data) {
            let descObj = {};
            try {
              descObj = JSON.parse(data.description || '{}');
            } catch (e) {
              console.warn('Failed to parse existing description, creating new one');
              descObj = {};
            }
            
            updateData.description = JSON.stringify({
              ...descObj,
              subject: updates.subject || (descObj as any).subject || '',
              topic: updates.topic || (descObj as any).topic || ''
            });
          }
        } catch (e) {
          console.warn('Error fetching existing event description:', e);
        }
      }
      
      const { error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating calendar event:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update calendar event. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception updating calendar event:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDbEvent = async (id: string) => {
    try {
      setIsLoading(true);
      
      console.log('Deleting DB event:', id);
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting calendar event:', error);
        toast({
          title: "Deletion Failed",
          description: "Failed to delete calendar event. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception deleting calendar event:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createDbEvent,
    updateDbEvent,
    deleteDbEvent
  };
};
