
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SessionCustomization } from './SessionCustomization';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DayTimePreferencesProps {
  dayIndex: number;
  dayName: string;
  isSelected: boolean;
  sessionsCount: number;
  sessionTimes: { startHour: number; durationMinutes: number }[];
  onSessionTimeChange: (dayIndex: number, sessionIndex: number, hour: number) => void;
  onSessionDurationChange: (dayIndex: number, sessionIndex: number, minutes: number) => void;
  onAddSession?: (dayIndex: number) => void;
  onRemoveSession?: (dayIndex: number, sessionIndex: number) => void;
}

export const DayTimePreferences: React.FC<DayTimePreferencesProps> = ({
  dayIndex,
  dayName,
  isSelected,
  sessionTimes,
  onSessionTimeChange,
  onSessionDurationChange,
  onAddSession,
  onRemoveSession
}) => {
  if (!isSelected) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between items-center">
          <span>{dayName}</span>
          {onAddSession && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2"
              onClick={() => onAddSession(dayIndex)}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs">Add Session</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {sessionTimes.map((session, sessionIndex) => (
            <SessionCustomization
              key={`${dayIndex}-${sessionIndex}`}
              dayName={dayName}
              sessionIndex={sessionIndex}
              startHour={session.startHour}
              duration={session.durationMinutes}
              onStartHourChange={(hour) => onSessionTimeChange(dayIndex, sessionIndex, hour)}
              onDurationChange={(mins) => onSessionDurationChange(dayIndex, sessionIndex, mins)}
              onRemoveSession={() => onRemoveSession ? onRemoveSession(dayIndex, sessionIndex) : null}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
