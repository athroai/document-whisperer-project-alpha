
import React, { useState } from 'react';
import { Availability } from '@/types/study';

// Fix the component to use the updated Availability type with startHour and endHour
const AvailabilitySelector = ({ onSave }: { onSave: (availabilities: Availability[]) => void }) => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([
    { dayOfWeek: 1, startHour: 9, endHour: 17 },
    { dayOfWeek: 2, startHour: 9, endHour: 17 },
    { dayOfWeek: 3, startHour: 9, endHour: 17 },
    { dayOfWeek: 4, startHour: 9, endHour: 17 },
    { dayOfWeek: 5, startHour: 9, endHour: 17 },
  ]);

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

  return (
    <div>
      <h2>Select Your Availability</h2>
      {availabilities.map(availability => (
        <div key={availability.dayOfWeek}>
          <h3>Day {availability.dayOfWeek}</h3>
          <label>Start Time:</label>
          <input
            type="time"
            value={`${String(availability.startHour).padStart(2, '0')}:00`}
            onChange={e => {
              const hours = parseInt(e.target.value.split(':')[0], 10);
              handleAvailabilityChange(availability.dayOfWeek, hours, availability.endHour);
            }}
          />
          <label>End Time:</label>
          <input
            type="time"
            value={`${String(availability.endHour).padStart(2, '0')}:00`}
            onChange={e => {
              const hours = parseInt(e.target.value.split(':')[0], 10);
              handleAvailabilityChange(availability.dayOfWeek, availability.startHour, hours);
            }}
          />
        </div>
      ))}
      <button onClick={handleSubmit}>Save Availability</button>
    </div>
  );
};

export default AvailabilitySelector;
