
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, BookOpen, Edit, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { state } = useAuth();
  useOnboardingCheck();
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to Athro AI</h1>
        <p className="text-gray-600 mt-2">Your personalized GCSE study assistant</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-purple-500" />
              Study Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-gray-600">View your personalized study schedule and upcoming sessions.</p>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link to="/calendar">View Calendar</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
              Start Studying
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-gray-600">Begin a new study session with your AI tutors.</p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link to="/athro">Meet Your Tutors</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-green-500" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-gray-600">View and update your subjects and study preferences.</p>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link to="/settings">Profile Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Edit className="h-5 w-5 mr-2 text-amber-500" />
            Customize Your Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-4">
            Need to make changes to your study plan? Chat with AthroAi to update your subjects or schedule.
          </p>
          <Button asChild variant="outline" className="w-full border-amber-300 hover:bg-amber-50">
            <Link to="/athro-onboarding">Restart Onboarding</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
