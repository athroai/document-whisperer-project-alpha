
import { supabase } from '@/lib/supabase';
import { PreferredStudySlot } from '@/types/study';
import { useCalendarEvents } from '../useCalendarEvents';

export const useSessionSlotOperations = () => {
  const { createEvent } = useCalendarEvents();

  const createCalendarEvents = async (slots: PreferredStudySlot[], useLocalFallback: boolean = true) => {
    if (!slots.length) return [];
    try {
      const events = [];
      const today = new Date();
      
      for (const slot of slots) {
        // Correctly handle the day of week to match JavaScript's Sunday=0 convention
        const dayIndex = slot.day_of_week;
        
        // Calculate days until next occurrence of this day
        const currentDayIndex = today.getDay(); // 0 = Sunday, ..., 6 = Saturday
        let daysUntilNext = dayIndex - currentDayIndex;
        if (daysUntilNext <= 0) {
          daysUntilNext += 7; // Go to next week if day has passed this week
        }

        // Create the next date for this day
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntilNext);

        const startTime = new Date(nextDate);
        startTime.setHours(slot.preferred_start_hour || 16, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + slot.slot_duration_minutes);

        try {
          console.log(`Creating event for day ${dayIndex} (${nextDate.toDateString()}) at ${startTime.toTimeString()}`);
          
          // Only create events with titles from the custom slots, not generic "Study Session" events
          const event = await createEvent({
            title: `${slot.subject || 'Subject'} Study Session`, // Include subject name
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            subject: slot.subject || 'General',
            event_type: 'study_session'
          }, useLocalFallback);

          if (event) {
            events.push(event);
          }
        } catch (err) {
          console.error('Error creating calendar event:', err);
        }
      }
      return events;
    } catch (error) {
      console.error('Error creating calendar events:', error);
      return [];
    }
  };

  const saveStudySlotsToDatabase = async (userId: string, slots: PreferredStudySlot[]) => {
    if (!userId) {
      throw new Error('Authentication required');
    }

    try {
      // First delete any existing slots
      const { error: deleteError } = await supabase
        .from('preferred_study_slots')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) {
        console.error("Error deleting existing study slots:", deleteError);
      }
      
      if (slots.length === 0) return true;

      const slotsToInsert = slots.map(({ id, ...slot }) => ({
        user_id: userId,
        day_of_week: slot.day_of_week,
        slot_count: slot.slot_count,
        slot_duration_minutes: slot.slot_duration_minutes,
        preferred_start_hour: slot.preferred_start_hour,
        subject: slot.subject // Include subject when saving to database
      }));

      const { data, error } = await supabase
        .from('preferred_study_slots')
        .insert(slotsToInsert)
        .select();

      if (error) throw new Error(`Database error: ${error.message}`);
      
      console.log(`Saved ${data?.length || 0} study slots to database`);
      return true;
    } catch (error) {
      console.error("Error saving study slots:", error);
      throw error;
    }
  };

  return { createCalendarEvents, saveStudySlotsToDatabase };
};
