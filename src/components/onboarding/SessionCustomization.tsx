
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SessionCustomizationProps {
  dayName: string;
  sessionIndex: number;
  startHour: number;
  duration: number;
  onStartHourChange: (hour: number) => void;
  onDurationChange: (minutes: number) => void;
  onRemoveSession?: () => void;
}

export const SessionCustomization: React.FC<SessionCustomizationProps> = ({
  dayName,
  sessionIndex,
  startHour,
  duration,
  onStartHourChange,
  onDurationChange,
  onRemoveSession
}) => {
  // Generate hour options (6am to 10pm)
  const hourOptions = Array.from({ length: 17 }, (_, i) => i + 6);
  
  // Duration options in minutes
  const durationOptions = [15, 20, 30, 45, 60, 90, 120];
  
  // Format hour for display
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <Card className="p-3 mb-2 border-dashed border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Session {sessionIndex + 1}</span>
        {onRemoveSession && (
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={onRemoveSession}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Start Time</Label>
          <Select 
            value={startHour.toString()} 
            onValueChange={value => onStartHourChange(parseInt(value))}
          >
            <SelectTrigger className="text-sm h-8">
              <SelectValue placeholder="Start time" />
            </SelectTrigger>
            <SelectContent>
              {hourOptions.map(hour => (
                <SelectItem key={hour} value={hour.toString()}>
                  {formatHour(hour)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Duration</Label>
          <Select 
            value={duration.toString()} 
            onValueChange={value => onDurationChange(parseInt(value))}
          >
            <SelectTrigger className="text-sm h-8">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map(mins => (
                <SelectItem key={mins} value={mins.toString()}>
                  {mins} min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
