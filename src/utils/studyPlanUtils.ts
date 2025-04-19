
import { ConfidenceLabel } from '@/types/confidence';
import { supabase } from '@/lib/supabase';
import { addDays, format } from 'date-fns';
import { PreferredStudySlot } from '@/types/study';

export const generateDefaultStudySlots = (userId: string): PreferredStudySlot[] => {
  const defaultSlots = [];
  
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

export const saveStudyPlan = async (
  userId: string,
  subjectDistribution: any[],
  sessions: any[]
) => {
  // Create study plan record
  const { data: planData, error: planError } = await supabase
    .from('study_plans')
    .insert({
      student_id: userId,
      name: 'Personalized Study Plan',
      description: 'AI-generated study plan based on your subject preferences',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
    .select();
  
  if (planError) throw planError;
  if (!planData || planData.length === 0) throw new Error("Failed to create study plan");
  
  const planId = planData[0].id;
  
  // Save calendar events and sessions
  for (const session of sessions) {
    try {
      // Create calendar event
      const { data: eventData, error: eventError } = await supabase
        .from('calendar_events')
        .insert({
          student_id: userId,
          user_id: userId,
          title: `${session.subject} Study Session`,
          description: JSON.stringify({
            subject: session.subject,
            isPomodoro: true,
            pomodoroWorkMinutes: 25,
            pomodoroBreakMinutes: 5
          }),
          event_type: 'study_session',
          start_time: session.startTime.toISOString(),
          end_time: session.endTime.toISOString()
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
            subject: session.subject,
            start_time: session.startTime.toISOString(),
            end_time: session.endTime.toISOString(),
            is_pomodoro: true,
            pomodoro_work_minutes: 25,
            pomodoro_break_minutes: 5,
            calendar_event_id: eventData[0].id
          });
      }
    } catch (err) {
      console.error("Error saving session:", err);
    }
  }
};
