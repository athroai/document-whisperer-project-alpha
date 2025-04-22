
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, BookOpen } from 'lucide-react';

interface SessionTime {
  startHour: number;
  durationMinutes: number;
}

interface DayPreference {
  dayIndex: number;
  sessionTimes: SessionTime[];
}

interface DaySessionSchedulerProps {
  selectedDays: number[];
  dayPreferences: DayPreference[];
  handleSessionTimeChange: (dayIndex: number, sessionIndex: number, hour: number) => void;
  handleSessionDurationChange: (dayIndex: number, sessionIndex: number, minutes: number) => void;
  handleAddSession: (dayIndex: number) => void;
  handleRemoveSession: (dayIndex: number, sessionIndex: number) => void;
}

export const DaySessionScheduler: React.FC<DaySessionSchedulerProps> = ({
  selectedDays,
  dayPreferences,
  handleSessionTimeChange,
  handleSessionDurationChange,
  handleAddSession,
  handleRemoveSession
}) => {
  // Helper to get day name
  const getDayName = (dayIndex: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  // Generate time options for the select
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const amPm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return {
      value: hour,
      label: `${displayHour}:00 ${amPm}`
    };
  });

  // Generate duration options
  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
  ];

  // Count total sessions across all days
  const totalSessions = dayPreferences.reduce((count, day) => count + day.sessionTimes.length, 0);

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-medium">Set Your Study Sessions</Label>
        <div className="text-sm text-muted-foreground">
          Total sessions: <span className="font-medium">{totalSessions}</span>
        </div>
      </div>
      
      <p className="text-muted-foreground">For each day you've selected, add one or more study sessions with specific times and durations. We'll automatically assign subjects to these sessions in your study plan.</p>
      
      {selectedDays.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
          Please select at least one day to study from the options above.
        </div>
      )}
      
      {selectedDays.map(dayIndex => {
        const dayPref = dayPreferences.find(p => p.dayIndex === dayIndex);
        const sessionTimes = dayPref?.sessionTimes || [];
        
        return (
          <Card key={dayIndex} className="p-4">
            <h3 className="font-medium mb-4 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
              {getDayName(dayIndex)}
            </h3>
            
            {sessionTimes.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-2">No sessions added yet.</p>
            ) : (
              <div className="space-y-4">
                {sessionTimes.map((session, sessionIndex) => (
                  <div key={sessionIndex} className="flex items-center gap-3 flex-wrap p-2 bg-gray-50 rounded-md">
                    <div className="flex-1 min-w-[140px]">
                      <Label htmlFor={`time-${dayIndex}-${sessionIndex}`} className="text-xs mb-1 block">Start time</Label>
                      <Select 
                        value={session.startHour.toString()}
                        onValueChange={(value) => handleSessionTimeChange(dayIndex, sessionIndex, parseInt(value))}
                      >
                        <SelectTrigger id={`time-${dayIndex}-${sessionIndex}`} className="w-full">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1 min-w-[140px]">
                      <Label htmlFor={`duration-${dayIndex}-${sessionIndex}`} className="text-xs mb-1 block">Duration</Label>
                      <Select 
                        value={session.durationMinutes.toString()}
                        onValueChange={(value) => handleSessionDurationChange(dayIndex, sessionIndex, parseInt(value))}
                      >
                        <SelectTrigger id={`duration-${dayIndex}-${sessionIndex}`} className="w-full">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map(option => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="mt-4"
                      onClick={() => handleRemoveSession(dayIndex, sessionIndex)}
                      disabled={sessionTimes.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => handleAddSession(dayIndex)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Session
              </Button>
            </div>
          </Card>
        );
      })}
      
      <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
        <p className="text-sm text-blue-700">
          We'll automatically assign your chosen subjects to these time slots in your calendar, 
          creating a balanced study schedule. You can always modify these sessions later.
        </p>
      </div>
    </div>
  );
};
