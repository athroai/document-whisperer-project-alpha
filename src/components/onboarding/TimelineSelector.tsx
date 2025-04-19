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

  const isTimeAvailable = (time: TimeSlot) => {
    const proposedStart = timeToMinutes(time);
    const proposedEnd = proposedStart + duration;
    
    return !otherSessions.some((session) => {
      const sessionStart = timeToMinutes(session.startTime);
      const sessionEnd = sessionStart + session.duration;
      return (
        (proposedStart >= sessionStart && proposedStart < sessionEnd) ||
        (proposedEnd > sessionStart && proposedEnd <= sessionEnd)
      );
    });
  };

  const handleTimeClick = (time: TimeSlot) => {
    if (isTimeAvailable(time)) {
      onTimeChange(time);
    }
  };

  const formatTime = (time: TimeSlot) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 bg-white">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Session {sessionIndex + 1}</Label>
          <span className="text-xs text-purple-600">
            {formatTime(startTime)} - {formatTime(minutesToTime(timeToMinutes(startTime) + duration))}
          </span>
        </div>
        
        <div className="relative h-12 bg-gray-100 rounded-lg">
          {/* Timeline markers */}
          <div className="absolute inset-0 flex">
            {intervals.map((time, i) => (
              <div
                key={`${time.hour}-${time.minute}`}
                className="flex-1 border-l border-gray-200 first:border-l-0"
                onClick={() => handleTimeClick(time)}
              >
                <div className={cn(
                  "text-[10px] text-gray-500 -ml-[10px]",
                  time.minute === 0 ? "font-medium" : "hidden"
                )}>
                  {time.hour}:00
                </div>
              </div>
            ))}
          </div>

          {/* Other sessions */}
          {otherSessions.map((session, idx) => {
            const sessionStart = ((timeToMinutes(session.startTime) - timelineStart) / (timelineEnd - timelineStart)) * 100;
            const sessionWidth = (session.duration / (timelineEnd - timelineStart)) * 100;
            return (
              <div
                key={idx}
                className="absolute h-full bg-gray-200 opacity-50"
                style={{
                  left: `${sessionStart}%`,
                  width: `${sessionWidth}%`
                }}
              />
            );
          })}

          {/* Current session */}
          <div
            className="absolute h-full bg-purple-200 cursor-move rounded"
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
              
              if (isTimeAvailable(newTime)) {
                onTimeChange(newTime);
              }
            }}
          />
        </div>

        {/* Duration controls */}
        <div className="flex gap-2">
          {[20, 30, 45, 60, 90, 120].map((mins) => (
            <button
              key={mins}
              onClick={() => onDurationChange(mins)}
              className={cn(
                "px-2 py-1 text-xs rounded",
                duration === mins
                  ? "bg-purple-100 text-purple-700 font-medium"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
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
