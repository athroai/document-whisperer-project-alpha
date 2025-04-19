
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Value } from '@radix-ui/react-slider';
import { Slider } from '@/components/ui/slider';

interface SessionTime {
  startHour: number;
  durationMinutes: number;
}

interface DayTimePreferencesProps {
  dayIndex: number;
  dayName: string;
  isSelected: boolean;
  sessionsCount: number;
  sessionTimes: SessionTime[];
  onSessionTimeChange: (dayIndex: number, sessionIndex: number, hour: number) => void;
  onSessionDurationChange: (dayIndex: number, sessionIndex: number, minutes: number) => void;
}

export const DayTimePreferences: React.FC<DayTimePreferencesProps> = ({
  dayIndex,
  dayName,
  isSelected,
  sessionsCount,
  sessionTimes,
  onSessionTimeChange,
  onSessionDurationChange,
}) => {
  if (!isSelected) return null;

  const timeOptions = Array.from({ length: 9 }, (_, i) => i + 15); // 3 PM to 11 PM

  return (
    <Card className="p-4 mt-2 bg-purple-50 border-purple-200">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-purple-800">{dayName} Study Times</Label>
        <div className="space-y-4">
          {Array.from({ length: sessionsCount }).map((_, sessionIndex) => (
            <div key={sessionIndex} className="space-y-2 border-b border-purple-100 pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Session {sessionIndex + 1}</span>
                </div>
                <span className="text-xs text-purple-600">
                  {sessionTimes[sessionIndex]?.durationMinutes || 45} minutes
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-purple-700 mb-1 block">Start Time</Label>
                  <Select
                    value={sessionTimes[sessionIndex]?.startHour?.toString()}
                    onValueChange={(value) => onSessionTimeChange(dayIndex, sessionIndex, parseInt(value))}
                  >
                    <SelectTrigger className="w-full bg-white">
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
                
                <div>
                  <Label className="text-xs text-purple-700 mb-1 block">Duration</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[sessionTimes[sessionIndex]?.durationMinutes || 45]}
                      min={15}
                      max={120}
                      step={15}
                      className="flex-1"
                      onValueChange={(value: Value) => 
                        onSessionDurationChange(dayIndex, sessionIndex, value[0])
                      }
                    />
                  </div>
                </div>
              </div>
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
