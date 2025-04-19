
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  topic?: string;
  start_time: string;
  end_time: string;
  event_type: string;
  user_id?: string;
  student_id?: string;
  local_only?: boolean;
}

export interface EventStyleOptions {
  className: string;
  style: {
    border: string;
  };
}
