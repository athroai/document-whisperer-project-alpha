
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { timetableService } from '@/services/timetableService';
import { StudyRoutine, DailyAvailability, TimeSlot } from '@/types/timetable';

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const formatTime = (time: string): string => {
  // Convert 24h format to 12h format for display
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const StudyRoutineSetupPage: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState('0'); // Default to Sunday
  
  // Study routine state
  const [routine, setRoutine] = useState<StudyRoutine>({
    userId: state.user?.id || '',
    preferredSessionLength: 45,
    availability: DAYS_OF_WEEK.map((_, index) => ({
      dayOfWeek: index as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      timeSlots: []
    })),
    doNotDisturbRanges: [],
    lastUpdated: new Date().toISOString()
  });

  // Load existing routine on component mount
  useEffect(() => {
    const loadRoutine = async () => {
      if (state.user) {
        try {
          const existingRoutine = await timetableService.getStudyRoutine(state.user.id);
          
          if (existingRoutine) {
            setRoutine(existingRoutine);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Error loading study routine:', error);
          setLoading(false);
        }
      }
    };
    
    loadRoutine();
  }, [state.user]);

  // Add a new time slot to the current day
  const addTimeSlot = () => {
    const day = parseInt(activeDay, 10);
    
    setRoutine(prev => {
      const updatedAvailability = [...prev.availability];
      const dayIndex = updatedAvailability.findIndex(a => a.dayOfWeek === day);
      
      if (dayIndex >= 0) {
        updatedAvailability[dayIndex] = {
          ...updatedAvailability[dayIndex],
          timeSlots: [
            ...updatedAvailability[dayIndex].timeSlots,
            { startTime: '15:00', endTime: '17:00', available: true }
          ]
        };
      }
      
      return {
        ...prev,
        availability: updatedAvailability
      };
    });
  };

  // Update a time slot
  const updateTimeSlot = (dayOfWeek: number, index: number, field: keyof TimeSlot, value: any) => {
    setRoutine(prev => {
      const updatedAvailability = [...prev.availability];
      const dayIndex = updatedAvailability.findIndex(a => a.dayOfWeek === dayOfWeek);
      
      if (dayIndex >= 0) {
        const updatedTimeSlots = [...updatedAvailability[dayIndex].timeSlots];
        updatedTimeSlots[index] = {
          ...updatedTimeSlots[index],
          [field]: value
        };
        
        updatedAvailability[dayIndex] = {
          ...updatedAvailability[dayIndex],
          timeSlots: updatedTimeSlots
        };
      }
      
      return {
        ...prev,
        availability: updatedAvailability
      };
    });
  };

  // Remove a time slot
  const removeTimeSlot = (dayOfWeek: number, index: number) => {
    setRoutine(prev => {
      const updatedAvailability = [...prev.availability];
      const dayIndex = updatedAvailability.findIndex(a => a.dayOfWeek === dayOfWeek);
      
      if (dayIndex >= 0) {
        const updatedTimeSlots = [...updatedAvailability[dayIndex].timeSlots];
        updatedTimeSlots.splice(index, 1);
        
        updatedAvailability[dayIndex] = {
          ...updatedAvailability[dayIndex],
          timeSlots: updatedTimeSlots
        };
      }
      
      return {
        ...prev,
        availability: updatedAvailability
      };
    });
  };

  // Add a do not disturb range
  const addDoNotDisturbRange = () => {
    setRoutine(prev => ({
      ...prev,
      doNotDisturbRanges: [
        ...(prev.doNotDisturbRanges || []),
        {
          startTime: '22:00',
          endTime: '08:00',
          days: [0, 1, 2, 3, 4, 5, 6],
          reason: 'Sleep'
        }
      ]
    }));
  };

  // Remove a do not disturb range
  const removeDoNotDisturbRange = (index: number) => {
    setRoutine(prev => {
      if (!prev.doNotDisturbRanges) return prev;
      
      const updatedRanges = [...prev.doNotDisturbRanges];
      updatedRanges.splice(index, 1);
      
      return {
        ...prev,
        doNotDisturbRanges: updatedRanges
      };
    });
  };

  // Update a do not disturb range
  const updateDoNotDisturbRange = (index: number, field: string, value: any) => {
    setRoutine(prev => {
      if (!prev.doNotDisturbRanges) return prev;
      
      const updatedRanges = [...prev.doNotDisturbRanges];
      
      updatedRanges[index] = {
        ...updatedRanges[index],
        [field]: value
      };
      
      return {
        ...prev,
        doNotDisturbRanges: updatedRanges
      };
    });
  };

  // Toggle a day for a do not disturb range
  const toggleDayForDoNotDisturb = (rangeIndex: number, day: number) => {
    setRoutine(prev => {
      if (!prev.doNotDisturbRanges) return prev;
      
      const updatedRanges = [...prev.doNotDisturbRanges];
      const currentDays = [...updatedRanges[rangeIndex].days];
      
      const dayIndex = currentDays.indexOf(day);
      if (dayIndex >= 0) {
        currentDays.splice(dayIndex, 1);
      } else {
        currentDays.push(day);
      }
      
      updatedRanges[rangeIndex] = {
        ...updatedRanges[rangeIndex],
        days: currentDays
      };
      
      return {
        ...prev,
        doNotDisturbRanges: updatedRanges
      };
    });
  };

  // Save the routine
  const saveRoutine = async () => {
    if (!state.user) {
      toast({
        title: 'Not logged in',
        description: 'You need to be logged in to save your study routine.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      
      // Update the lastUpdated timestamp
      const updatedRoutine = {
        ...routine,
        lastUpdated: new Date().toISOString()
      };
      
      await timetableService.saveStudyRoutine(updatedRoutine);
      
      toast({
        title: 'Routine saved',
        description: 'Your study routine has been saved successfully.',
      });
      
      // Navigate to the timetable page
      navigate('/student/timetable');
    } catch (error) {
      console.error('Error saving routine:', error);
      toast({
        title: 'Error',
        description: 'There was a problem saving your study routine.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Loading your study routine...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Set Your Study Routine</h1>
        </div>
        <Button onClick={saveRoutine} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save & Generate Timetable'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
              <CardDescription>
                Set your available study times for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeDay} onValueChange={setActiveDay}>
                <TabsList className="grid grid-cols-7">
                  {DAYS_OF_WEEK.map((day, index) => (
                    <TabsTrigger key={index} value={index.toString()}>
                      {day.slice(0, 3)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {DAYS_OF_WEEK.map((day, dayIndex) => (
                  <TabsContent key={dayIndex} value={dayIndex.toString()} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{day}</h3>
                      <Button onClick={addTimeSlot} variant="outline" size="sm">
                        <Plus className="mr-1 h-4 w-4" /> Add Time Slot
                      </Button>
                    </div>
                    
                    {routine.availability[dayIndex]?.timeSlots.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p>No available time slots added for {day}.</p>
                        <p className="text-sm">Click "Add Time Slot" to add your study times.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {routine.availability[dayIndex]?.timeSlots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex flex-wrap items-center gap-4 p-3 border rounded-md bg-background">
                            <div className="flex-1 min-w-[120px]">
                              <Label htmlFor={`start-time-${dayIndex}-${slotIndex}`} className="mb-1 block text-sm">Start Time</Label>
                              <Input
                                id={`start-time-${dayIndex}-${slotIndex}`}
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'startTime', e.target.value)}
                              />
                            </div>
                            
                            <div className="flex-1 min-w-[120px]">
                              <Label htmlFor={`end-time-${dayIndex}-${slotIndex}`} className="mb-1 block text-sm">End Time</Label>
                              <Input
                                id={`end-time-${dayIndex}-${slotIndex}`}
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'endTime', e.target.value)}
                              />
                            </div>
                            
                            <div className="flex items-center ml-auto">
                              <Switch
                                id={`available-${dayIndex}-${slotIndex}`}
                                checked={slot.available}
                                onCheckedChange={(checked) => updateTimeSlot(dayIndex, slotIndex, 'available', checked)}
                              />
                              <Label htmlFor={`available-${dayIndex}-${slotIndex}`} className="ml-2">
                                Available
                              </Label>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Study Session Settings</CardTitle>
              <CardDescription>
                Configure your preferences for study sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-length" className="mb-1 block">Preferred Session Length</Label>
                  <Select
                    value={routine.preferredSessionLength.toString()}
                    onValueChange={(value) => setRoutine(prev => ({
                      ...prev,
                      preferredSessionLength: parseInt(value) as 15 | 25 | 45 | 60
                    }))}
                  >
                    <SelectTrigger id="session-length">
                      <SelectValue placeholder="Select a session length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Do Not Disturb</CardTitle>
              <CardDescription>
                Set times when you don't want to be scheduled for studying
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={addDoNotDisturbRange} 
                  variant="outline" 
                  className="w-full"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Do Not Disturb Time
                </Button>
                
                {routine.doNotDisturbRanges && routine.doNotDisturbRanges.map((range, index) => (
                  <div key={index} className="p-3 border rounded-md bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{formatTime(range.startTime)} - {formatTime(range.endTime)}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDoNotDisturbRange(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <Label htmlFor={`dnd-start-${index}`} className="mb-1 block text-sm">Start Time</Label>
                        <Input
                          id={`dnd-start-${index}`}
                          type="time"
                          value={range.startTime}
                          onChange={(e) => updateDoNotDisturbRange(index, 'startTime', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`dnd-end-${index}`} className="mb-1 block text-sm">End Time</Label>
                        <Input
                          id={`dnd-end-${index}`}
                          type="time"
                          value={range.endTime}
                          onChange={(e) => updateDoNotDisturbRange(index, 'endTime', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <Label htmlFor={`dnd-reason-${index}`} className="mb-1 block text-sm">Reason (optional)</Label>
                      <Input
                        id={`dnd-reason-${index}`}
                        value={range.reason || ''}
                        onChange={(e) => updateDoNotDisturbRange(index, 'reason', e.target.value)}
                        placeholder="e.g. Sleep, Dinner, Sports"
                      />
                    </div>
                    
                    <div>
                      <Label className="mb-1 block text-sm">Apply to days</Label>
                      <div className="flex flex-wrap gap-1">
                        {DAYS_OF_WEEK.map((day, dayIndex) => (
                          <Button
                            key={dayIndex}
                            variant={range.days.includes(dayIndex) ? "default" : "outline"}
                            size="sm"
                            className="flex-grow min-w-[50px]"
                            onClick={() => toggleDayForDoNotDisturb(index, dayIndex)}
                          >
                            {day.slice(0, 3)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!routine.doNotDisturbRanges || routine.doNotDisturbRanges.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No do not disturb times added.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyRoutineSetupPage;
