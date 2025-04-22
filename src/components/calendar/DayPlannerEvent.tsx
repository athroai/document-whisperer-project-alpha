
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarEvent } from '@/types/calendar';
import { getEventColor } from '@/utils/calendarUtils';
import { formatGMTTime } from '@/utils/timeUtils';

interface DayPlannerEventProps {
  event: CalendarEvent;
  onDelete: (eventId: string) => void;
  onEdit: (event: CalendarEvent) => void;
  onLaunch: (event: CalendarEvent) => void;
}

const DayPlannerEvent = ({ event, onDelete, onEdit, onLaunch }: DayPlannerEventProps) => {
  const colorStyle = getEventColor(event.subject || '');

  return (
    <Card className="border-l-4 transition-shadow duration-200 hover:shadow-md"
      style={{ borderLeftColor: colorStyle.color }}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{event.title}</h4>
              <div className="text-sm text-gray-500">
                {formatGMTTime(event.start_time)} - {formatGMTTime(event.end_time)}
              </div>
              {event.subject && (
                <div className={`mt-2 text-xs inline-block px-2 py-1 rounded ${colorStyle.bg} ${colorStyle.text}`}>
                  {event.subject}
                  {event.topic && ` • ${event.topic}`}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(event)}
              className="text-purple-600 hover:text-purple-700"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLaunch(event)}
              className="text-green-600 hover:text-green-700"
            >
              Launch
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(event.id)}
              className="text-red-500 hover:text-red-600"
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DayPlannerEvent;
