
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar } from 'lucide-react';

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
  checkConflicts
}) => {
  const [liveErrorMessage, setLiveErrorMessage] = useState<string | null>(errorMessage);
  
  useEffect(() => {
    setLiveErrorMessage(errorMessage);
  }, [errorMessage]);

  const generateTimeOptions = () => {
    const options = [];
    // Generate times from 7 AM (07:00) to 10 PM (22:00) with half-hour intervals
    for (let hour = 7; hour <= 22; hour++) {
      const hourFormatted = hour.toString().padStart(2, '0');
      const hourDisplay = hour > 12 ? `${hour - 12}:00 ${hour >= 12 ? 'PM' : 'AM'}` : `${hour}:00 AM`;
      const halfHourDisplay = hour > 12 ? `${hour - 12}:30 ${hour >= 12 ? 'PM' : 'AM'}` : `${hour}:30 AM`;
      
      options.push({ value: `${hourFormatted}:00`, label: hourDisplay });
      if (hour < 22) { // Don't add :30 for 10 PM
        options.push({ value: `${hourFormatted}:30`, label: halfHourDisplay });
      }
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();

  const handleTimeChange = (newTime: string) => {
    onStartTimeChange(newTime);
    
    if (checkConflicts && newTime) {
      const hasConflict = checkConflicts(date, newTime, duration);
      if (hasConflict) {
        setLiveErrorMessage("This time slot overlaps with an existing session");
      } else {
        setLiveErrorMessage(null);
      }
    }
  };

  const handleDurationChange = (newDuration: number) => {
    onDurationChange(newDuration);
    
    if (checkConflicts && startTime) {
      const hasConflict = checkConflicts(date, startTime, newDuration);
      if (hasConflict) {
        setLiveErrorMessage("This duration causes an overlap with an existing session");
      } else {
        setLiveErrorMessage(null);
      }
    }
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
          <Select
            value={startTime}
            onValueChange={handleTimeChange}
          >
            <SelectTrigger id="time" className="w-full">
              <SelectValue placeholder="Select Time" />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-[300px]">
              {timeOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
          <Select 
            value={duration.toString()} 
            onValueChange={(value) => handleDurationChange(parseInt(value, 10))}
          >
            <SelectTrigger id="duration">
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
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
