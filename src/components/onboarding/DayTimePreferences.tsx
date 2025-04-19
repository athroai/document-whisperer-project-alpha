
import React, { useEffect } from 'react';
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
  // Initialize session times with proper sequence if they aren't already
  useEffect(() => {
    if (isSelected && sessionTimes.length > 1) {
      // Check if sessions need reordering (ensure session 1 starts earliest)
      const needsReordering = sessionTimes.some((session, index) => {
        if (index === 0) return false;
        // Check if any later session starts before an earlier one
        return session.startHour < sessionTimes[index - 1].startHour;
      });
      
      if (needsReordering) {
        // Sort sessions by start time and apply sequential times
        const baseStartHour = 15; // Start with 3 PM for first session
        sessionTimes.forEach((_, index) => {
          // Add 1.5 hours between sessions
          const newStartHour = Math.min(21, baseStartHour + (index * 1.5));
          onSessionTimeChange(dayIndex, index, Math.floor(newStartHour));
        });
      }
    }
  }, [isSelected, sessionTimes, sessionsCount, dayIndex, onSessionTimeChange]);

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
            const currentSession = sessionTimes[sessionIndex] || { 
              startHour: 15 + sessionIndex, // Stagger start times by default
              durationMinutes: 45 
            };
            
            // Filter sessions that come before and after this one for constraints
            const previousSessions = sessionTimes
              .filter((_, idx) => idx < sessionIndex)
              .map(session => ({
                startTime: { hour: session.startHour, minute: 0 },
                duration: session.durationMinutes
              }));
              
            const nextSessions = sessionTimes
              .filter((_, idx) => idx > sessionIndex)
              .map(session => ({
                startTime: { hour: session.startHour, minute: 0 },
                duration: session.durationMinutes
              }));
              
            const otherSessions = [...previousSessions, ...nextSessions];

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
