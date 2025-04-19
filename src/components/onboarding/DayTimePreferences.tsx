
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SessionTime {
  startHour: number;
}

interface DayTimePreferencesProps {
  dayIndex: number;
  dayName: string;
  isSelected: boolean;
  sessionsCount: number;
  sessionTimes: SessionTime[];
  onSessionTimeChange: (dayIndex: number, sessionIndex: number, hour: number) => void;
}

export const DayTimePreferences: React.FC<DayTimePreferencesProps> = ({
  dayIndex,
  dayName,
  isSelected,
  sessionsCount,
  sessionTimes,
  onSessionTimeChange,
}) => {
  if (!isSelected) return null;

  const timeOptions = Array.from({ length: 9 }, (_, i) => i + 15); // 3 PM to 11 PM

  return (
    <Card className="p-4 mt-2 bg-purple-50 border-purple-200">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-purple-800">{dayName} Study Times</Label>
        <div className="space-y-2">
          {Array.from({ length: sessionsCount }).map((_, sessionIndex) => (
            <div key={sessionIndex} className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <Select
                value={sessionTimes[sessionIndex]?.startHour?.toString()}
                onValueChange={(value) => onSessionTimeChange(dayIndex, sessionIndex, parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {formatHour(hour)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}
