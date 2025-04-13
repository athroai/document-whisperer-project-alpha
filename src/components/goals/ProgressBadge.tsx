
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBadgeProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function ProgressBadge({ 
  value, 
  size = 'md', 
  showValue = true,
  className 
}: ProgressBadgeProps) {
  // Ensure value is between 0 and 100
  const safeValue = Math.min(100, Math.max(0, value));
  
  // Determine color based on progress
  const getColor = () => {
    if (safeValue >= 80) return 'bg-green-500 text-white';
    if (safeValue >= 60) return 'bg-emerald-500 text-white';
    if (safeValue >= 40) return 'bg-blue-500 text-white';
    if (safeValue >= 20) return 'bg-amber-500 text-white';
    return 'bg-gray-500 text-white';
  };
  
  // Determine size
  const getSize = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8 text-xs';
      case 'lg': return 'w-16 h-16 text-lg';
      default: return 'w-12 h-12 text-sm';
    }
  };
  
  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center font-medium",
        getSize(),
        getColor(),
        className
      )}
    >
      {showValue && `${safeValue}%`}
    </div>
  );
}

export default ProgressBadge;
