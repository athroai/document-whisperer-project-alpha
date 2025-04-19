
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TimeSlot {
  hour: number;
  minute: number;
}

interface TimelineSelectorProps {
  startTime: TimeSlot;
  duration: number;
  sessionIndex: number;
  minTime: TimeSlot;
  maxTime: TimeSlot;
  onTimeChange: (time: TimeSlot) => void;
  onDurationChange: (duration: number) => void;
  otherSessions?: Array<{startTime: TimeSlot; duration: number}>;
}

export const TimelineSelector: React.FC<TimelineSelectorProps> = ({
  startTime,
  duration,
  sessionIndex,
  minTime,
  maxTime,
  onTimeChange,
  onDurationChange,
  otherSessions = []
}) => {
  const timeToMinutes = (time: TimeSlot) => time.hour * 60 + time.minute;
  const minutesToTime = (minutes: number): TimeSlot => ({
    hour: Math.floor(minutes / 60),
    minute: minutes % 60
  });

  const totalMinutes = (maxTime.hour - minTime.hour + 1) * 60;
  const timelineStart = timeToMinutes(minTime);
  const timelineEnd = timeToMinutes(maxTime);
  const currentPosition = ((timeToMinutes(startTime) - timelineStart) / (timelineEnd - timelineStart)) * 100;
  
  const intervals = Array.from({ length: totalMinutes / 20 }, (_, i) => {
    const minutes = timelineStart + (i * 20);
    return minutesToTime(minutes);
  });

  const isTimeRespectingOrder = (time: TimeSlot) => {
    const proposedMinutes = timeToMinutes(time);
    
    // Check if time respects session order
    // Earlier sessions can't start after later ones
    const earlierSessions = otherSessions.filter(s => {
      const sessionInfo = sessionLabels[sessionIndex];
      const thisSessionNumber = sessionInfo ? parseInt(sessionInfo.replace('Session ', '')) : sessionIndex + 1;
      
      // Find the corresponding session number for the other session
      const otherSessionIndex = otherSessions.indexOf(s);
      const otherSessionInfo = sessionLabels[otherSessionIndex];
      const otherSessionNumber = otherSessionInfo ? 
        parseInt(otherSessionInfo.replace('Session ', '')) : 
        otherSessionIndex + 1;
        
      return otherSessionNumber < thisSessionNumber;
    });
    
    // Later sessions can't start before earlier ones
    const laterSessions = otherSessions.filter(s => {
      const sessionInfo = sessionLabels[sessionIndex];
      const thisSessionNumber = sessionInfo ? parseInt(sessionInfo.replace('Session ', '')) : sessionIndex + 1;
      
      // Find the corresponding session number for the other session
      const otherSessionIndex = otherSessions.indexOf(s);
      const otherSessionInfo = sessionLabels[otherSessionIndex];
      const otherSessionNumber = otherSessionInfo ? 
        parseInt(otherSessionInfo.replace('Session ', '')) : 
        otherSessionIndex + 1;
        
      return otherSessionNumber > thisSessionNumber;
    });
    
    // Can't overlap with any other sessions
    for (const session of otherSessions) {
      const sessionStart = timeToMinutes(session.startTime);
      const sessionEnd = sessionStart + session.duration;
      
      const proposedEnd = proposedMinutes + duration;
      
      if (
        (proposedMinutes >= sessionStart && proposedMinutes < sessionEnd) || 
        (proposedEnd > sessionStart && proposedEnd <= sessionEnd) ||
        (proposedMinutes <= sessionStart && proposedEnd >= sessionEnd)
      ) {
        return false;
      }
    }

    // For earlier sessions, make sure we're before any later sessions
    for (const laterSession of laterSessions) {
      if (proposedMinutes > timeToMinutes(laterSession.startTime)) {
        return false;
      }
    }
    
    // For later sessions, make sure we're after any earlier sessions
    for (const earlierSession of earlierSessions) {
      if (proposedMinutes < timeToMinutes(earlierSession.startTime) + earlierSession.duration) {
        return false;
      }
    }

    return true;
  };

  const handleTimeClick = (time: TimeSlot) => {
    if (isTimeRespectingOrder(time)) {
      onTimeChange(time);
    }
  };

  const formatTime = (time: TimeSlot) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  };

  // Create labels for sessions
  const sessionLabels = ["Session 1", "Session 2", "Session 3", "Session 4", "Session 5", "Session 6"];

  return (
    <Card className="p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium text-purple-700">{sessionLabels[sessionIndex]}</Label>
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
            {formatTime(startTime)} - {formatTime(minutesToTime(timeToMinutes(startTime) + duration))}
          </span>
        </div>
        
        <div className="relative h-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex">
              {intervals.map((time, i) => (
                <div
                  key={`${time.hour}-${time.minute}`}
                  className="flex-1 border-l border-purple-200 first:border-l-0"
                  onClick={() => handleTimeClick(time)}
                >
                  <div className={cn(
                    "text-[10px] text-purple-600 -ml-[10px] font-medium transition-opacity",
                    time.minute === 0 ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                  )}>
                    {time.hour}:00
                  </div>
                </div>
              ))}
            </div>

            {otherSessions.map((session, idx) => {
              const sessionStart = ((timeToMinutes(session.startTime) - timelineStart) / (timelineEnd - timelineStart)) * 100;
              const sessionWidth = (session.duration / (timelineEnd - timelineStart)) * 100;
              return (
                <div
                  key={idx}
                  className="absolute h-full bg-purple-200 opacity-30"
                  style={{
                    left: `${sessionStart}%`,
                    width: `${sessionWidth}%`
                  }}
                />
              );
            })}

            <div
              className="absolute h-full bg-purple-500/20 backdrop-blur-sm cursor-move rounded-md 
                         shadow-sm hover:shadow-md transition-all duration-200 border border-purple-300
                         hover:bg-purple-500/30"
              style={{
                left: `${currentPosition}%`,
                width: `${(duration / (timelineEnd - timelineStart)) * 100}%`
              }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', '');
              }}
              onDrag={(e) => {
                if (!e.clientX) return;
                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                if (!rect) return;
                
                const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                const minutes = Math.round((percentage * (timelineEnd - timelineStart) / 100 + timelineStart) / 20) * 20;
                const newTime = minutesToTime(minutes);
                
                if (isTimeRespectingOrder(newTime)) {
                  onTimeChange(newTime);
                }
              }}
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[20, 30, 45, 60, 90, 120].map((mins) => (
            <button
              key={mins}
              onClick={() => onDurationChange(mins)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full transition-all duration-200",
                duration === mins
                  ? "bg-purple-100 text-purple-700 font-medium ring-2 ring-purple-200 ring-offset-2"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};
