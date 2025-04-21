// Import the correct Availability type
import React, { useState } from 'react';
import { Availability } from '@/types/study';

// Fix the component to use the updated Availability type with startHour and endHour
const AvailabilitySelector = ({ onSave }: { onSave: (availabilities: Availability[]) => void }) => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', startHour: 9, endHour: 17 },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', startHour: 9, endHour: 17 },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', startHour: 9, endHour: 17 },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', startHour: 9, endHour: 17 },
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', startHour: 9, endHour: 17 },
  ]);

  const handleAvailabilityChange = (dayOfWeek: number, startTime: string, endTime: string) => {
    const updatedAvailabilities = availabilities.map(availability => {
      if (availability.dayOfWeek === dayOfWeek) {
        const startHour = parseInt(startTime.split(':')[0], 10);
        const endHour = parseInt(endTime.split(':')[0], 10);
        return { ...availability, startTime, endTime, startHour, endHour };
      }
      return availability;
    });
    setAvailabilities(updatedAvailabilities);
  };

  const handleSubmit = () => {
    onSave(availabilities);
  };

  return (
    <div>
      <h2>Select Your Availability</h2>
      {availabilities.map(availability => (
        <div key={availability.dayOfWeek}>
          <h3>Day {availability.dayOfWeek}</h3>
          <label>Start Time:</label>
          <input
            type="time"
            value={availability.startTime}
            onChange={e => handleAvailabilityChange(availability.dayOfWeek, e.target.value, availability.endTime)}
          />
          <label>End Time:</label>
          <input
            type="time"
            value={availability.endTime}
            onChange={e => handleAvailabilityChange(availability.dayOfWeek, availability.startTime, e.target.value)}
          />
        </div>
      ))}
      <button onClick={handleSubmit}>Save Availability</button>
    </div>
  );
};

export default AvailabilitySelector;
