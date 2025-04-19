
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Clock, 
  Calendar, 
  Edit, 
  Trash2, 
  BookOpen,
  Move
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useSubjects } from '@/hooks/useSubjects';

// Type for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  startTime: Date;
  endTime: Date;
  type: 'study_session' | 'quiz' | 'revision';
  color?: string;
  isDragging?: boolean;
}

// Type for time slots
interface TimeSlot {
  id?: string;
  time: string;
  displayTime: string;
  events: CalendarEvent[];
  isActive: boolean;
  dayIndex: number;
}

// Type for edit session dialog
interface EditSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: () => void;
  subjects: string[];
}

// Color map for subjects
const subjectColorMap: Record<string, string> = {
  'Mathematics': 'bg-purple-100 border-purple-300 text-purple-800',
  'Science': 'bg-blue-100 border-blue-300 text-blue-800',
  'English': 'bg-green-100 border-green-300 text-green-800',
  'History': 'bg-amber-100 border-amber-300 text-amber-800',
  'Geography': 'bg-teal-100 border-teal-300 text-teal-800',
  'Welsh': 'bg-red-100 border-red-300 text-red-800',
  'Languages': 'bg-indigo-100 border-indigo-300 text-indigo-800',
  'Religious Education': 'bg-pink-100 border-pink-300 text-pink-800'
};

// Default color for subjects not in the map
const defaultColor = 'bg-gray-100 border-gray-300 text-gray-800';

