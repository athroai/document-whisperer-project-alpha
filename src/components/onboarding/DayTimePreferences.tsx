
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
  // Enforce chronological order of session times
  useEffect(() => {
    if (isSelected && sessionTimes.length > 1) {
      // Create a sorted copy of the session times
      const sortedTimes = [...sessionTimes].sort((a, b) => a.startHour - b.startHour);
      
      // Check if any times need to be updated to maintain chronological order
      let needsUpdate = false;
      for (let i = 0; i < sortedTimes.length; i++) {
        if (sortedTimes[i].startHour !== sessionTimes[i].startHour) {
          needsUpdate = true;
          break;
        }
      }
      
      // Update all sessions if order needs to be enforced
      if (needsUpdate) {
        sortedTimes.forEach((session, index) => {
          onSessionTimeChange(dayIndex, index, session.startHour);
        });
      }
    }
  }, [isSelected, sessionTimes, dayIndex, onSessionTimeChange]);

  // Add validation to prevent later sessions from being scheduled before earlier ones
  const handleTimeChange = (sessionIndex: number, time: TimeSlot) => {
    // Get minimum allowed time (time of previous session + duration in hours)
    let minTime = 15; // Default minimum (3 PM)
    if (sessionIndex > 0 && sessionTimes[sessionIndex - 1]) {
      const prevSession = sessionTimes[sessionIndex - 1];
      const prevEndHour = prevSession.startHour + (prevSession.durationMinutes / 60);
      minTime = Math.max(15, Math.ceil(prevEndHour));
    }
    
    // Get maximum allowed time (time that won't push into next session)
    let maxTime = 22; // Default maximum (10 PM)
    
    // Apply constraints
    const adjustedHour = Math.max(minTime, Math.min(maxTime, time.hour));
    
    onSessionTimeChange(dayIndex, sessionIndex, adjustedHour);
  };

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
            
            // Calculate minimum time based on previous session
            let minTimeHour = 15; // Default 3 PM
            if (sessionIndex > 0 && sessionTimes[sessionIndex - 1]) {
              const prevSession = sessionTimes[sessionIndex - 1];
              const prevDurationHours = prevSession.durationMinutes / 60;
              minTimeHour = Math.max(15, Math.ceil(prevSession.startHour + prevDurationHours));
            }
            
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
                minTime={{ hour: minTimeHour, minute: 0 }}
                maxTime={{ hour: 22, minute: 0 }}
                onTimeChange={(time) => handleTimeChange(sessionIndex, time)}
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
