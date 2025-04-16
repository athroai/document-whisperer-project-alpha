import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Plus, Clock, BookOpen, GraduationCap, ArrowLeft, ArrowRight } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudySessionDialog from '@/components/calendar/StudySessionDialog';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CalendarEvent {
  id: number | string;
  title: string;
  date: Date;
  type: 'study' | 'quiz' | 'revision';
  time: string;
  duration: number;
  mentor: string;
  icon?: React.ElementType;
}

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [showStudySessionDialog, setShowStudySessionDialog] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const { toast } = useToast();
  const { state: authState } = useAuth();

  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const adjustedDate = new Date(selectedDate);
      adjustedDate.setHours(12, 0, 0, 0);
      setDate(adjustedDate);
      console.log('Selected date:', adjustedDate.toISOString());
    } else {
      setDate(undefined);
    }
  };

  useEffect(() => {
    if (date) {
      setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
      setViewMode('week');
    }
  }, [date]);

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const daysOfWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  });

  const loadEvents = async () => {
    setIsLoadingEvents(true);
    
    try {
      if (!authState.user || !authState.user.id) {
        console.log('No authenticated user found, skipping event loading');
        setEvents([]);
        return;
      }

      const userId = authState.user.id;
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        console.error('Invalid UUID format for user ID:', userId);
        toast({
          title: 'Error',
          description: 'Invalid user ID format. Please try logging in again.',
          variant: 'destructive',
        });
        setEvents([]);
        return;
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('id, title, description, start_time, end_time, event_type')
        .eq('student_id', userId)
        .or(`event_type.eq.study_session,event_type.eq.quiz`)
        .order('start_time', { ascending: true });
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No events found for user');
        setEvents([]);
        return;
      }

      const formattedEvents: CalendarEvent[] = data.map(event => {
        let description: { subject?: string } = {};
        try {
          if (event.description) {
            description = JSON.parse(event.description) as { subject?: string };
          }
        } catch (e) {
          console.error('Error parsing event description:', e);
        }
        
        const eventIcon = event.event_type === 'study_session' ? BookOpen : 
                          event.event_type === 'quiz' ? GraduationCap : 
                          CalendarIcon;
        
        const eventType = event.event_type === 'study_session' ? 'study' : 
                          event.event_type === 'quiz' ? 'quiz' : 
                          'revision';
        
        return {
          id: event.id,
          title: event.title,
          date: new Date(event.start_time),
          type: eventType as 'study' | 'quiz' | 'revision',
          time: format(new Date(event.start_time), 'HH:mm'),
          duration: Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000),
          mentor: description.subject ? `${description.subject} Mentor` : 'Athro Mentor',
          icon: eventIcon
        };
      });
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calendar events.',
        variant: 'destructive',
      });
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (!authState.loading) {
      loadEvents();
    }
  }, [authState.loading, authState.user]);

  const selectedDateEvents = events.filter(event => 
    date && isSameDay(event.date, date)
  );

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

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
            <Button 
              onClick={() => setShowStudySessionDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="mr-1 h-4 w-4" /> Schedule Study Session
            </Button>
          </div>
        </div>
        
        {!authState.user ? (
          <Card className="mb-6">
            <CardContent className="text-center py-10">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="font-medium text-lg mb-2">Authentication Required</h3>
              <p className="text-gray-500">Please sign in to view and manage your calendar events.</p>
            </CardContent>
          </Card>
        ) : viewMode === 'month' ? (
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
                  {isLoadingEvents ? (
                    <div className="text-center py-10 text-gray-500">
                      <p>Loading events...</p>
                    </div>
                  ) : selectedDateEvents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateEvents.map(event => {
                        const EventIcon = event.icon || CalendarIcon;
                        return (
                          <div key={String(event.id)} className="flex border rounded-lg p-4">
                            <div 
                              className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                                event.type === 'study' ? 'bg-purple-100 text-purple-600' : 
                                event.type === 'quiz' ? 'bg-green-100 text-green-600' : 
                                'bg-amber-100 text-amber-600'
                              }`}
                            >
                              {EventIcon && <EventIcon className="h-6 w-6" />}
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between">
                                <h3 className="font-medium">{event.title}</h3>
                                <span className="text-sm text-gray-500">with {event.mentor}</span>
                              </div>
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
                      <p className="text-sm mt-1">Click "Schedule Study Session" to create a new event</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
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
              {isLoadingEvents ? (
                <div className="text-center py-10 text-gray-500">
                  <p>Loading events...</p>
                </div>
              ) : (
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
                            key={String(event.id)} 
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
                            setShowStudySessionDialog(true);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
              {isLoadingEvents ? (
                <div className="text-center py-10 text-gray-500">
                  <p>Loading events...</p>
                </div>
              ) : selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map(event => {
                    const EventIcon = event.icon || CalendarIcon;
                    return (
                      <div key={String(event.id)} className="flex border rounded-lg p-4">
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                            event.type === 'study' ? 'bg-purple-100 text-purple-600' : 
                            event.type === 'quiz' ? 'bg-green-100 text-green-600' : 
                            'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {EventIcon && <EventIcon className="h-6 w-6" />}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{event.title}</h3>
                            <span className="text-sm text-gray-500">with {event.mentor}</span>
                          </div>
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
                  <p className="text-sm mt-1">Click "Schedule Study Session" to create a new event</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      <StudySessionDialog
        open={showStudySessionDialog}
        onOpenChange={setShowStudySessionDialog}
        selectedDate={date}
        onSuccess={loadEvents}
      />
      
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
              <Input id="title" placeholder="e.g., Algebra Review" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" defaultValue={date ? format(date, 'yyyy-MM-dd') : undefined} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mentor">Choose Mentor</Label>
              <Select defaultValue="AthroMaths">
                <SelectTrigger id="mentor">
                  <SelectValue placeholder="Select Mentor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AthroMaths">AthroMaths</SelectItem>
                  <SelectItem value="AthroScience">AthroScience</SelectItem>
                  <SelectItem value="AthroHistory">AthroHistory</SelectItem>
                  <SelectItem value="AthroEnglish">AthroEnglish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select defaultValue="30">
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEventDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowAddEventDialog(false);
            }}>
              Save Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
