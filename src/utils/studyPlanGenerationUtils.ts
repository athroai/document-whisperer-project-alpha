
import { format, addDays } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { PreferredStudySlot } from '@/types/study';

export const calculateSessionsPerWeek = (score: number | undefined) => {
  if (score === undefined) return 3;

  if (score < 50) return 4;
  if (score <= 80) return Math.round(3.5 - (score - 50) * 0.03);
  return 1;
};

export const generateDefaultStudySlots = (userId: string): PreferredStudySlot[] => {
  if (!userId) return [];
  
  const defaultSlots: PreferredStudySlot[] = [];
  
  for (let day = 1; day <= 5; day++) {
    defaultSlots.push({
      id: `default-${day}`,
      user_id: userId,
      day_of_week: day,
      slot_count: 2,
      slot_duration_minutes: 45,
      preferred_start_hour: 16
    });
  }
  
  return defaultSlots;
};

export const createCalendarEvents = async (
  userId: string, 
  planId: string, 
  sessionDistribution: any[], 
  studySlots: PreferredStudySlot[]
) => {
  const today = new Date();
  const savedEvents = [];
  
  const sortedSlots = [...studySlots].sort((a, b) => a.day_of_week - b.day_of_week);
  
  let createdSessions = 0;
  const totalSessions = sessionDistribution.reduce((sum, item) => sum + item.sessionsPerWeek, 0);
  
  let slotIndex = 0;
  for (const subjectData of sessionDistribution) {
    for (let i = 0; i < subjectData.sessionsPerWeek; i++) {
      if (slotIndex >= sortedSlots.length) {
        slotIndex = 0;
      }
      
      const slot = sortedSlots[slotIndex];
      
      const currentDay = today.getDay();
      const targetDay = slot.day_of_week;
      
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      
      daysToAdd += Math.floor(createdSessions / sortedSlots.length) * 7;
      
      const sessionDate = addDays(today, daysToAdd);
      const startHour = slot.preferred_start_hour || 9;
      
      const startTime = new Date(sessionDate);
      startTime.setHours(startHour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + slot.slot_duration_minutes);
      
      const eventDescription = JSON.stringify({
        subject: subjectData.subject,
        topic: null,
        isPomodoro: true,
        pomodoroWorkMinutes: Math.min(slot.slot_duration_minutes, 25),
        pomodoroBreakMinutes: 5
      });

      let sessionTitle = `${subjectData.subject} Study Session`;
      if (subjectData.score !== undefined) {
        if (subjectData.score < 50) {
          sessionTitle = `${subjectData.subject} Intensive Review`;
        } else if (subjectData.score < 80) {
          sessionTitle = `${subjectData.subject} Practice`;
        } else {
          sessionTitle = `${subjectData.subject} Mastery`;
        }
      }
      
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('calendar_events')
          .insert({
            student_id: userId,
            user_id: userId,
            title: sessionTitle,
            description: eventDescription,
            event_type: 'study_session',
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString()
          })
          .select();
          
        if (eventError) {
          console.error('Error creating calendar event:', eventError);
          continue;
        }
        
        if (eventData && eventData.length > 0) {
          await supabase
            .from('study_plan_sessions')
            .insert({
              plan_id: planId,
              subject: subjectData.subject,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
              is_pomodoro: true,
              pomodoro_work_minutes: Math.min(slot.slot_duration_minutes, 25),
              pomodoro_break_minutes: 5,
              calendar_event_id: eventData[0].id
            }).then(({ error }) => {
              if (error) console.error('Error creating study plan session:', error);
            });
            
          savedEvents.push({
            ...eventData[0],
            subject: subjectData.subject,
            formattedStart: format(startTime, 'EEEE, h:mm a'),
            formattedEnd: format(endTime, 'h:mm a')
          });
        }
      } catch (err) {
        console.error('Error creating events:', err);
      }
      
      slotIndex++;
      createdSessions++;
    }
  }
  
  return savedEvents;
};

export const createStudyPlan = async (userId: string) => {
  const { data, error } = await supabase
    .from('study_plans')
    .insert({
      student_id: userId,
      name: 'Personalized Study Plan',
      description: 'AI-generated study plan based on your subject preferences and quiz results',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
    .select();

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Failed to create study plan");
  
  return data[0];
};

