
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
  // Generate time options from 3 PM to 11 PM (15-23)
  const timeOptions = [];
  for (let hour = 15; hour <= 23; hour++) {
    const hourFormatted = hour.toString().padStart(2, '0');
    const hourDisplay = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
    const halfHourDisplay = hour > 12 ? `${hour - 12}:30 PM` : `${hour}:30 AM`;
    
    timeOptions.push({ value: `${hourFormatted}:00`, label: hourDisplay });
    timeOptions.push({ value: `${hourFormatted}:30`, label: halfHourDisplay });
  }

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
        <Label htmlFor="time">Start Time (3 PM - 11 PM)</Label>
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
