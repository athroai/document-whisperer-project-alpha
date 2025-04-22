
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
      const weekStartDate = today.getDate() - today.getDay() + 1; // Monday

      for (const slot of slots) {
        let dayDiff = slot.day_of_week - today.getDay();
        if (dayDiff <= 0) dayDiff += 7;

        const nextDate = new Date(today);
        nextDate.setDate(weekStartDate + slot.day_of_week - 1);

        const startTime = new Date(nextDate);
        startTime.setHours(slot.preferred_start_hour || 16, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + slot.slot_duration_minutes);

        try {
          const event = await createEvent({
            title: "Study Session",
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            subject: "General",
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
      await supabase.from('preferred_study_slots').delete().eq('user_id', userId);
      if (slots.length === 0) return true;

      const slotsToInsert = slots.map(({ id, ...slot }) => ({
        user_id: userId,
        day_of_week: slot.day_of_week,
        slot_count: slot.slot_count,
        slot_duration_minutes: slot.slot_duration_minutes,
        preferred_start_hour: slot.preferred_start_hour
      }));

      const { data, error } = await supabase
        .from('preferred_study_slots')
        .insert(slotsToInsert)
        .select();

      if (error) throw new Error(`Database error: ${error.message}`);
      return true;
    } catch (error) {
      throw error;
    }
  };

  return { createCalendarEvents, saveStudySlotsToDatabase };
};
