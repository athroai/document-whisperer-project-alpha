
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, BookOpen, Edit, BarChart2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudySessions } from '@/hooks/useStudySessions';
import { useToast } from '@/hooks/use-toast';
import { useReviewScheduler } from '@/hooks/useReviewScheduler';
import StudySessionList from '@/components/progress/StudySessionList';
import { formatDate } from '@/lib/utils';

const ProgressPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'unsure'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  
  const { sessions, isLoading, error, subjects } = useStudySessions(user?.id);
  const { scheduleReviewSession } = useReviewScheduler({
    subject: '',
    topic: '',
  });

  const handleScheduleReview = (subject: string, topic: string | undefined, sessionId?: string) => {
    if (!topic) {
      toast({
        title: "Cannot schedule review",
        description: "This session doesn't have a specific topic to review.",
        variant: "destructive",
      });
      return;
    }

    // Schedule a 30-minute review session by default
    scheduleReviewSession(subject, topic, 30);
    
    toast({
      title: "Review Scheduled",
      description: `A review session for ${topic} has been suggested in your calendar.`,
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p>Error loading your study sessions: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
          <p className="text-gray-500">Track your study sessions and review topics you need help with</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filter} onValueChange={(value: 'all' | 'unsure') => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sessions</SelectItem>
              <SelectItem value="unsure">Still unsure / No change</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={subjectFilter} onValueChange={(value) => setSubjectFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="subjects">
            <BookOpen className="w-4 h-4 mr-2" />
            By Subject
          </TabsTrigger>
          <TabsTrigger value="chronological">
            <Calendar className="w-4 h-4 mr-2" />
            Chronological
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subjects">
          <StudySessionList 
            sessions={sessions} 
            isLoading={isLoading}
            groupBySubject={true}
            confidenceFilter={filter}
            subjectFilter={subjectFilter}
            onScheduleReview={handleScheduleReview}
          />
        </TabsContent>

        <TabsContent value="chronological">
          <StudySessionList 
            sessions={sessions} 
            isLoading={isLoading}
            groupBySubject={false}
            confidenceFilter={filter}
            subjectFilter={subjectFilter}
            onScheduleReview={handleScheduleReview}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;
