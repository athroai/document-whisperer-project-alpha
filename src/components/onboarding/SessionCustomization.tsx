
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SessionCustomizationProps {
  dayName: string;
  sessionIndex: number;
  startHour: number;
  duration: number;
  onStartHourChange: (hour: number) => void;
  onDurationChange: (minutes: number) => void;
  onRemoveSession?: () => void;
  showRemoveButton?: boolean;
}

export const SessionCustomization: React.FC<SessionCustomizationProps> = ({
  dayName,
  sessionIndex,
  startHour,
  duration,
  onStartHourChange,
  onDurationChange,
  onRemoveSession,
  showRemoveButton = true
}) => {
  // Generate hour options (6am to 10pm)
  const hourOptions = Array.from({ length: 17 }, (_, i) => i + 6);
  
  // Duration options in minutes
  const durationOptions = [15, 20, 30, 45, 60, 90, 120];
  
  // Format hour for display
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Calculate end time for display
  const calculateEndTime = () => {
    let endHour = startHour;
    let endMinutes = duration;
    
    while (endMinutes >= 60) {
      endHour++;
      endMinutes -= 60;
    }
    
    const period = endHour >= 12 ? 'PM' : 'AM';
    const displayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
    
    return `${formatHour(startHour)} - ${displayHour}:${endMinutes === 0 ? '00' : endMinutes} ${period}`;
  };

  return (
    <Card className="p-3 mb-2 border-dashed border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            Session {sessionIndex + 1}
          </Badge>
          <span className="ml-2 text-xs text-gray-500">
            <Clock className="h-3 w-3 inline mr-1" />
            {calculateEndTime()}
          </span>
        </div>
        {showRemoveButton && onRemoveSession && (
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
