
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, MessageSquare, BookOpen, Star, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentService } from '@/services/assignmentService';
import { Submission, Assignment } from '@/types/assignment';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const StudentFeedbackPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const [feedbackItems, setFeedbackItems] = useState<Array<{
    submission: Submission;
    assignment: Assignment;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedback = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        // Get all submissions for this student that have feedback
        const submissions = await assignmentService.getSubmissions({
          studentId: user.id,
          status: "marked"
        });

        // Get the corresponding assignments
        const feedbackWithAssignments = await Promise.all(
          submissions.map(async (submission) => {
            const assignment = await assignmentService.getAssignmentById(submission.assignmentId);
            return {
              submission,
              assignment: assignment!
            };
          })
        );

        setFeedbackItems(feedbackWithAssignments.filter(item => item.assignment !== null));
      } catch (error) {
        console.error('Error fetching feedback:', error);
        toast({
          title: "Error loading feedback",
          description: "Could not fetch your feedback. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadFeedback();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">My Feedback</h1>
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
              <div className="mt-4">
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!user) {
    return <div className="p-8">Please log in to view your feedback</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Feedback</h1>
      
      {feedbackItems.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No feedback yet</h3>
          <p className="text-gray-500 mb-4">
            You don't have any feedback on your assignments yet
          </p>
        </div>
      ) : (
        feedbackItems.map(({ submission, assignment }) => {
          // Determine score from either teacher or AI feedback
          const score = submission.teacherFeedback?.score ?? submission.aiFeedback?.score ?? 0;
          const outOf = submission.teacherFeedback?.outOf ?? 10;
          const scorePercentage = Math.round((score / outOf) * 100);
          
          return (
            <Card key={submission.id} className="mb-6">
              <CardHeader>
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      {assignment.title}
                    </CardTitle>
                    <CardDescription>
                      {assignment.subject}{assignment.topic ? ` - ${assignment.topic}` : ''}
                    </CardDescription>
                  </div>
                  
                  <Badge className={`${
                    scorePercentage >= 80 ? 'bg-green-100 text-green-800' :
                    scorePercentage >= 65 ? 'bg-blue-100 text-blue-800' :
                    scorePercentage >= 50 ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Score: {score}/{outOf}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Score</span>
                    <span>{scorePercentage}%</span>
                  </div>
                  <Progress value={scorePercentage} className="h-2" />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1 flex items-center">
                    <Star className="h-4 w-4 mr-1 text-amber-500" />
                    Submission Date
                  </h3>
                  <p className="text-sm text-gray-700">
                    {format(new Date(submission.submittedAt), 'MMMM d, yyyy')}
                  </p>
                </div>
                
                {submission.teacherFeedback && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-2">Teacher Feedback</h3>
                    <p className="text-sm">{submission.teacherFeedback.comment}</p>
                  </div>
                )}
                
                {submission.aiFeedback && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-2">AI Feedback</h3>
                    <p className="text-sm">{submission.aiFeedback.comment}</p>
                  </div>
                )}
                
                <div className="flex justify-between pt-2">
                  {(submission.answers as any).fileUrls && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download My Submission
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Ask for clarification",
                        description: "Your teacher will be notified about your question"
                      });
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask for Clarification
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  );
};

export default StudentFeedbackPage;
