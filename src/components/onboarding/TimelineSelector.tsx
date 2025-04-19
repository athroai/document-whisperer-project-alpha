
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface TimeSlot {
  hour: number;
  minute: number;
}

interface Session {
  startTime: TimeSlot;
  duration: number;
}

interface TimelineSelectorProps {
  sessionIndex: number;
  startTime: TimeSlot;
  duration: number;
  minTime: TimeSlot;
  maxTime: TimeSlot;
  onTimeChange: (time: TimeSlot) => void;
  onDurationChange: (duration: number) => void;
  otherSessions: Session[];
}

export const TimelineSelector: React.FC<TimelineSelectorProps> = ({
  sessionIndex,
  startTime,
  duration,
  minTime,
  maxTime,
  onTimeChange,
  onDurationChange,
  otherSessions
}) => {
  // Convert hour to slider value (0-24 range)
  const hourToSliderValue = (hour: number) => {
    return Math.max(minTime.hour, Math.min(maxTime.hour, hour));
  };

  // Convert slider value back to hour
  const sliderValueToHour = (value: number) => {
    return Math.round(value);
  };

  const handleTimeChange = (values: number[]) => {
    const hour = sliderValueToHour(values[0]);
    onTimeChange({ hour, minute: 0 });
  };

  const handleDurationChange = (values: number[]) => {
    onDurationChange(values[0]);
  };

  // Format time for display
  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour} ${period}`;
  };

  // Calculate the min and max values for the time slider
  const timeMin = hourToSliderValue(minTime.hour);
  const timeMax = hourToSliderValue(maxTime.hour);
  
  // Duration options: 15, 30, 45, 60, 90 minutes
  const durationOptions = [15, 30, 45, 60, 90];

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Study Session {sessionIndex + 1} - {formatTime(startTime.hour)}
            </span>
            <span className="text-xs text-purple-600">{duration} minutes</span>
          </div>
          
          <div className="mt-6 mb-2">
            <Slider 
              value={[hourToSliderValue(startTime.hour)]}
              min={timeMin}
              max={timeMax}
              step={0.5}
              onValueChange={handleTimeChange}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(timeMin)}</span>
              <span>{formatTime((timeMin + timeMax) / 2)}</span>
              <span>{formatTime(timeMax)}</span>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Duration</span>
          </div>
          <div className="flex justify-between items-center space-x-2">
            {durationOptions.map((option) => (
              <button
                key={option}
                onClick={() => onDurationChange(option)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  duration === option 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option} min
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
