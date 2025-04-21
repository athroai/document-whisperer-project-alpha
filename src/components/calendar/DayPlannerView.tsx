
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus, Clock, ArrowLeft, Trash2 } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';
import { getEventColor } from '@/utils/calendarUtils';
import { formatGMTTime } from '@/utils/timeUtils';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Skeleton } from '@/components/ui/skeleton';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface DayPlannerViewProps {
  selectedDate: Date;
  onClose: () => void;
  events: CalendarEvent[];
  isLoading: boolean;
  onRefresh: () => void;
}

const DayPlannerView: React.FC<DayPlannerViewProps> = ({
  selectedDate,
  onClose,
  events,
  isLoading,
  onRefresh
}) => {
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const { updateEvent, deleteEvent, createEvent } = useCalendarEvents();
  
  // Filter events for the selected date
  useEffect(() => {
    const filteredEvents = events.filter(event => {
      try {
        const eventDate = parseISO(event.start_time);
        return (
          eventDate.getFullYear() === selectedDate.getFullYear() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getDate() === selectedDate.getDate()
        );
      } catch (err) {
        return false;
      }
    });
    
    // Sort by start time
    filteredEvents.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    
    setDayEvents(filteredEvents);
  }, [selectedDate, events]);

  // Handle drag and drop reordering of events
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(dayEvents);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setDayEvents(items);
    
    // You would also update the timing of events here in a real implementation
    // This is a simplified version that just reorders them
  };

  const handleAddSession = () => {
    setIsAddingEvent(true);
    // In a real implementation, you would open a form to create a new event
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this study session?')) {
      await deleteEvent(eventId);
      onRefresh();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose} 
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-medium">Study Sessions</h3>
            <Button 
              onClick={handleAddSession} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="mr-1 h-4 w-4" /> Add Session
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : dayEvents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground mb-4">No study sessions planned for this day</p>
                <Button 
                  onClick={handleAddSession}
                  variant="outline"
                >
                  <Plus className="mr-1 h-4 w-4" /> Schedule a Study Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="dayEvents">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {dayEvents.map((event, index) => {
                      const colorStyle = getEventColor(event.subject || '');
                      return (
                        <Draggable 
                          key={event.id} 
                          draggableId={event.id} 
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="group"
                            >
                              <Card className="cursor-move border-l-4 hover:shadow-md transition-shadow duration-200"
                                style={{ borderLeftColor: colorStyle.color }}
                              >
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
                                      onClick={() => handleDeleteEvent(event.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayPlannerView;
