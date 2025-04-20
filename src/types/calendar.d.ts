
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic?: string;
  start_time: string;
  end_time: string;
  event_type: string;
  user_id?: string;
  student_id?: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}