// Component for editing a session
const EditSessionDialog: React.FC<EditSessionDialogProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  subjects
}) => {
  const [title, setTitle] = useState(event?.title || '');
  const [subject, setSubject] = useState(event?.subject || subjects[0] || '');
  const [topic, setTopic] = useState(event?.topic || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const isNewEvent = !event?.id;
  const { toast } = useToast();

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setSubject(event.subject || subjects[0] || '');
      setTopic(event.topic || '');
      setStartTime(format(event.startTime, 'HH:mm'));
      setEndTime(format(event.endTime, 'HH:mm'));
      
      // Calculate duration in minutes
      const durationMs = event.endTime.getTime() - event.startTime.getTime();
      const minutes = Math.round(durationMs / 60000);
      setDurationMinutes(minutes);
    } else {
      // Default values for new event
      setTitle('Study Session');
      setSubject(subjects[0] || '');
      setTopic('');
      setStartTime('15:00');
      setEndTime('16:00');
      setDurationMinutes(60);
    }
  }, [event, subjects]);

  const handleSave = () => {
    if (!title || !subject || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Calculate date values from string times
    let newStartTime = new Date();
    let newEndTime = new Date();
    
    if (event) {
      newStartTime = new Date(event.startTime);
      newEndTime = new Date(event.endTime);
      
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      newStartTime.setHours(startHours, startMinutes);
      newEndTime.setHours(endHours, endMinutes);
    }

    onSave({
      id: event?.id,
      title,
      subject,
      topic,
      startTime: newStartTime,
      endTime: newEndTime,
      type: 'study_session'
    });
    
    onClose();
  };

  // Helper to update end time when duration changes
  const handleDurationChange = (durationInMinutes: number) => {
    setDurationMinutes(durationInMinutes);
    
    // Parse current start time and add duration
    const [hours, minutes] = startTime.split(':').map(Number);
    
    const startDate = new Date();
    startDate.setHours(hours, minutes);
    
    const endDate = new Date(startDate.getTime() + durationInMinutes * 60000);
    setEndTime(format(endDate, 'HH:mm'));
  };

  // Helper to update end time when start time changes
  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    
    // Update end time based on duration
    const [hours, minutes] = time.split(':').map(Number);
    
    const startDate = new Date();
    startDate.setHours(hours, minutes);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    setEndTime(format(endDate, 'HH:mm'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isNewEvent ? 'Add Study Session' : 'Edit Study Session'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Select
              value={subject}
              onValueChange={setSubject}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topic" className="text-right">
              Topic (optional)
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">
              Start Time
            </Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration
            </Label>
            <Select
              value={durationMinutes.toString()}
              onValueChange={(value) => handleDurationChange(parseInt(value))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-time" className="text-right">
              End Time
            </Label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
              disabled
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          {!isNewEvent && onDelete && (
            <Button 
              variant="destructive" 
              onClick={onDelete}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <div>
            <Button variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main calendar component
const SlotBasedCalendar: React.FC = () => {
  const { toast } = useToast();
  const { state: authState } = useAuth();
  const { subjects } = useSubjects();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [timeSlots, setTimeSlots] = useState<TimeSlot[][]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{dayIndex: number, time: string} | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

  // Generate time slots from 15:00 to 22:00 (3 PM to 10 PM) for students
  const generateTimeSlots = () => {
    const slots: TimeSlot[][] = [];
    const hours = [];
    
    // Generate hour slots from 3 PM to 10 PM
    for (let hour = 15; hour <= 22; hour++) {
      hours.push(hour);
    }
    
    // For each hour, create a 30-minute interval
    for (let i = 0; i < hours.length; i++) {
      const hour = hours[i];
      
      // Add :00 slot
      const fullHourSlots: TimeSlot[] = [];
      for (let day = 0; day < 7; day++) {
        fullHourSlots.push({
          time: `${hour}:00`,
          displayTime: `${hour}:00`,
          events: [],
          isActive: true,
          dayIndex: day
        });
      }
      slots.push(fullHourSlots);
      
      // Add :30 slot
      const halfHourSlots: TimeSlot[] = [];
      for (let day = 0; day < 7; day++) {
        halfHourSlots.push({
          time: `${hour}:30`,
          displayTime: `${hour}:30`,
          events: [],
          isActive: true,
          dayIndex: day
        });
      }
      slots.push(halfHourSlots);
    }
    
    return slots;
  };

  // Assign events to time slots
  const mapEventsToSlots = (allEvents: CalendarEvent[], weekStart: Date) => {
    const slots = generateTimeSlots();
    
    // Filter events for the current week
    const weekEnd = addDays(weekStart, 6);
    const eventsThisWeek = allEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });
    
    // Map events to slots
    eventsThisWeek.forEach(event => {
      const eventDate = new Date(event.startTime);
      const dayOfWeek = (eventDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      
      const eventStartHour = eventDate.getHours();
      const eventStartMinute = eventDate.getMinutes();
      const formattedStartTime = `${eventStartHour}:${eventStartMinute === 0 ? '00' : eventStartMinute}`;
      
      // Find matching time slot
      for (let i = 0; i < slots.length; i++) {
        const rowSlots = slots[i];
        const slotTime = rowSlots[0].time;
        
        // Split slotTime into hours and minutes
        const [slotHour, slotMinute] = slotTime.split(':').map(Number);
        
        // Check if event starts at or after this slot's time but before the next slot
        if ((eventStartHour === slotHour && eventStartMinute >= slotMinute) || 
            (eventStartHour > slotHour && i === slots.length - 1) || 
            (eventStartHour > slotHour && eventStartHour < Number(slots[i+1][0].time.split(':')[0])) ||
            (eventStartHour === Number(slots[i+1][0].time.split(':')[0]) && eventStartMinute < Number(slots[i+1][0].time.split(':')[1]))
          ) {
          // Add event to appropriate day's slot
          if (rowSlots[dayOfWeek]) {
            rowSlots[dayOfWeek].events.push(event);
          }
          break;
        }
      }
    });
    
    return slots;
  };

  // Load events from Supabase
  const loadEvents = async () => {
    setIsLoading(true);
    
    try {
      if (!authState.user?.id) {
        setEvents([]);
        setTimeSlots(generateTimeSlots());
        return;
      }
      
      const { data: calendarEvents, error } = await supabase
        .from('calendar_events')
        .select('*')
        .or(`student_id.eq.${authState.user.id},user_id.eq.${authState.user.id}`)
        .order('start_time', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (!calendarEvents) {
        setEvents([]);
        setTimeSlots(generateTimeSlots());
        return;
      }
      
      // Parse and format events
      const parsedEvents: CalendarEvent[] = calendarEvents.map(event => {
        // Try to parse description for additional data
        let subject = '';
        let topic = '';
        
        try {
          if (event.description) {
            const descriptionObj = JSON.parse(event.description);
            subject = descriptionObj.subject || '';
            topic = descriptionObj.topic || '';
          }
        } catch (e) {
          // If parsing fails, use title or empty string
          subject = event.title || '';
        }
        
        return {
          id: event.id,
          title: event.title,
          subject: subject,
          topic: topic,
          startTime: new Date(event.start_time),
          endTime: new Date(event.end_time),
          type: (event.event_type as 'study_session' | 'quiz' | 'revision') || 'study_session'
        };
      });
      
      setEvents(parsedEvents);
      
      // Map events to slots
      const mappedSlots = mapEventsToSlots(parsedEvents, currentWeekStart);
      setTimeSlots(mappedSlots);
      
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive"
      });
      setTimeSlots(generateTimeSlots());
    } finally {
      setIsLoading(false);
    }
  };

  // Handle next/previous week navigation
  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  // Handle creating a new event
  const handleAddEvent = (dayIndex: number, time: string) => {
    setSelectedEvent(null);
    setSelectedSlot({ dayIndex, time });
    setShowEditDialog(true);
  };

  // Handle editing an existing event
  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setShowEditDialog(true);
  };

  // Calculate new date based on dayIndex and time
  const calculateEventDate = (dayIndex: number, timeStr: string): Date => {
    const day = addDays(currentWeekStart, dayIndex);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    const result = new Date(day);
    result.setHours(hours, minutes, 0, 0);
    
    return result;
  };

  // Save event (create or update)
  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    if (!authState.user?.id) {
      toast({
        title: "Authentication Required",
        description: "You need to be signed in to save events",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Determine if we're creating or updating
      const isNewEvent = !eventData.id;
      
      // Format event date and time
      let startTime = eventData.startTime;
      let endTime = eventData.endTime;
      
      // If we're creating a new event from a slot
      if (isNewEvent && selectedSlot) {
        startTime = calculateEventDate(selectedSlot.dayIndex, selectedSlot.time);
        
        // Default to 1 hour duration
        endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1);
      }
      
      if (!startTime || !endTime) {
        throw new Error("Start and end times are required");
      }
      
      // Prepare data for Supabase
      const eventDescription = JSON.stringify({
        subject: eventData.subject,
        topic: eventData.topic,
        isPomodoro: true,
        pomodoroWorkMinutes: 25,
        pomodoroBreakMinutes: 5
      });
      
      const eventPayload = {
        user_id: authState.user.id,
        student_id: authState.user.id,
        title: eventData.title,
        description: eventDescription,
        event_type: 'study_session',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      };
      
      if (isNewEvent) {
        // Create new event
        const { data, error } = await supabase
          .from('calendar_events')
          .insert(eventPayload)
          .select('id')
          .single();
          
        if (error) throw error;
        
        toast({
          title: "Event Created",
          description: "The study session has been added to your calendar"
        });
      } else {
        // Update existing event
        const { error } = await supabase
          .from('calendar_events')
          .update(eventPayload)
          .eq('id', eventData.id);
          
        if (error) throw error;
        
        toast({
          title: "Event Updated",
          description: "The study session has been updated"
        });
      }
      
      // Reload events
      await loadEvents();
      
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save the study session",
        variant: "destructive"
      });
    }
  };

  // Delete an event
  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id || !authState.user?.id) return;
    
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', selectedEvent.id);
        
      if (error) throw error;
      
      toast({
        title: "Event Deleted",
        description: "The study session has been removed from your calendar"
      });
      
      // Close dialog and reload events
      setShowEditDialog(false);
      await loadEvents();
      
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete the study session",
        variant: "destructive"
      });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event: CalendarEvent) => {
    setDraggedEvent({...event, isDragging: true});
  };

  const handleDragOver = (e: React.DragEvent, slot: TimeSlot) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, slot: TimeSlot) => {
    e.preventDefault();
    
    if (!draggedEvent || !draggedEvent.id || !authState.user?.id) return;
    
    try {
      // Calculate new start and end times
      const newStartTime = calculateEventDate(slot.dayIndex, slot.time);
      
      // Calculate duration of original event
      const originalDurationMs = draggedEvent.endTime.getTime() - draggedEvent.startTime.getTime();
      
      // Apply same duration to new time
      const newEndTime = new Date(newStartTime.getTime() + originalDurationMs);
      
      // Update the event in Supabase
      const { error } = await supabase
        .from('calendar_events')
        .update({
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString()
        })
        .eq('id', draggedEvent.id);
        
      if (error) throw error;
      
      toast({
        title: "Event Moved",
        description: "The study session has been rescheduled"
      });
      
      // Reset drag state and reload events
      setDraggedEvent(null);
      await loadEvents();
      
    } catch (error) {
      console.error('Error moving event:', error);
      toast({
        title: "Error",
        description: "Failed to move the study session",
        variant: "destructive"
      });
    }
  };

  // Load events when component mounts or week changes
  useEffect(() => {
    loadEvents();
  }, [currentWeekStart, authState.user?.id]);

  // Get day names for the current week
  const getDaysOfWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(currentWeekStart, i);
      days.push({
        name: format(day, 'EEE'),
        date: format(day, 'd'),
        isToday: isSameDay(day, new Date())
      });
    }
    return days;
  };

  // Render calendar event
  const renderEvent = (event: CalendarEvent) => {
    // Get color based on subject
    const colorClass = event.subject && subjectColorMap[event.subject] 
      ? subjectColorMap[event.subject] 
      : defaultColor;
    
    return (
      <div 
        key={event.id}
        className={`p-2 rounded-md border ${colorClass} cursor-move hover:shadow-md transition-shadow ${event.isDragging ? 'opacity-50' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          handleEditEvent(event);
        }}
        draggable
        onDragStart={() => handleDragStart(event)}
      >
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm">{event.title}</span>
          <div className="flex space-x-1">
            <Move className="h-3 w-3 cursor-move" />
            <BookOpen className="h-3 w-3" />
          </div>
        </div>
        <div className="text-xs mt-1 truncate">
          {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
        </div>
        {event.topic && (
          <div className="text-xs italic mt-1 truncate">{event.topic}</div>
        )}
      </div>
    );
  };

  // Render empty slot with add button
  const renderEmptySlot = (dayIndex: number, time: string) => {
    return (
      <div className="h-full flex items-center justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 rounded-full p-0"
          onClick={() => handleAddEvent(dayIndex, time)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const days = getDaysOfWeek();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Study Schedule</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </span>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-8 divide-x divide-gray-200 border-b">
            <div className="p-3 font-medium text-gray-500 text-sm">Time</div>
            {days.map((day, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "p-3 text-center",
                  day.isToday && "bg-blue-50"
                )}
              >
                <div className="font-medium">{day.name}</div>
                <div className={cn(
                  "w-6 h-6 rounded-full mx-auto flex items-center justify-center text-sm",
                  day.isToday && "bg-blue-500 text-white"
                )}>
                  {day.date}
                </div>
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-20 animate-spin" />
              <p>Loading your schedule...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {timeSlots.map((row, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-8 divide-x divide-gray-100">
                  <div className="p-2 text-xs text-gray-500 sticky">
                    {format(new Date().setHours(
                      Number(row[0].time.split(':')[0]), 
                      Number(row[0].time.split(':')[1])
                    ), 'h:mm a')}
                  </div>
                  
                  {row.map((slot, colIndex) => (
                    <div 
                      key={`${rowIndex}-${colIndex}`} 
                      className="p-1 min-h-[60px] border-b border-gray-100"
                      onDragOver={(e) => handleDragOver(e, slot)}
                      onDrop={(e) => handleDrop(e, slot)}
                      onClick={() => handleAddEvent(colIndex, slot.time)}
                    >
                      {slot.events.length > 0 ? (
                        <div className="space-y-1">
                          {slot.events.map(event => renderEvent(event))}
                        </div>
                      ) : (
                        renderEmptySlot(colIndex, slot.time)
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {!authState.user && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="text-center p-6">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
                <p className="text-gray-500 max-w-md">
                  Please sign in to view and manage your study calendar
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Session Dialog */}
      <EditSessionDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        subjects={subjects}
      />
    </div>
  );
};

export default SlotBasedCalendar;
