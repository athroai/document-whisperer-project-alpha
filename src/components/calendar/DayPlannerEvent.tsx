
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Edit, Play, CheckSquare, Square } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';
import { getEventColor } from '@/utils/calendarUtils';
import { formatGMTTime } from '@/utils/timeUtils';

interface DayPlannerEventProps {
  event: CalendarEvent;
  onDelete: (eventId: string) => void;
  onEdit: (event: CalendarEvent) => void;
  onLaunch: (event: CalendarEvent) => void;
  onMarkComplete: (event: CalendarEvent, completed: boolean) => void;
}

const DayPlannerEvent = ({
  event,
  onDelete,
  onEdit,
  onLaunch,
  onMarkComplete
}: DayPlannerEventProps) => {
  const colorStyle = getEventColor(event.subject || '');

  return (
    <Card className="border-l-4 hover:shadow-md transition-shadow duration-200 relative"
      style={{ borderLeftColor: colorStyle.color }}>
      <CardContent className="p-4 flex items-start justify-between">
        <div>
          <h4 className="font-medium">{event.title}</h4>
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-1">
              <svg width="14" height="14" className="inline-block"><circle cx="7" cy="7" r="7" fill="currentColor" className="text-gray-300" /></svg>
            </span>
            {formatGMTTime(event.start_time)} - {formatGMTTime(event.end_time)}
          </div>
          {event.subject && (
            <div className={`mt-2 text-xs inline-block px-2 py-1 rounded ${colorStyle.bg} ${colorStyle.text}`}>
              {event.subject}{event.topic ? ` • ${event.topic}` : ''}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end space-y-1 ml-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit"
            onClick={() => onEdit(event)}
            className="hover:bg-blue-100"
          >
            <Edit className="h-5 w-5 text-blue-700" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Launch"
            onClick={() => onLaunch(event)}
            className="hover:bg-green-100"
          >
            <Play className="h-5 w-5 text-green-700" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={event.status === 'completed' ? 'Mark as Incomplete' : 'Mark as Complete'}
            onClick={() => onMarkComplete(event, !(event.status === 'completed'))}
            className="hover:bg-purple-100"
          >
            {event.status === 'completed'
              ? <CheckSquare className="h-5 w-5 text-purple-700" />
              : <Square className="h-5 w-5 text-gray-400" />
            }
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete"
            onClick={() => onDelete(event.id)}
            className="hover:bg-red-100"
          >
            <Trash2 className="h-5 w-5 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DayPlannerEvent;
