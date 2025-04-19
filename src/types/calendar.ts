
export interface CalendarEvent {
  id: string;
  title: string;
  subject?: string;
  topic?: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: string;
  user_id?: string;
  student_id?: string;
  local_only?: boolean;
  suggested?: boolean;
}
