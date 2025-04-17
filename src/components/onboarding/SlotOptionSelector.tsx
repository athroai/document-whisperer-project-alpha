
import React from 'react';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { SlotOption } from '@/types/study';

interface SlotOptionSelectorProps {
  slotOptions: SlotOption[];
  selectedOption: number | null;
  onSelectOption: (optionIndex: number) => void;
}

export const SlotOptionSelector: React.FC<SlotOptionSelectorProps> = ({ 
  slotOptions, 
  selectedOption, 
  onSelectOption 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {slotOptions.map((option, index) => (
        <Card 
          key={index} 
          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedOption === index ? 'ring-2 ring-purple-500 border-purple-300' : ''
          }`}
          onClick={() => onSelectOption(index)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`${option.color} h-8 w-8 rounded-full flex items-center justify-center mr-3`}>
                <option.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h5 className="font-medium">{option.name}</h5>
                <p className="text-sm text-gray-500">
                  {option.count} session{option.count > 1 ? 's' : ''}, 
                  {option.count * option.duration} minutes total
                </p>
              </div>
            </div>
            {selectedOption === index && (
              <Check className="h-5 w-5 text-purple-600" />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
