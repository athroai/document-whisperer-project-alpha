
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Clock } from 'lucide-react';

interface TimeSelectorProps {
  hour: number;
  minute: number;
  timeString: string;
  onHourChange: (value: number[]) => void;
  onMinuteChange: (value: number[]) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  hour,
  minute,
  timeString,
  onHourChange,
  onMinuteChange
}) => {
  return (
    <div className="col-span-3 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm text-gray-500">Hour: {hour}</Label>
          <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
            <Clock className="h-3 w-3 mr-1 text-gray-500" />
            <span>{timeString}</span>
          </div>
        </div>
        <Slider
          id="hour-slider"
          value={[hour]}
          min={0}
          max={23}
          step={1}
          onValueChange={onHourChange}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-gray-500">Minute: {minute}</Label>
        <Slider
          id="minute-slider"
          value={[minute]}
          min={0}
          max={55}
          step={5}
          onValueChange={onMinuteChange}
        />
      </div>
    </div>
  );
};

export default TimeSelector;
