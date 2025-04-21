
import React from 'react';
import { SlotOption } from '@/types/study';

interface TimeSlotPreviewProps {
  selectedOption: SlotOption;
  preferredStartHour: number;
}

export const TimeSlotPreview: React.FC<TimeSlotPreviewProps> = ({
  selectedOption,
  preferredStartHour
}) => {
  const getTimeString = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  // Generate preview slots based on the selected option
  const generatePreviewSlots = () => {
    const slots = [];
    let currentHour = preferredStartHour;
    
    for (let i = 0; i < selectedOption.count; i++) {
      const startTime = getTimeString(currentHour);
      const endHour = currentHour + Math.floor(selectedOption.duration / 60);
      const endMinutes = selectedOption.duration % 60;
      
      let endTimeStr = getTimeString(endHour);
      if (endMinutes > 0) {
        endTimeStr += `:${endMinutes.toString().padStart(2, '0')}`;
      }
      
      slots.push({ start: startTime, end: endTimeStr });
      
      // Add spacing between sessions
      currentHour = endHour + 1;
      if (currentHour > 23) break; // Don't go past midnight
    }
    
    return slots;
  };
  
  const previewSlots = generatePreviewSlots();

  return (
    <div className="mt-6 bg-gray-50 p-4 rounded-md">
      <h4 className="text-sm font-medium mb-3">Sample Schedule Preview</h4>
      
      <div className="space-y-2">
        {previewSlots.map((slot, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm font-medium">{slot.start}</div>
            <div className="flex-1 h-6 relative">
              <div className={`absolute left-0 top-0 h-full ${selectedOption.color} rounded-md text-white text-xs flex items-center px-2`} style={{ width: '80%' }}>
                <span className="truncate">Session {index + 1}</span>
              </div>
            </div>
            <div className="w-20 text-sm font-medium text-right">{slot.end}</div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mt-3">
        This is a preview of your daily study sessions. You'll be able to adjust individual sessions in the calendar.
      </p>
    </div>
  );
};
