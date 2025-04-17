
import { LucideIcon } from 'lucide-react';

export interface SlotOption {
  name: string;
  count: number;
  duration: number;
  icon: LucideIcon;
  color: string;
}

export interface DayPreference {
  dayOfWeek: number;
  slotOption: number | null;
  preferredStartHour: number;
}
