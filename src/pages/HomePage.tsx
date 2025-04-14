
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Book, Calendar, Clock, FileText, Layers, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  subject: string | null;
  status: string | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  event_type: string;
}

interface QuizResult {
  id: string;
  subject: string;
  topic: string | null;
  score: number | null;
  max_score: number | null;
  created_at: string;
}

const HomePage: React.FC = () => {
  const { state } = useAuth();
  const { user, loading: authLoading } = state;
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // Fetch tasks for the user
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select(`
            id, 
            title, 
            description, 
            due_date,
            subject,
            status,
            set_id
          `)
          .in('set_id', [
            // Subquery to get set_ids for the student
            supabase
              .from('student_sets')
              .select('set_id')
              .eq('student_id', user.id)
          ])
          .order('due_date', { ascending: true })
          .limit(5);

        if (taskError) throw taskError;
        
        // Fetch upcoming calendar events
        const { data: eventData, error: eventError } = await supabase
          .from('calendar_events')
          .select('*')
          .or(`user_id.eq.${user.id},set_id.in.(${
            supabase
              .from('student_sets')
              .select('set_id')
              .eq('student_id', user.id)
          })`)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(3);
          
        if (eventError) throw eventError;
        
        // Fetch recent quiz results
        const { data: quizData, error: quizError } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (quizError) throw quizError;
        
        setTasks(taskData);
        setEvents(eventData);
        setQuizResults(quizData);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchUserData();
    } else if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center h-48">
          <LoadingSpinner className="h-10 w-10 text-purple-600 mb-4" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="text-red-500 mb-2">Error loading data</div>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">
          Welcome back, {user?.displayName || 'Student'}
        </h1>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/athro/select')}>Study Now</Button>
          <Button variant="outline" onClick={() => navigate('/files')}>
            Upload Materials
          </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Your pending assignments and homework</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/my-work')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Layers className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No pending tasks</p>
                <p className="text-sm">All caught up! Good job.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="p-4 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/my-work/${task.id}`)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{task.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {task.subject}
                    </p>
                    {task.due_date && (
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar Events */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your schedule</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/calendar')}
              >
                Calendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div 
                    key={event.id}
                    className="p-3 border rounded-md hover:bg-gray-50"
                  >
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(event.start_time), 'MMM d, h:mm a')}
                    </div>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        event.event_type === 'class' ? 'bg-purple-100 text-purple-700' :
                        event.event_type === 'exam' ? 'bg-red-100 text-red-700' :
                        event.event_type === 'study' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {event.event_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Quizzes */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Quiz Results</CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/quiz')}
              >
                Take Quiz
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {quizResults.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Book className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No quiz results yet</p>
                <p className="text-sm">Take a quiz to see your results</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizResults.map((quiz) => (
                  <div 
                    key={quiz.id}
                    className="p-3 border rounded-md hover:bg-gray-50"
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium">{quiz.subject}</h4>
                      <span className="font-medium">
                        {quiz.score}/{quiz.max_score}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {quiz.topic || 'General'}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(quiz.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Resources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Study Resources</CardTitle>
            <CardDescription>Materials & uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/files')}
              >
                <FileText className="mr-2 h-4 w-4" />
                My Files
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/athro/select')}
              >
                <Book className="mr-2 h-4 w-4" />
                Athro AI Study
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
