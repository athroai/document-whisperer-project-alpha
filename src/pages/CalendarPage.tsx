
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Plus, Clock, BookOpen, GraduationCap } from 'lucide-react';

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);

  // Sample data - would come from a database in a real application
  const events = [
    { id: 1, title: 'Math Review Session', date: new Date(2025, 3, 12), type: 'study', time: '16:00', duration: 45, mentor: 'AthroMaths', icon: BookOpen },
    { id: 2, title: 'Science Quiz Practice', date: new Date(2025, 3, 14), type: 'quiz', time: '11:00', duration: 30, mentor: 'AthroScience', icon: GraduationCap },
    { id: 3, title: 'History Timeline Review', date: new Date(2025, 3, 15), type: 'study', time: '14:00', duration: 60, mentor: 'AthroHistory', icon: BookOpen },
  ];

  // Filter events for the selected date
  const selectedDateEvents = events.filter(event => 
    date && event.date.toDateString() === date.toDateString()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Study Calendar</h1>
          <Button onClick={() => setShowAddEventDialog(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Study Session
          </Button>
        </div>
        
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
                  onSelect={setDate}
                  className="border-none"
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
                  {date ? date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Select a date'}
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
                      const EventIcon = event.icon;
                      return (
                        <div key={event.id} className="flex border rounded-lg p-4">
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
                    <p className="text-sm mt-1">Click "Add Study Session" to create a new event</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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
              <Input id="title" placeholder="e.g., Algebra Review" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" defaultValue={date?.toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mentor">Choose Mentor</Label>
              <select 
                id="mentor" 
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="AthroMaths">AthroMaths</option>
                <option value="AthroScience">AthroScience</option>
                <option value="AthroHistory">AthroHistory</option>
                <option value="AthroEnglish">AthroEnglish</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" defaultValue="30" min="15" step="15" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEventDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              // Would save the event in a real implementation
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
