
import { supabase } from '@/integrations/supabase/client';

export interface CalendarEvent {
  id?: string;
  userId: string;
  title: string;
  description: string;
  date: Date;
  time?: string;
  duration?: number;
  mentor?: string;
  type?: 'study' | 'quiz' | 'revision';
  createdAt?: Date;
}

export const calendarService = {
  // Create a new calendar event
  async addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: event.userId,
          title: event.title,
          description: event.description,
          start_time: event.date.toISOString(),
          end_time: new Date(event.date.getTime() + (event.duration || 60) * 60000).toISOString(),
          event_type: event.type || 'study',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Error adding calendar event:', error);
      throw error;
    }
  },

  // Get all events for a specific user
  async getUserEvents(userId: string): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      return data.map(event => ({
        id: event.id,
        userId: event.user_id,
        title: event.title,
        description: event.description,
        date: new Date(event.start_time),
        time: new Date(event.start_time).toLocaleTimeString(),
        duration: (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000,
        // Fix: Remove mentor property since it doesn't exist in database
        type: event.event_type as 'study' | 'quiz' | 'revision',
        createdAt: new Date(event.created_at)
      }));
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    }
  },

  // Get events for a specific date range
  async getEventsInDateRange(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      return data.map(event => ({
        id: event.id,
        userId: event.user_id,
        title: event.title,
        description: event.description,
        date: new Date(event.start_time),
        time: new Date(event.start_time).toLocaleTimeString(),
        duration: (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000,
        // Fix: Remove mentor property since it doesn't exist in database
        type: event.event_type as 'study' | 'quiz' | 'revision',
        createdAt: new Date(event.created_at)
      }));
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    }
  }
};

export default calendarService;
