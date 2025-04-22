
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Trash2 } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';
import { getEventColor } from '@/utils/calendarUtils';
import { formatGMTTime } from '@/utils/timeUtils';

interface DayPlannerEventProps {
  event: CalendarEvent;
  onDelete: (eventId: string) => void;
  provided: any;
}

const DayPlannerEvent = ({ event, onDelete, provided }: DayPlannerEventProps) => {
  const colorStyle = getEventColor(event.subject || '');

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="group"
    >
      <Card className="cursor-move border-l-4 hover:shadow-md transition-shadow duration-200"
        style={{ borderLeftColor: colorStyle.color }}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{event.title}</h4>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {formatGMTTime(event.start_time)} - {formatGMTTime(event.end_time)}
              </div>
              {event.subject && (
                <div className={`mt-2 text-xs inline-block px-2 py-1 rounded ${colorStyle.bg} ${colorStyle.text}`}>
                  {event.subject}
                  {event.topic && ` • ${event.topic}`}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(event.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DayPlannerEvent;
