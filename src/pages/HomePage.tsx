import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { enGB } from 'date-fns/locale';
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button';
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const HomePage: React.FC = () => {
  const { state: { user } } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Fix the error by ensuring that submissions is initialized properly
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  
  const fetchSubmissions = async () => {
    if (!user) return;
    
    setIsLoadingSubmissions(true);
    try {
      // Fix: assign the query result to a variable before getting data
      const submissionsQuery = supabase
        .from('task_submissions')
        .select('*, tasks(*)')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      const { data, error } = await submissionsQuery;
      
      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      toast.error('Failed to load your recent submissions');
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      toast.info('Please log in to access the homepage');
      return;
    }

    fetchSubmissions();
  }, [user, navigate]);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.displayName}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Submissions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[300px] w-full">
              {isLoadingSubmissions ? (
                <p>Loading submissions...</p>
              ) : submissions.length > 0 ? (
                <ul className="list-none space-y-2">
                  {submissions.map((submission: any) => (
                    <li key={submission.id} className="border rounded-md p-3">
                      <p className="font-medium">{submission.tasks?.title || 'Untitled Task'}</p>
                      <p className="text-sm text-gray-500">
                        Submitted on {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recent submissions found.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4 p-4">
            <Avatar>
              <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} />
              <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user?.displayName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500">Role: {user?.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Card */}
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calendar</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 p-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: enGB }) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  locale={enGB}
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p>Selected date: {date ? format(date, "PPP", { locale: enGB }) : 'No date selected'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
