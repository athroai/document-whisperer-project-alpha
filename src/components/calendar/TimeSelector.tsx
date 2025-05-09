import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar } from 'lucide-react';
import { isAfter, isBefore, parseISO, addMinutes, isWithinInterval, startOfToday, areIntervalsOverlapping } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarEvent } from '@/types/calendar';
import { TIME_RANGE } from './time/TimeRange';

interface TimeSelectorProps {
  date: string;
  startTime: string;
  duration: number;
  onDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  existingTimes?: string[];
  errorMessage?: string | null;
  checkConflicts?: (date: string, time: string, duration: number) => boolean;
  existingEvents?: CalendarEvent[];
  currentEventId?: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  date,
  startTime,
  duration,
  onDateChange,
  onStartTimeChange,
  onDurationChange,
  existingTimes = [],
  errorMessage = null,
  checkConflicts,
  existingEvents = [],
  currentEventId
}) => {
  const [liveErrorMessage, setLiveErrorMessage] = useState<string | null>(errorMessage);
  
  useEffect(() => {
    setLiveErrorMessage(errorMessage);
  }, [errorMessage]);

  const isTimeUnavailable = (timeOption: { value: string; label: string }) => {
    const selectedDateTime = new Date(`${date}T${timeOption.value}`);
    const now = new Date();
    
    if (isBefore(selectedDateTime, now)) {
      return { unavailable: true, reason: 'This time has already passed' };
    }

    if (checkConflicts && checkConflicts(date, timeOption.value, duration)) {
      return { unavailable: true, reason: 'This time conflicts with another session' };
    }

    if (existingEvents.length > 0) {
      const selectedEndTime = addMinutes(selectedDateTime, duration);
      
      const selectedInterval = { start: selectedDateTime, end: selectedEndTime };
      
      const conflictingEvent = existingEvents.find(event => {
        if (currentEventId && event.id === currentEventId) {
          return false;
        }
        
        const eventStart = new Date(event.start_time);
        const eventEnd = new Date(event.end_time);
        
        return areIntervalsOverlapping(
          { start: eventStart, end: eventEnd },
          selectedInterval
        );
      });
      
      if (conflictingEvent) {
        return { unavailable: true, reason: `Conflicts with "${conflictingEvent.title}" session` };
      }
    }

    return { unavailable: false, reason: '' };
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = TIME_RANGE.START_HOUR; hour <= TIME_RANGE.END_HOUR; hour++) {
      const hourFormatted = hour.toString().padStart(2, '0');
      const displayHour = TIME_RANGE.FORMAT_24H ? hour : (hour > 12 ? hour - 12 : hour);
      const amPm = hour >= 12 ? 'PM' : 'AM';
      const displayTime = TIME_RANGE.FORMAT_24H ? 
        `${hourFormatted}:00` : 
        `${displayHour}:00 ${amPm}`;
      const displayHalfTime = TIME_RANGE.FORMAT_24H ? 
        `${hourFormatted}:30` : 
        `${displayHour}:30 ${amPm}`;
      
      options.push({ 
        value: `${hourFormatted}:00`, 
        label: displayTime 
      });
      
      if (hour < TIME_RANGE.END_HOUR) {
        options.push({ 
          value: `${hourFormatted}:30`, 
          label: displayHalfTime 
        });
      }
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();

  const handleTimeChange = (newTime: string) => {
    const timeOption = timeOptions.find(opt => opt.value === newTime);
    if (timeOption) {
      const { unavailable, reason } = isTimeUnavailable(timeOption);
      if (unavailable) {
        setLiveErrorMessage(reason);
        return;
      }
    }
    
    onStartTimeChange(newTime);
    setLiveErrorMessage(null);
  };

  const handleDurationChange = (newDuration: number) => {
    const selectedTime = timeOptions.find(opt => opt.value === startTime);
    if (selectedTime) {
      const updatedDuration = parseInt(newDuration.toString(), 10);
      const selectedDateTime = new Date(`${date}T${startTime}`);
      const selectedEndTime = addMinutes(selectedDateTime, updatedDuration);
      
      if (existingEvents.length > 0) {
        for (const event of existingEvents) {
          if (currentEventId && event.id === currentEventId) continue;
          
          const eventStart = new Date(event.start_time);
          const eventEnd = new Date(event.end_time);
          
          if (areIntervalsOverlapping(
            { start: selectedDateTime, end: selectedEndTime },
            { start: eventStart, end: eventEnd }
          )) {
            setLiveErrorMessage(`New duration would conflict with "${event.title}" session`);
            return;
          }
        }
      }
    }
    
    onDurationChange(newDuration);
    setLiveErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Date
        </Label>
        <Input 
          id="date" 
          type="date" 
          value={date}
          min={startOfToday().toISOString().split('T')[0]}
          onChange={(e) => {
            onDateChange(e.target.value);
            setLiveErrorMessage(null);
          }}
          className="w-full"
        />
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Start Time
          </Label>
          <TooltipProvider>
            <Select
              value={startTime}
              onValueChange={handleTimeChange}
              name="startTime"
            >
              <SelectTrigger id="time" className="w-full">
                <SelectValue placeholder="Select Time" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-[300px] z-50">
                {timeOptions.map((option) => {
                  const { unavailable, reason } = isTimeUnavailable(option);
                  return (
                    <Tooltip key={option.value}>
                      <TooltipTrigger asChild>
                        <div>
                          <SelectItem
                            value={option.value}
                            disabled={unavailable}
                            className={cn(
                              unavailable && "opacity-50 cursor-not-allowed bg-gray-100"
                            )}
                          >
                            {option.label}
                          </SelectItem>
                        </div>
                      </TooltipTrigger>
                      {unavailable && (
                        <TooltipContent side="right" className="z-50">
                          <p>{reason}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </SelectContent>
            </Select>
          </TooltipProvider>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
          <Select 
            value={duration.toString()} 
            onValueChange={(value) => handleDurationChange(parseInt(value, 10))}
            name="duration"
          >
            <SelectTrigger id="duration">
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {liveErrorMessage && (
        <p className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200 mt-2">
          {liveErrorMessage}
        </p>
      )}
    </div>
  );
};

export default TimeSelector;
