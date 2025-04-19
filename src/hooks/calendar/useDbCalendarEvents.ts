
import { supabase } from '@/lib/supabase';
import { CalendarEvent } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';

export const useDbCalendarEvents = () => {
  const { toast } = useToast();

  const createDbEvent = async (
    userId: string,
    eventData: Partial<CalendarEvent>
  ): Promise<CalendarEvent | null> => {
    try {
      const eventDescription = JSON.stringify({
        subject: eventData.subject || '',
        topic: eventData.topic || '',
      });

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          title: eventData.title || `${eventData.subject || 'Study'} Session`,
          description: eventDescription,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          event_type: eventData.event_type || 'study_session',
          user_id: userId,
          student_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      
      if (!data) return null;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        subject: eventData.subject || '',
        topic: eventData.topic || '',
        start_time: data.start_time,
        end_time: data.end_time,
        event_type: data.event_type || 'study_session'
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  };

  const updateDbEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<boolean> => {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.start_time) updateData.start_time = updates.start_time;
      if (updates.end_time) updateData.end_time = updates.end_time;
      
      if (updates.subject || updates.topic) {
        const { data: currentEvent } = await supabase
          .from('calendar_events')
          .select('description')
          .eq('id', id)
          .single();
          
        let descriptionObj = {};
        try {
          if (currentEvent?.description) {
            descriptionObj = JSON.parse(currentEvent.description);
          }
        } catch (e) {
          console.warn('Failed to parse existing description');
        }
        
        updateData.description = JSON.stringify({
          ...descriptionObj,
          subject: updates.subject || (descriptionObj as any).subject || '',
          topic: updates.topic || (descriptionObj as any).topic || '',
        });
      }
      
      const { error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Calendar event updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteDbEvent = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Calendar event deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    createDbEvent,
    updateDbEvent,
    deleteDbEvent
  };
};
