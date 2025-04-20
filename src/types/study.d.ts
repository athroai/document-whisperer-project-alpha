
export interface PreferredStudySlot {
  id: string;
  user_id: string;
  day_of_week: number;
  slot_count: number;
  slot_duration_minutes: number;
  preferred_start_hour: number;
  created_at?: string;
}

export interface SlotOption {
  name: string;
  count: number;
  duration: number;
  color: string;
  icon: React.ComponentType<any>;
}
