
import React from 'react';
import { Loader } from 'lucide-react';

const CalendarPageLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  );
};

export default CalendarPageLoading;
