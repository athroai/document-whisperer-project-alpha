
import React from 'react';
import { Card } from '@/components/ui/card';
import { SlotOption } from '@/types/study';
import { formatTime } from '@/utils/studyPlanGenerationUtils';

interface TimeSlotPreviewProps {
  selectedOption: SlotOption;
  preferredStartHour: number;
}

export const TimeSlotPreview: React.FC<TimeSlotPreviewProps> = ({
  selectedOption,
  preferredStartHour
}) => {
  // Generate the preview times based on the selected option and start hour
  const generateTimeSlots = () => {
    const slots = [];
    
    for (let i = 0; i < selectedOption.count; i++) {
      const startHour = preferredStartHour + i;
      const endHour = startHour + (selectedOption.duration / 60);
      
      slots.push({
        startTime: formatTime(startHour),
        endTime: formatTime(Math.floor(endHour)),
        durationMinutes: selectedOption.duration
      });
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();

  return (
    <Card className="p-4 mt-4">
      <h4 className="font-medium mb-3">Your Study Schedule Preview</h4>
      <div className="space-y-3">
        {timeSlots.map((slot, index) => (
          <div key={index} className="flex justify-between items-center border-b pb-2">
            <div>
              <span className="font-medium">{slot.startTime}</span> - <span>{slot.endTime}</span>
            </div>
            <div className="text-sm text-gray-500">
              {slot.durationMinutes} minutes
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
