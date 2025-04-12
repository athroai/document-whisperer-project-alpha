
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getMarkingRecords } from '@/services/markingEngine';
import { MarkingRecord } from '@/types/marking';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, MessageSquare, Sparkles } from 'lucide-react';

const StudentFeedbackPanel: React.FC = () => {
  const [records, setRecords] = useState<MarkingRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'quiz' | 'task' | 'athro_chat'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { state } = useAuth();

  useEffect(() => {
    const fetchRecords = async () => {
      if (!state.user) return;
      
      setIsLoading(true);
      try {
        const fetchedRecords = await getMarkingRecords({
          studentId: state.user.id,
          // Apply source filter if not 'all'
          ...(filter !== 'all' && { source: filter })
        });
        
        setRecords(fetchedRecords.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } catch (error) {
        console.error('Error fetching feedback records:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecords();
  }, [state.user, filter]);

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const sourceIcon = (source: string) => {
    switch (source) {
      case 'quiz':
        return <FileText className="h-4 w-4" />;
      case 'task':
        return <Calendar className="h-4 w-4" />;
      case 'athro_chat':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const renderRecords = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <Card key={i} className="mb-4">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <Skeleton className="h-16 w-full rounded-md" />
          </CardContent>
        </Card>
      ));
    }

    if (records.length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No feedback records found.</p>
          {filter !== 'all' && (
            <Button 
              variant="link" 
              onClick={() => setFilter('all')}
              className="mt-2"
            >
              View all feedback
            </Button>
          )}
        </div>
      );
    }

    return records.map(record => (
      <Card key={record.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{record.originalPrompt}</CardTitle>
            <Badge 
              variant="outline"
              className="flex items-center gap-1"
            >
              {sourceIcon(record.source)}
              <span>{record.source === 'quiz' ? 'Quiz' : 
                     record.source === 'task' ? 'Task' : 'Athro Chat'}</span>
            </Badge>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>{record.subject} {record.topic ? `- ${record.topic}` : ''}</span>
            <span>{formatDate(record.timestamp)}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-1">Your Answer:</div>
            <div className="bg-muted rounded-md p-3 text-sm">
              {record.studentAnswer}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1 flex justify-between">
              <span>Feedback:</span>
              <span className="text-sm text-muted-foreground">
                Score: {record.teacherMark?.score ?? record.aiMark.score}/
                {record.aiMark.outOf}
              </span>
            </div>
            
            <div className={`rounded-md p-3 text-sm ${
              record.teacherMark 
                ? 'bg-purple-50 border border-purple-100' 
                : 'bg-blue-50 border border-blue-100'
            }`}>
              <div className="flex items-start gap-2">
                {record.teacherMark ? (
                  <>
                    <Badge className="mt-1">Teacher Feedback</Badge>
                    <div>{record.teacherMark.comment || 'No additional comments.'}</div>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="mt-1">AI Feedback</Badge>
                    <div>{record.aiMark.comment}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Feedback</h2>
      </div>

      <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="quiz">Quiz Feedback</TabsTrigger>
          <TabsTrigger value="athro_chat">Athro Chat</TabsTrigger>
          <TabsTrigger value="task">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {renderRecords()}
        </TabsContent>
        
        <TabsContent value="quiz" className="mt-0">
          {renderRecords()}
        </TabsContent>
        
        <TabsContent value="athro_chat" className="mt-0">
          {renderRecords()}
        </TabsContent>
        
        <TabsContent value="task" className="mt-0">
          {renderRecords()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentFeedbackPanel;
