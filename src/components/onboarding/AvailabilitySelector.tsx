
import React, { useState } from 'react';
import { Availability } from '@/types/study';

// Component to select availability for days of the week
const AvailabilitySelector = ({ onSave }: { onSave: (availabilities: Availability[]) => void }) => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([
    { dayOfWeek: 1, startHour: 9, endHour: 17 },
    { dayOfWeek: 2, startHour: 9, endHour: 17 },
    { dayOfWeek: 3, startHour: 9, endHour: 17 },
    { dayOfWeek: 4, startHour: 9, endHour: 17 },
    { dayOfWeek: 5, startHour: 9, endHour: 17 },
  ]);

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || `Day ${dayOfWeek}`;
  };

  const handleAvailabilityChange = (dayOfWeek: number, startHour: number, endHour: number) => {
    const updatedAvailabilities = availabilities.map(availability => {
      if (availability.dayOfWeek === dayOfWeek) {
        return { ...availability, startHour, endHour };
      }
      return availability;
    });
    setAvailabilities(updatedAvailabilities);
  };

  const handleSubmit = () => {
    onSave(availabilities);
  };

  const formatHour = (hour: number): string => {
    return `${hour}:00`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">Study Time Preferences</h2>
        <p className="text-muted-foreground">Set when you're available to study each day</p>
      </div>
      
      <div className="space-y-4">
        {availabilities.map(availability => (
          <div key={availability.dayOfWeek} className="border rounded-md p-4 bg-card">
            <h3 className="font-medium mb-3">{getDayName(availability.dayOfWeek)}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Start Time</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded-md"
                  value={`${String(availability.startHour).padStart(2, '0')}:00`}
                  onChange={e => {
                    const hours = parseInt(e.target.value.split(':')[0], 10);
                    handleAvailabilityChange(availability.dayOfWeek, hours, availability.endHour);
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm text-muted-foreground mb-1">End Time</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded-md"
                  value={`${String(availability.endHour).padStart(2, '0')}:00`}
                  onChange={e => {
                    const hours = parseInt(e.target.value.split(':')[0], 10);
                    handleAvailabilityChange(availability.dayOfWeek, availability.startHour, hours);
                  }}
                />
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mt-2">
              Available: {formatHour(availability.startHour)} - {formatHour(availability.endHour)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Save Availability
        </button>
      </div>
    </div>
  );
};

export default AvailabilitySelector;
