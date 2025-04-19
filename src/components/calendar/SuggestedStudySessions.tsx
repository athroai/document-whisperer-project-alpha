
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarEvent } from '@/types/calendar';
import { format } from 'date-fns';
import { BookOpen, Calendar, Clock, X } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { getEventColor } from '@/utils/calendarUtils';
import { Badge } from '@/components/ui/badge';

const SuggestedStudySessions = () => {
  const { suggestedEvents, acceptSuggestedEvent } = useCalendarEvents();
  
  if (!suggestedEvents || suggestedEvents.length === 0) {
    return null;
  }
  
  return (
    <Card className="my-5 border-dashed border-2 border-purple-300 bg-purple-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-purple-600" />
          Suggested Study Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">
          Based on your confidence levels, we recommend these study sessions:
        </p>
        
        <div className="space-y-3">
          {suggestedEvents.map((event) => (
            <SuggestedSessionCard 
              key={event.id} 
              event={event} 
              onAccept={acceptSuggestedEvent} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface SuggestedSessionCardProps {
  event: CalendarEvent;
  onAccept: (event: CalendarEvent) => Promise<boolean>;
}

const SuggestedSessionCard = ({ event, onAccept }: SuggestedSessionCardProps) => {
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const colorClass = getEventColor(event.subject);
  
  const handleAccept = async () => {
    await onAccept(event);
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <BookOpen className={`h-8 w-8 p-1.5 rounded-full ${colorClass.bg} ${colorClass.text}`} />
        </div>
        <div>
          <h4 className="font-medium">{event.title}</h4>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            <span>{format(startDate, 'EEEE, h:mm a')} - {format(endDate, 'h:mm a')}</span>
          </div>
          <Badge className={`mt-1.5 ${colorClass.bg} ${colorClass.text} border-none`} variant="outline">
            {event.subject}
          </Badge>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {}}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleAccept}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Add to Calendar
        </Button>
      </div>
    </div>
  );
};

export default SuggestedStudySessions;
