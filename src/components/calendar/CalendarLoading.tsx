
import React from 'react';
import { Loader } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const CalendarLoading = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading your study calendar...</span>
      </div>
      <Skeleton className="h-[600px] w-full rounded-md opacity-40" />
    </div>
  );
};

export default CalendarLoading;
