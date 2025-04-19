
import React from 'react';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TimelineSelector } from './TimelineSelector';

interface TimeSlot {
  hour: number;
  minute: number;
}

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

  return (
    <Card className="p-4 mt-2 bg-purple-50 border-purple-200">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-500" />
          <Label className="text-sm font-medium text-purple-800">{dayName} Study Times</Label>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: sessionsCount }).map((_, sessionIndex) => {
            const currentSession = sessionTimes[sessionIndex] || { startHour: 15, durationMinutes: 45 };
            const otherSessions = sessionTimes
              .filter((_, idx) => idx !== sessionIndex)
              .map(session => ({
                startTime: { hour: session.startHour, minute: 0 },
                duration: session.durationMinutes
              }));

            return (
              <TimelineSelector
                key={sessionIndex}
                sessionIndex={sessionIndex}
                startTime={{ hour: currentSession.startHour, minute: 0 }}
                duration={currentSession.durationMinutes}
                minTime={{ hour: 15, minute: 0 }}
                maxTime={{ hour: 22, minute: 0 }}
                onTimeChange={(time) => onSessionTimeChange(dayIndex, sessionIndex, time.hour)}
                onDurationChange={(duration) => onSessionDurationChange(dayIndex, sessionIndex, duration)}
                otherSessions={otherSessions}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
};
