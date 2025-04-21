
import React from 'react';
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {slotOptions.map((option, index) => {
        const isSelected = selectedOption === index;
        const Icon = option.icon;
        
        return (
          <div
            key={option.name}
            className={`
              cursor-pointer border rounded-md p-4 transition-all
              ${isSelected ? `border-2 border-purple-500 bg-purple-50` : 'hover:border-gray-300'}
            `}
            onClick={() => onSelectOption(index)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{option.name}</div>
                <div className="text-sm text-gray-500 mt-1">{option.count} × {option.duration}min</div>
              </div>
              <div className={`${option.color} p-2 rounded-md text-white`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
