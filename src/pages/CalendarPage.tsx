
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Plus, Clock, BookOpen, GraduationCap, ArrowLeft, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import calendarService, { CalendarEvent } from '@/services/calendarService';
import { useAthro } from '@/contexts/AthroContext';

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEventData, setNewEventData] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    duration: '30',
    mentor: 'AthroMaths',
    type: 'study' as 'study' | 'quiz' | 'revision',
  });
  const { state: authState } = useAuth();
  const { characters } = useAthro();
  const { toast } = useToast();

  // Function to ensure selected date is correctly set 
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Create a new Date object at noon to avoid timezone issues
      const adjustedDate = new Date(selectedDate);
      adjustedDate.setHours(12, 0, 0, 0);
      setDate(adjustedDate);
      if (newEventData) {
        setNewEventData({
          ...newEventData,
          date: format(adjustedDate, 'yyyy-MM-dd'),
        });
      }
    } else {
      setDate(undefined);
    }
  };

  // Switch to week view when a date is selected
  useEffect(() => {
    if (date) {
      setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
      setViewMode('week');
    }
  }, [date]);

  // Load calendar events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      if (!authState.user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // For monthly view, fetch the full month's events
        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(addWeeks(monthStart, 8)); // Get a good range of future events
        
        const fetchedEvents = await calendarService.getEventsInDateRange(
          authState.user.id,
          monthStart,
          monthEnd
        );
        
        setEvents(fetchedEvents);
      } catch (err) {
        console.error('Failed to fetch calendar events:', err);
        setError('Failed to load your calendar events. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to load calendar events.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [authState.user?.id, toast]);

  // Navigate between weeks
  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  // Get days of current week
  const daysOfWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  });

  // Filter events for the selected date
  const selectedDateEvents = events.filter(event => 
    date && isSameDay(event.date, date)
  );

  // Filter events for each day in weekly view
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEventData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewEventData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEvent = async () => {
    if (!authState.user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add events.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const dateObj = new Date(`${newEventData.date}T${newEventData.time}`);
      
      await calendarService.addEvent({
        userId: authState.user.id,
        title: newEventData.title,
        description: newEventData.description,
        date: dateObj,
        time: newEventData.time,
        duration: parseInt(newEventData.duration),
        mentor: newEventData.mentor,
        type: newEventData.type,
      });
      
      // Refetch events
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(addWeeks(monthStart, 8));
      
      const updatedEvents = await calendarService.getEventsInDateRange(
        authState.user.id,
        monthStart,
        monthEnd
      );
      
      setEvents(updatedEvents);
      
      toast({
        title: 'Success',
        description: 'Study session added to calendar.',
      });
      
      setShowAddEventDialog(false);
      
      // Reset form
      setNewEventData({
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        duration: '30',
        mentor: 'AthroMaths',
        type: 'study',
      });
      
    } catch (err) {
      console.error('Failed to add calendar event:', err);
      toast({
        title: 'Error',
        description: 'Failed to add study session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading your calendar...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Study Calendar</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setViewMode(viewMode === 'month' ? 'week' : 'month')}
            >
              {viewMode === 'month' ? 'Week View' : 'Month View'}
            </Button>
            <Button onClick={() => setShowAddEventDialog(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add Study Session
            </Button>
          </div>
        </div>
        
        {viewMode === 'month' ? (
          // Month View
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    Calendar
                  </CardTitle>
                  <CardDescription>
                    Plan your study sessions and track your progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    className="border-none pointer-events-auto"
                  />
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                      <span>Study</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                      <span>Quiz</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-amber-500 rounded-full mr-1"></div>
                      <span>Revision</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {date ? format(date, 'EEEE, d MMMM yyyy') : 'Select a date'}
                  </CardTitle>
                  <CardDescription>
                    {selectedDateEvents.length > 0 
                      ? `${selectedDateEvents.length} ${selectedDateEvents.length === 1 ? 'event' : 'events'} scheduled` 
                      : 'No events scheduled'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateEvents.map(event => {
                        const EventIcon = event.type === 'quiz' ? GraduationCap : BookOpen;
                        return (
                          <div key={event.id} className="flex border rounded-lg p-4">
                            <div 
                              className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                                event.type === 'study' ? 'bg-purple-100 text-purple-600' : 
                                event.type === 'quiz' ? 'bg-green-100 text-green-600' : 
                                'bg-amber-100 text-amber-600'
                              }`}
                            >
                              {<EventIcon className="h-6 w-6" />}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <h3 className="font-medium">{event.title}</h3>
                                <span className="text-sm text-gray-500">with {event.mentor}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <Clock className="h-3 w-3 mr-1" /> 
                                {event.time} · {event.duration} mins
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <CalendarIcon className="mx-auto h-12 w-12 opacity-30 mb-3" />
                      <p>No study sessions scheduled for this day</p>
                      <p className="text-sm mt-1">Click "Add Study Session" to create a new event</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Week View
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Weekly Schedule</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(currentWeekStart, 'd MMM')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'd MMM yyyy')}
                  </span>
                  <Button variant="outline" size="sm" onClick={goToNextWeek}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map(day => (
                  <div key={day.toString()} className="flex flex-col">
                    <div className={cn(
                      "text-center py-2 font-medium text-sm",
                      isSameDay(day, new Date()) ? "bg-blue-100 rounded-t-md" : ""
                    )}>
                      <div>{format(day, 'EEE')}</div>
                      <div className={cn(
                        "w-8 h-8 mx-auto flex items-center justify-center rounded-full",
                        isSameDay(day, new Date()) ? "bg-blue-500 text-white" : ""
                      )}>
                        {format(day, 'd')}
                      </div>
                    </div>
                    <div className={cn(
                      "border rounded-b-md flex-grow min-h-[150px] bg-white",
                      isSameDay(day, new Date()) ? "border-blue-200" : "border-gray-200",
                      "relative"
                    )}>
                      {getEventsForDay(day).map(event => (
                        <div 
                          key={event.id} 
                          className={cn(
                            "p-1 text-xs mb-1 mx-1 rounded",
                            event.type === 'study' ? "bg-purple-100 text-purple-700" : 
                            event.type === 'quiz' ? "bg-green-100 text-green-700" : 
                            "bg-amber-100 text-amber-700"
                          )}
                        >
                          <p className="font-medium">{event.title}</p>
                          <p>{event.time}</p>
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute bottom-0 right-0 m-1"
                        onClick={() => {
                          handleDateChange(day);
                          setShowAddEventDialog(true);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Display details for selected day when in week view */}
        {viewMode === 'week' && date && (
          <Card>
            <CardHeader>
              <CardTitle>{date ? format(date, 'EEEE, d MMMM yyyy') : 'Select a date'}</CardTitle>
              <CardDescription>
                {selectedDateEvents.length > 0 
                  ? `${selectedDateEvents.length} ${selectedDateEvents.length === 1 ? 'event' : 'events'} scheduled` 
                  : 'No events scheduled'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map(event => {
                    const EventIcon = event.type === 'quiz' ? GraduationCap : BookOpen;
                    return (
                      <div key={event.id} className="flex border rounded-lg p-4">
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                            event.type === 'study' ? 'bg-purple-100 text-purple-600' : 
                            event.type === 'quiz' ? 'bg-green-100 text-green-600' : 
                            'bg-amber-100 text-amber-600'
                          }`}
                        >
                          <EventIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{event.title}</h3>
                            <span className="text-sm text-gray-500">with {event.mentor}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Clock className="h-3 w-3 mr-1" /> 
                            {event.time} · {event.duration} mins
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <CalendarIcon className="mx-auto h-12 w-12 opacity-30 mb-3" />
                  <p>No study sessions scheduled for this day</p>
                  <p className="text-sm mt-1">Click "Add Study Session" to create a new event</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Add Event Dialog */}
      <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Study Session</DialogTitle>
            <DialogDescription>
              Schedule a new study session with your Athro mentor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title</Label>
              <Input 
                id="title" 
                name="title" 
                value={newEventData.title} 
                onChange={handleInputChange} 
                placeholder="e.g., Algebra Review" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={newEventData.description} 
                onChange={handleInputChange} 
                placeholder="What will you study in this session?" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  value={newEventData.date} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input 
                  id="time" 
                  name="time" 
                  type="time" 
                  value={newEventData.time} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mentor">Choose Mentor</Label>
              <Select 
                value={newEventData.mentor} 
                onValueChange={(value) => handleSelectChange('mentor', value)}
              >
                <SelectTrigger id="mentor">
                  <SelectValue placeholder="Select Mentor" />
                </SelectTrigger>
                <SelectContent>
                  {characters.map((char) => (
                    <SelectItem key={char.id} value={char.name || char.subject}>
                      {char.name || `Athro${char.subject}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select 
                  value={newEventData.duration} 
                  onValueChange={(value) => handleSelectChange('duration', value)}
                >
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Session Type</Label>
                <Select 
                  value={newEventData.type} 
                  onValueChange={(value) => handleSelectChange('type', value as 'study' | 'quiz' | 'revision')}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Session Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="revision">Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEventDialog(false)}>Cancel</Button>
            <Button onClick={handleAddEvent}>
              Save Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
