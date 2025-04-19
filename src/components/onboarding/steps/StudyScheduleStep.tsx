
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface StudyPreset {
  name: string;
  description: string;
  icon: React.ReactNode;
  sessionLength: number;
  sessionsPerDay: number;
  daysPattern: number[];
}

export const StudyScheduleStep: React.FC = () => {
  const { updateOnboardingStep, setStudySlots } = useOnboarding();
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Monday to Friday
  const [preferredStartHour, setPreferredStartHour] = useState<number>(15); // 3 PM
  const [sessionLength, setSessionLength] = useState<number>(30); // 30 minutes
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(2); // 2 sessions per day
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const handleDayToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleBack = () => {
    updateOnboardingStep('subjects');
  };

  const handleContinue = () => {
    // Create study slots based on selected preferences
    const slots = selectedDays.map(day => ({
      id: `temp-${Date.now()}-${day}`,
      user_id: 'temp-user-id',
      day_of_week: day,
      slot_count: sessionsPerDay,
      slot_duration_minutes: sessionLength,
      preferred_start_hour: preferredStartHour,
      created_at: new Date().toISOString()
    }));
    
    setStudySlots(slots);
    updateOnboardingStep('style');
  };

  // Study schedule presets
  const presets: StudyPreset[] = [
    {
      name: 'Power Sessions',
      description: 'Focused, intensive study bursts',
      icon: <Clock className="h-6 w-6 text-orange-500" />,
      sessionLength: 25,
      sessionsPerDay: 3,
      daysPattern: [1, 2, 3, 4, 5]  // Monday to Friday
    },
    {
      name: 'Deep Dive',
      description: 'Longer, immersive learning periods',
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      sessionLength: 60,
      sessionsPerDay: 1,
      daysPattern: [1, 3, 5]  // Monday, Wednesday, Friday
    },
    {
      name: 'Weekend Warrior',
      description: 'Concentrate study on weekends',
      icon: <CalendarIcon className="h-6 w-6 text-green-500" />,
      sessionLength: 90,
      sessionsPerDay: 2,
      daysPattern: [6, 7]  // Saturday, Sunday
    },
    {
      name: 'Balanced',
      description: 'Moderate sessions throughout the week',
      icon: <Clock className="h-6 w-6 text-purple-500" />,
      sessionLength: 45,
      sessionsPerDay: 2,
      daysPattern: [1, 2, 3, 4, 5, 6, 7]  // All week
    }
  ];

  const handlePresetSelect = (index: number) => {
    const preset = presets[index];
    setSelectedPreset(index);
    setSelectedDays(preset.daysPattern);
    setSessionLength(preset.sessionLength);
    setSessionsPerDay(preset.sessionsPerDay);
  };

  // Calculate total study time per week
  const totalMinutesPerWeek = selectedDays.length * sessionsPerDay * sessionLength;
  const totalHours = Math.floor(totalMinutesPerWeek / 60);
  const remainingMinutes = totalMinutesPerWeek % 60;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Set Your Study Schedule</h2>
        <p className="text-muted-foreground">Choose when you want to study and for how long</p>
      </div>
      
      {/* Study Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Quick Setup - Choose a Preset Schedule</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((preset, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all ${selectedPreset === index ? 'border-purple-400' : 'hover:border-purple-200'}`}
              onClick={() => handlePresetSelect(index)}
            >
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="shrink-0">
                  {preset.icon}
                </div>
                <div>
                  <h3 className="font-medium">{preset.name}</h3>
                  <p className="text-sm text-muted-foreground">{preset.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {preset.sessionLength} mins × {preset.sessionsPerDay} sessions × {preset.daysPattern.length} days
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Custom Schedule */}
      <div className="space-y-5 pt-4">
        <Label className="text-sm font-medium">Or Customize Your Own Schedule</Label>
        
        {/* Days Selection */}
        <div className="space-y-3">
          <Label className="text-sm">Study Days</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day, index) => {
              const dayNumber = index + 1;
              return (
                <Badge 
                  key={day}
                  variant={selectedDays.includes(dayNumber) ? "default" : "outline"}
                  className={`cursor-pointer ${selectedDays.includes(dayNumber) ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : ''}`}
                  onClick={() => handleDayToggle(dayNumber)}
                >
                  {day.substring(0, 3)}
                </Badge>
              );
            })}
          </div>
        </div>
        
        {/* Session Length */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Session Length</Label>
            <span className="text-sm font-medium">{sessionLength} minutes</span>
          </div>
          <Slider
            value={[sessionLength]}
            min={15}
            max={120}
            step={15}
            onValueChange={(values) => setSessionLength(values[0])}
            className="mb-6"
          />
        </div>
        
        {/* Sessions Per Day */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Sessions Per Day</Label>
            <span className="text-sm font-medium">{sessionsPerDay} {sessionsPerDay === 1 ? 'session' : 'sessions'}</span>
          </div>
          <Slider
            value={[sessionsPerDay]}
            min={1}
            max={5}
            step={1}
            onValueChange={(values) => setSessionsPerDay(values[0])}
            className="mb-6"
          />
        </div>
        
        {/* Preferred Start Time */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Preferred Start Time</Label>
            <span className="text-sm font-medium">{formatHour(preferredStartHour)}</span>
          </div>
          <Slider
            value={[preferredStartHour]}
            min={15} // 3 PM
            max={23} // 11 PM
            step={1}
            onValueChange={(values) => setPreferredStartHour(values[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3 PM</span>
            <span>7 PM</span>
            <span>11 PM</span>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-purple-800">Your Weekly Study Plan</h3>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-purple-700">
              <strong>Schedule:</strong> {selectedDays.length} days per week, {sessionsPerDay} {sessionsPerDay === 1 ? 'session' : 'sessions'} per day
            </p>
            <p className="text-sm text-purple-700">
              <strong>Total study time:</strong> {totalHours} {totalHours === 1 ? 'hour' : 'hours'} {remainingMinutes > 0 ? `${remainingMinutes} minutes` : ''} per week
            </p>
            <p className="text-sm text-purple-700">
              <strong>Session length:</strong> {sessionLength} minutes
            </p>
            <p className="text-sm text-purple-700">
              <strong>Start time:</strong> Around {formatHour(preferredStartHour)}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={selectedDays.length === 0}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

// Helper function to format hour
function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}
