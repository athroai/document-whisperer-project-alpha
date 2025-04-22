
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarEvent } from '@/types/calendar';
import DayPlannerEvent from './DayPlannerEvent';
import DayPlannerEmpty from './DayPlannerEmpty';

interface DayPlannerEventsProps {
  events: CalendarEvent[];
  isLoading: boolean;
  onDelete: (eventId: string) => void;
  onAddSession: () => void;
  onEditSession: (event: CalendarEvent) => void;
  onLaunchSession: (event: CalendarEvent) => void;
}

const DayPlannerEvents = ({
  events,
  isLoading,
  onDelete,
  onAddSession,
  onEditSession,
  onLaunchSession
}: DayPlannerEventsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (events.length === 0) {
    return <DayPlannerEmpty onAddSession={onAddSession} />;
  }

  return (
    <>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Study Sessions</h3>
        <Button onClick={onAddSession} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-1 h-4 w-4" /> Add Session
        </Button>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <DayPlannerEvent
            key={event.id}
            event={event}
            onDelete={onDelete}
            onEdit={onEditSession}
            onLaunch={onLaunchSession}
          />
        ))}
      </div>
    </>
  );
};

export default DayPlannerEvents;
