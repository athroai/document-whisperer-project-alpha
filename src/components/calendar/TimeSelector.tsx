
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeSelectorProps {
  date: string;
  startTime: string;
  duration: number;
  onDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onDurationChange: (value: number) => void;
  existingTimes?: string[];
  errorMessage?: string | null;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  date,
  startTime,
  duration,
  onDateChange,
  onStartTimeChange,
  onDurationChange,
  existingTimes = [],
  errorMessage = null
}) => {
  // Generate time options from 7 AM to 10 PM with half-hour intervals
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

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input 
          id="date" 
          type="date" 
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="time">Start Time (7 AM - 10 PM)</Label>
        <Select
          value={startTime}
          onValueChange={onStartTimeChange}
        >
          <SelectTrigger id="time" className="w-full">
            <SelectValue placeholder="Select Time" />
          </SelectTrigger>
          <SelectContent>
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
        {errorMessage && (
          <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="duration">Duration</Label>
        <Select 
          value={duration.toString()} 
          onValueChange={(value) => onDurationChange(parseInt(value, 10))}
        >
          <SelectTrigger id="duration" className="w-full">
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
  );
};

export default TimeSelector;
