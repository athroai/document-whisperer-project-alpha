import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HomePage: React.FC = () => {
  const { state } = useAuth();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Welcome, {state.user?.displayName || 'Student'}</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Study Calendar
            </CardTitle>
            <CardDescription>View your upcoming study sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Keep track of your scheduled study times and organize your learning.</p>
          </CardContent>
          <CardFooter>
            <Link to="/calendar" className="w-full">
              <Button className="w-full">
                Go to Calendar <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Timekeeper Zone
            </CardTitle>
            <CardDescription>Create your personalized study plan</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Set up your availability, select subjects, and generate an optimized study schedule.</p>
          </CardContent>
          <CardFooter>
            <Link to="/timekeeper" className="w-full">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Plan Your Studies <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Study Sessions
            </CardTitle>
            <CardDescription>Start learning with Athros</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Begin a study session with your AI subject mentors.</p>
          </CardContent>
          <CardFooter>
            <Link to="/study" className="w-full">
              <Button className="w-full" variant="outline">
                Start Studying <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Rest of the homepage content */}
    </div>
  );
};

export default HomePage;
