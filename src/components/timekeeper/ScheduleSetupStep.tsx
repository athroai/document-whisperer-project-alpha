
import React from 'react';
import { Button } from '@/components/ui/button';
import { useStudySchedule } from '@/hooks/useStudySchedule';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { DayPreference } from '@/hooks/schedule/useDayPreferences';

export const ScheduleSetupStep: React.FC = () => {
  const {
    selectedDays,
    sessionsPerDay,
    dayPreferences,
    isSubmitting,
    sessionOptions,
    error,
    handleDayToggle,
    handleSessionTimeChange,
    handleSessionDurationChange,
    handleSessionsPerDayChange,
    handleAddSession,
    handleRemoveSession,
    handleContinue
  } = useStudySchedule();

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Set Your Study Schedule</h2>
        <p className="text-muted-foreground mt-1">
          Select which days you want to study and customize your study sessions.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Select Days</h3>
        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((day, index) => (
            <button
              key={day}
              className={`py-2 px-1 rounded-md text-center text-sm ${
                selectedDays.includes(index)
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => handleDayToggle(index)}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Sessions Per Day</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {sessionOptions.map(opt => (
            <button
              key={opt.value}
              className={`py-2 px-3 rounded-md text-center text-sm ${
                sessionsPerDay === opt.value
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => handleSessionsPerDayChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {selectedDays.length > 0 && (
        <div className="space-y-6 pt-4">
          <h3 className="font-medium">Customize Sessions</h3>
          
          {selectedDays.map(dayIndex => {
            const dayPref = dayPreferences.find(p => p.dayIndex === dayIndex);
            if (!dayPref) return null;
            
            return (
              <div key={dayIndex} className="border rounded-md p-4">
                <h4 className="font-semibold mb-3">{dayNames[dayIndex]}</h4>
                <div className="space-y-4">
                  {dayPref.sessionTimes.map((session, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center pb-3 border-b last:border-0">
                      <div className="flex-1">
                        <label className="text-sm text-gray-500 block mb-1">Start Time</label>
                        <select
                          value={session.startHour}
                          onChange={e => handleSessionTimeChange(dayIndex, idx, parseInt(e.target.value))}
                          className="w-full rounded-md border border-gray-300 p-2"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>
                              {i === 0 ? '12 AM' : i === 12 ? '12 PM' : i < 12 ? `${i} AM` : `${i - 12} PM`}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex-1">
                        <label className="text-sm text-gray-500 block mb-1">Duration</label>
                        <select
                          value={session.durationMinutes}
                          onChange={e => handleSessionDurationChange(dayIndex, idx, parseInt(e.target.value))}
                          className="w-full rounded-md border border-gray-300 p-2"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={90}>1.5 hours</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2 self-end sm:self-center mt-2 sm:mt-0">
                        {dayPref.sessionTimes.length > 1 && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleRemoveSession(dayIndex, idx)}
                          >
                            <span className="sr-only">Remove session</span>
                            <span>-</span>
                          </Button>
                        )}
                        
                        {idx === dayPref.sessionTimes.length - 1 && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleAddSession(dayIndex)}
                          >
                            <span className="sr-only">Add session</span>
                            <span>+</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Button 
          onClick={handleContinue} 
          disabled={isSubmitting || selectedDays.length === 0}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Creating Schedule...
            </>
          ) : (
            <>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
