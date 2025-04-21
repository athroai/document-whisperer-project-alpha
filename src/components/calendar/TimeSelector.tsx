
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
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  date,
  startTime,
  duration,
  onDateChange,
  onStartTimeChange,
  onDurationChange
}) => {
  // Generate time options with correct formatting for 24-hour display
  const generateTimeOptions = () => {
    const options = [];
    // Generate times from 9 AM (09:00) to 9 PM (21:00) with half-hour intervals
    for (let hour = 9; hour <= 21; hour++) {
      const hourFormatted = hour.toString().padStart(2, '0');
      
      // Format for display (12-hour format)
      const hourDisplay = hour > 12 ? `${hour - 12}:00 ${hour >= 12 ? 'PM' : 'AM'}` : `${hour}:00 AM`;
      const halfHourDisplay = hour > 12 ? `${hour - 12}:30 ${hour >= 12 ? 'PM' : 'AM'}` : `${hour}:30 AM`;
      
      options.push({ value: `${hourFormatted}:00`, label: hourDisplay });
      options.push({ value: `${hourFormatted}:30`, label: halfHourDisplay });
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input 
          id="date" 
          type="date" 
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="time">Start Time (9 AM - 9 PM)</Label>
        <Select
          value={startTime}
          onValueChange={onStartTimeChange}
        >
          <SelectTrigger id="time">
            <SelectValue placeholder="Select Time" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 col-span-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Select 
          value={duration.toString()} 
          onValueChange={(value) => onDurationChange(parseInt(value, 10))}
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
  );
};

export default TimeSelector;
