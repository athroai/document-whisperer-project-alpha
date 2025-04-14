import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { ClipboardCheck, Clock, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  subject: string | null;
  status: string | null;
  created_at: string;
  set: {
    name: string;
  } | null;
  submissions: {
    id: string;
    status: string | null;
    submitted_at: string | null;
  }[] | null;
}

const MyWorkPage: React.FC = () => {
  const { state } = useAuth();
  const { user, loading: authLoading } = state;
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // First fetch the set_ids the student is associated with
        const { data: studentSets, error: setsError } = await supabase
          .from('student_sets')
          .select('set_id')
          .eq('student_id', user.id);
          
        if (setsError) throw setsError;
        
        // Extract the set_ids into an array
        const setIds = studentSets.map(set => set.set_id);
        
        // Now use those set_ids in the main query
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            id, 
            title, 
            description, 
            due_date,
            subject,
            status,
            created_at,
            set:set_id (
              name
            ),
            submissions:task_submissions (
              id,
              status,
              submitted_at
            )
          `)
          .in('set_id', setIds)
          .order('due_date', { ascending: true });
          
        if (error) throw error;
        
        setTasks(data || []);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading && user) {
      fetchTasks();
    } else if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);
  
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      setIsLoadingSubmissions(true);
      try {
        const { data, error } = await supabase
          .from('task_submissions')
          .select('*, tasks(*)')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setSubmissions(data || []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        toast.error('Failed to load your submissions');
      } finally {
        setIsLoadingSubmissions(false);
      }
    };
    
    if (!authLoading && user) {
      fetchSubmissions();
    }
  }, [user, authLoading]);
  
  const filterTasks = () => {
    if (!tasks) return [];
    
    switch (activeTab) {
      case 'pending':
        return tasks.filter(task => 
          !task.submissions?.some(sub => sub.status === 'submitted' || sub.status === 'reviewed')
        );
      case 'submitted':
        return tasks.filter(task => 
          task.submissions?.some(sub => sub.status === 'submitted')
        );
      case 'completed':
        return tasks.filter(task => 
          task.submissions?.some(sub => sub.status === 'reviewed')
        );
      default:
        return tasks;
    }
  };
  
  const filteredTasks = filterTasks();
  
  const getTaskStatus = (task: Task) => {
    const hasSubmission = task.submissions && task.submissions.length > 0;
    const latestSubmission = hasSubmission ? task.submissions[0] : null;
    
    if (latestSubmission?.status === 'reviewed') {
      return { label: 'Completed', icon: Check, color: 'bg-green-100 text-green-700' };
    }
    if (latestSubmission?.status === 'submitted') {
      return { label: 'Submitted', icon: ClipboardCheck, color: 'bg-blue-100 text-blue-700' };
    }
    
    const now = new Date();
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    if (dueDate && dueDate < now) {
      return { label: 'Overdue', icon: AlertCircle, color: 'bg-red-100 text-red-700' };
    }
    
    return { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-700' };
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center h-48">
          <LoadingSpinner className="h-10 w-10 text-purple-600 mb-4" />
          <p className="text-gray-500">Loading your work...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="text-red-500 mb-2">Error loading tasks</div>
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
      <h1 className="text-2xl font-bold mb-6">My Work</h1>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6 text-gray-500">
                  <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p className="font-medium">No {activeTab} tasks</p>
                  <p className="text-sm mt-1">
                    {activeTab === 'pending' 
                      ? 'You\'re all caught up!'
                      : activeTab === 'submitted' 
                        ? 'You haven\'t submitted any tasks yet'
                        : 'No completed tasks yet'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => {
                const status = getTaskStatus(task);
                const StatusIcon = status.icon;
                
                return (
                  <Card 
                    key={task.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/my-work/${task.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                          <h3 className="font-medium text-lg">{task.title}</h3>
                          <div className="text-sm text-gray-500 mt-1">
                            {task.subject} {task.set?.name ? `• ${task.set.name}` : ''}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2 md:mt-0">
                          {task.due_date && (
                            <div className="text-sm text-gray-500">
                              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                            </div>
                          )}
                          <span className={`flex items-center text-xs px-2 py-1 rounded-full ${status.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyWorkPage;
