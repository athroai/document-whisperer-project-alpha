
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Trash2, Pencil, Play } from 'lucide-react';
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
    <div className="group">
      <Card className="border-l-4 transition-shadow duration-200 hover:shadow-md"
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
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(event)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4 text-gray-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onLaunch(event)}
                className="h-8 w-8"
              >
                <Play className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(event.id)}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DayPlannerEvent;
