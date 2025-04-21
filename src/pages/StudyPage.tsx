
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudyPage: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  useOnboardingCheck();
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!state.isLoading && !state.user) {
      navigate('/login', { state: { from: '/study' } });
    }
  }, [state.isLoading, state.user, navigate]);
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Study Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your study sessions</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-500" />
              Your Study Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>View and manage your upcoming study sessions in the calendar.</p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 w-full">
              <Link to="/calendar">Open Calendar</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
              Study With Athro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Start a study session with your AI tutor for personalized help.</p>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 w-full">
              <Link to="/athro-chat">Start Studying</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-500" />
              Pomodoro Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Use the Pomodoro technique to manage your study time effectively.</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/pomodoro">Open Timer</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudyPage;
