
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
            Start a Study Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Choose a subject to begin studying with your AI tutor.</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link to="/calendar">View Study Calendar</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/home">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyPage;
