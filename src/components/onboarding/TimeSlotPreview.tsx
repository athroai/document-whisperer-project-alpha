
import React from 'react';
import { SlotOption } from '@/types/study';

interface TimeSlotPreviewProps {
  selectedOption: SlotOption | null;
  preferredStartHour: number;
}

export const TimeSlotPreview: React.FC<TimeSlotPreviewProps> = ({ 
  selectedOption, 
  preferredStartHour 
}) => {
  if (!selectedOption) return null;
  
  const slots = [];

  for (let i = 0; i < selectedOption.count; i++) {
    // Calculate the start time for each slot
    const slotStartHour = preferredStartHour + Math.floor((i * selectedOption.duration) / 60);
    const slotStartMinute = (i * selectedOption.duration) % 60;
    
    const startTimeString = `${slotStartHour}:${slotStartMinute.toString().padStart(2, '0')}`;
    const endTimeHour = slotStartHour + Math.floor(selectedOption.duration / 60);
    const endTimeMinute = slotStartMinute + (selectedOption.duration % 60);
    
    // Adjust for minute overflow
    const adjustedEndHour = endTimeHour + Math.floor(endTimeMinute / 60);
    const adjustedEndMinute = endTimeMinute % 60;
    
    const endTimeString = `${adjustedEndHour}:${adjustedEndMinute.toString().padStart(2, '0')}`;
    
    // Format for display
    const startDisplay = `${slotStartHour > 12 ? slotStartHour - 12 : slotStartHour}:${slotStartMinute.toString().padStart(2, '0')} ${slotStartHour >= 12 ? 'PM' : 'AM'}`;
    const endDisplay = `${adjustedEndHour > 12 ? adjustedEndHour - 12 : adjustedEndHour}:${adjustedEndMinute.toString().padStart(2, '0')} ${adjustedEndHour >= 12 ? 'PM' : 'AM'}`;

    slots.push(
      <div 
        key={i}
        className={`${selectedOption.color} rounded-md p-3 text-white shadow-sm`}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">{startDisplay} - {endDisplay}</span>
          <selectedOption.icon className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      <h4 className="text-sm font-medium text-gray-500">Preview:</h4>
      <div className="space-y-2">
        {slots}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Total: {selectedOption.count * selectedOption.duration} minutes
      </p>
    </div>
  );
};
