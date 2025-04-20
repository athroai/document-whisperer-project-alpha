
import React from 'react';
import { Card } from '@/components/ui/card';
import { SlotOption } from '@/types/study';

interface SlotOptionSelectorProps {
  slotOptions: SlotOption[];
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
}

export const SlotOptionSelector: React.FC<SlotOptionSelectorProps> = ({
  slotOptions,
  selectedOption,
  onSelectOption
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {slotOptions.map((option, index) => {
        const IconComponent = option.icon;
        
        return (
          <Card 
            key={option.name}
            className={`p-4 cursor-pointer transition-all ${
              selectedOption === index ? 'border-2 border-purple-500' : ''
            }`}
            onClick={() => onSelectOption(index)}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`p-2 rounded-full ${option.color} text-white mb-2`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <h4 className="font-medium">{option.name}</h4>
              <p className="text-sm text-gray-500">
                {option.count} x {option.duration} min sessions
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
