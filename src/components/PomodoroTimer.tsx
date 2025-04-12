import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type TimerMode = 'work' | 'break';
type TimerPreset = '25/5' | '50/10';

interface PomodoroTimerProps {
  onComplete?: () => void;
  className?: string;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onComplete, className }) => {
  const [preset, setPreset] = useState<TimerPreset>('25/5');
  const [mode, setMode] = useState<TimerMode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Configure timer based on preset
  useEffect(() => {
    const workTime = preset === '25/5' ? 25 * 60 : 50 * 60;
    const breakTime = preset === '25/5' ? 5 * 60 : 10 * 60;
    
    setTotalTime(mode === 'work' ? workTime : breakTime);
    setTimeLeft(mode === 'work' ? workTime : breakTime);
    setIsRunning(false);
  }, [preset, mode]);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(error => console.error('Error playing audio:', error));
      }
      
      // Switch modes or complete
      if (mode === 'work') {
        setMode('break');
        setCompletedSessions(prev => prev + 1);
      } else {
        setMode('work');
      }
      
      if (onComplete) {
        onComplete();
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, onComplete]);
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  const resetTimer = () => {
    const workTime = preset === '25/5' ? 25 * 60 : 50 * 60;
    const breakTime = preset === '25/5' ? 5 * 60 : 10 * 60;
    
    setTimeLeft(mode === 'work' ? workTime : breakTime);
    setIsRunning(false);
  };
  
  const switchPreset = (newPreset: TimerPreset) => {
    setPreset(newPreset);
    // Reset to work mode when changing preset
    setMode('work');
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Calculate progress percentage
  const progress = Math.round(((totalTime - timeLeft) / totalTime) * 100);
  
  return (
    <Card className={cn("w-full shadow-md", className)}>
      <CardHeader className={cn(
        "pb-2 border-b",
        mode === 'work' ? "bg-purple-50" : "bg-amber-50"
      )}>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            {mode === 'work' ? (
              <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
            ) : (
              <Coffee className="h-5 w-5 mr-2 text-amber-600" />
            )}
            <span className={mode === 'work' ? "text-purple-700" : "text-amber-700"}>
              {mode === 'work' ? 'Focus Time' : 'Break Time'}
            </span>
          </div>
          <div className="text-sm font-normal text-gray-500">
            {completedSessions} sessions completed
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className={cn(
            "text-4xl font-bold mb-6",
            mode === 'work' ? "text-purple-700" : "text-amber-600"
          )}>
            {formatTime(timeLeft)}
          </div>
          
          <Progress
            value={progress}
            className={cn(
              "w-full h-2 mb-6",
              mode === 'work' ? "bg-purple-100" : "bg-amber-100"
            )}
            indicatorClassName={mode === 'work' ? "bg-purple-600" : "bg-amber-500"}
          />
          
          <div className="flex space-x-2 mb-6">
            <Button 
              variant={isRunning ? "outline" : "default"}
              onClick={toggleTimer}
              className={cn(
                mode === 'work' ? "hover:bg-purple-700" : "hover:bg-amber-600",
                isRunning ? "border-gray-300" : (
                  mode === 'work' ? "bg-purple-600" : "bg-amber-500"
                )
              )}
            >
              {isRunning ? (
                <><Pause className="h-4 w-4 mr-1" /> Pause</>
              ) : (
                <><Play className="h-4 w-4 mr-1" /> Start</>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetTimer}
            >
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
          
          <div className="w-full bg-gray-100 rounded-lg p-3">
            <p className="text-sm text-gray-500 mb-2">Timer Mode:</p>
            <Select 
              value={preset} 
              onValueChange={(value: TimerPreset) => switchPreset(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timer preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25/5">25/5 min</SelectItem>
                <SelectItem value="50/10">50/10 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      
      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} src="/notification-sound.mp3" />
    </Card>
  );
};

export default PomodoroTimer;
