
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RefreshCw } from 'lucide-react';

const PomodoroPage: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const navigate = useNavigate();
  
  // Calculate progress percentage
  const totalSeconds = 25 * 60;
  const remainingSeconds = (minutes * 60) + seconds;
  const progressPercentage = 100 - ((remainingSeconds / totalSeconds) * 100);
  
  // Timer logic
  useEffect(() => {
    let interval: number | null = null;
    
    if (isActive && !isPause) {
      interval = window.setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer complete
          setIsActive(false);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPause, minutes, seconds]);
  
  const startTimer = () => {
    setIsActive(true);
    setIsPause(false);
  };
  
  const pauseTimer = () => {
    setIsPause(true);
  };
  
  const resetTimer = () => {
    setMinutes(25);
    setSeconds(0);
    setIsActive(false);
    setIsPause(false);
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2" 
          onClick={() => navigate('/home')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Pomodoro Timer</h1>
      </div>
      
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Focus Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <span className="text-6xl font-bold">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
          
          <div className="flex justify-center space-x-4">
            {!isActive ? (
              <Button onClick={startTimer} className="px-6">
                <Play className="h-4 w-4 mr-2" /> Start
              </Button>
            ) : !isPause ? (
              <Button onClick={pauseTimer} variant="outline" className="px-6">
                <Pause className="h-4 w-4 mr-2" /> Pause
              </Button>
            ) : (
              <Button onClick={startTimer} className="px-6">
                <Play className="h-4 w-4 mr-2" /> Resume
              </Button>
            )}
            <Button onClick={resetTimer} variant="secondary">
              <RefreshCw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500">
          <p className="mx-auto">Work for 25 minutes, then take a 5 minute break</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PomodoroPage;
