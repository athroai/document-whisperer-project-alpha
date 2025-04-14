import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CalendarEvent, calendarService } from '@/services/calendarService';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    description?: string;
    date?: Date | string;
    duration?: number;
    type?: 'study' | 'quiz' | 'revision';
    mentor?: string;
  }>({ title: '' });
  const { toast } = useToast();
  const { state } = useAuth();
  
  useEffect(() => {
    if (state.user) {
      fetchEvents();
    }
  }, [date, state.user]);
  
  const fetchEvents = async () => {
    if (!date || !state.user) return;
    
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const eventsData = await calendarService.getEventsInDateRange(state.user.id, startOfDay, endOfDay);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events for this date.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddEvent = () => {
    if (!newEvent) return;
    
    const eventData: Omit<CalendarEvent, 'id' | 'createdAt'> = {
      userId: state.user?.id || '',
      title: newEvent.title,
      description: newEvent.description || '',
      date: new Date(newEvent.date || new Date()),
      duration: newEvent.duration || 60,
      type: newEvent.type || 'study',
      mentor: newEvent.mentor // This is now valid with our updated CalendarEvent type
    };
    
    calendarService.addEvent(eventData)
      .then(() => {
        toast({
          title: "Event Added",
          description: "Your event has been added to the calendar.",
        });
        fetchEvents(); // Refresh events
        setNewEvent({ title: '' }); // Reset new event form
      })
      .catch(error => {
        console.error('Error adding event:', error);
        toast({
          title: "Error",
          description: "Failed to add event. Please try again.",
          variant: "destructive",
        });
      });
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="md:w-96">
          <CardHeader className="pb-3">
            <CardTitle>Select a Date</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={setDate}
              footer={date ? (
                <p>You picked {format(date, 'PPP')}.</p>
              ) : (
                <span>Please pick a day.</span>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Event List and Details */}
        <Card>
          <CardHeader>
            <CardTitle>Events for {date ? format(date, 'PPP') : 'Select a date'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.length > 0 ? (
              events.map(event => (
                <div
                  key={event.id}
                  className="border p-4 rounded-md cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedEvent(event)}
                >
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <p className="text-gray-600">{event.time}</p>
                </div>
              ))
            ) : (
              <p>No events for this date.</p>
            )}
            
            {selectedEvent && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                <p className="text-gray-600">{format(selectedEvent.date, 'PPP')}</p>
                {selectedEvent.mentor && (
                  <p className="text-sm text-gray-500">Mentor: {selectedEvent.mentor}</p>
                )}
                <p className="text-sm text-gray-500">Type: {selectedEvent.type}</p>
                <p className="text-sm text-gray-500">Duration: {selectedEvent.duration} minutes</p>
                <p className="text-sm text-gray-500">Description: {selectedEvent.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Event Form */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add New Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="mentor">Mentor (Optional)</Label>
              <Input
                type="text"
                id="mentor"
                value={newEvent.mentor || ''}
                onChange={(e) => setNewEvent({ ...newEvent, mentor: e.target.value })}
                placeholder="e.g., Mr. Smith"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                value={newEvent.date ? format(new Date(newEvent.date), 'yyyy-MM-dd') : format(date || new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                type="number"
                id="duration"
                value={newEvent.duration || 60}
                onChange={(e) => setNewEvent({ ...newEvent, duration: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select onValueChange={(value) => setNewEvent({ ...newEvent, type: value as 'study' | 'quiz' | 'revision' })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="revision">Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={handleAddEvent}>Add Event</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
