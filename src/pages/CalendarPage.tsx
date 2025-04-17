
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SlotBasedCalendar from '@/components/calendar/SlotBasedCalendar';

const CalendarPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-6">
            <SlotBasedCalendar />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
