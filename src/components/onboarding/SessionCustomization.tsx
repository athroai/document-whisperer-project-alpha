
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Clock, Calendar } from 'lucide-react';

interface SessionCustomizationProps {
  dayName: string;
  sessionIndex: number;
  startHour: number;
  duration: number;
  onStartHourChange: (hour: number) => void;
  onDurationChange: (duration: number) => void;
  onRemoveSession: () => void;
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
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200 mb-3">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-purple-600" />
          <span className="text-sm font-medium">
            {dayName} - Session {sessionIndex + 1}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 h-8 w-8 p-0"
          onClick={onRemoveSession}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Start Time: {formatHour(startHour)}</Label>
          </div>
          <Slider
            value={[startHour]}
            min={9}
            max={21}
            step={0.5}
            onValueChange={(values) => onStartHourChange(values[0])}
            className="my-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>9 AM</span>
            <span>3 PM</span>
            <span>9 PM</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-purple-600" />
            <Label className="text-xs">Duration: {duration} minutes</Label>
          </div>
          <div className="flex justify-between items-center space-x-2">
            {[15, 30, 45, 60, 90].map((mins) => (
              <Button
                key={mins}
                onClick={() => onDurationChange(mins)}
                className={`h-7 px-2 py-1 text-xs rounded-full transition-colors ${
                  duration === mins 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                variant="ghost"
              >
                {mins} min
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
