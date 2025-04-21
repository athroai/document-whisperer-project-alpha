
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = Monday, 7 = Sunday

interface AvailabilitySettingsProps {
  availability: {
    days: number[];
    sessionsPerDay: number;
    sessionDuration: number;
  };
  updateAvailability: (availability: {
    days: number[];
    sessionsPerDay: number;
    sessionDuration: number;
  }) => void;
}

export const AvailabilitySettings: React.FC<AvailabilitySettingsProps> = ({
  availability,
  updateAvailability,
}) => {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: DayOfWeek) => {
    if (availability.days.includes(day)) {
      updateAvailability({
        ...availability,
        days: availability.days.filter(d => d !== day),
      });
    } else {
      updateAvailability({
        ...availability,
        days: [...availability.days, day].sort(),
      });
    }
  };

  const handleSessionsPerDayChange = (value: number[]) => {
    updateAvailability({
      ...availability,
      sessionsPerDay: value[0],
    });
  };

  const handleSessionDurationChange = (duration: number) => {
    updateAvailability({
      ...availability,
      sessionDuration: duration,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Set Your Study Schedule</h2>
        <p className="text-gray-600">
          Choose which days you want to study and how long each session should be.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Which days can you study?</h3>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {dayNames.map((day, index) => {
            const dayNumber = (index + 1) as DayOfWeek;
            const isSelected = availability.days.includes(dayNumber);
            
            return (
              <Button
                key={day}
                variant={isSelected ? "default" : "outline"}
                className={isSelected ? "bg-purple-600 hover:bg-purple-700" : ""}
                onClick={() => toggleDay(dayNumber)}
              >
                {isSelected && <Check className="mr-1 h-4 w-4" />}
                <span className="hidden md:inline">{day}</span>
                <span className="md:hidden">{day.substring(0, 3)}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">How many sessions per day?</h3>
          <div className="flex items-center justify-between">
            <span>Sessions: {availability.sessionsPerDay}</span>
          </div>
          <Slider
            value={[availability.sessionsPerDay]}
            min={1}
            max={5}
            step={1}
            onValueChange={handleSessionsPerDayChange}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>1 session</span>
            <span>5 sessions</span>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">How long should each session be?</h3>
        <RadioGroup
          value={availability.sessionDuration.toString()}
          onValueChange={(value) => handleSessionDurationChange(parseInt(value))}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Label
            htmlFor="session-short"
            className={`flex items-center space-x-2 border rounded-md p-4 cursor-pointer ${
              availability.sessionDuration === 25 ? "border-purple-500 bg-purple-50" : ""
            }`}
          >
            <RadioGroupItem value="25" id="session-short" />
            <div>
              <div className="font-medium">Short</div>
              <div className="text-sm text-gray-500">25 minutes</div>
            </div>
          </Label>
          
          <Label
            htmlFor="session-medium"
            className={`flex items-center space-x-2 border rounded-md p-4 cursor-pointer ${
              availability.sessionDuration === 45 ? "border-purple-500 bg-purple-50" : ""
            }`}
          >
            <RadioGroupItem value="45" id="session-medium" />
            <div>
              <div className="font-medium">Medium</div>
              <div className="text-sm text-gray-500">45 minutes</div>
            </div>
          </Label>
          
          <Label
            htmlFor="session-long"
            className={`flex items-center space-x-2 border rounded-md p-4 cursor-pointer ${
              availability.sessionDuration === 90 ? "border-purple-500 bg-purple-50" : ""
            }`}
          >
            <RadioGroupItem value="90" id="session-long" />
            <div>
              <div className="font-medium">Long</div>
              <div className="text-sm text-gray-500">90 minutes</div>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {availability.days.length === 0 && (
        <div className="bg-amber-50 p-4 rounded-md text-amber-800">
          Please select at least one day to continue.
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="font-medium text-blue-800">Your schedule summary</h4>
        <p className="mt-2">
          You'll study {availability.sessionsPerDay} session{availability.sessionsPerDay > 1 ? 's' : ''} per day, 
          {' '}{availability.sessionDuration} minutes each, on: {' '}
          {availability.days.map(d => dayNames[d-1]).join(', ')}
        </p>
        <p className="mt-1 text-sm text-blue-600">
          Total weekly study time: {availability.days.length * availability.sessionsPerDay * availability.sessionDuration} minutes
        </p>
      </div>
    </div>
  );
};
