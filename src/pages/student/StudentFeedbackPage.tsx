
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, MessageSquare, BookOpen, Star, Download, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentService } from '@/services/assignmentService';
import { Submission, Assignment } from '@/types/assignment';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const StudentFeedbackPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const [feedbackItems, setFeedbackItems] = useState<Array<{
    submission: Submission;
    assignment: Assignment;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<{
    submission: Submission;
    assignment: Assignment;
  } | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

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

  const viewFeedbackDetails = (item: { submission: Submission; assignment: Assignment }) => {
    setSelectedFeedback(item);
    setFeedbackDialogOpen(true);
  };

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
            <Card key={submission.id} className="mb-6 hover:border-blue-200 transition-colors cursor-pointer" onClick={() => viewFeedbackDetails({ submission, assignment })}>
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
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`${
                      scorePercentage >= 80 ? 'bg-green-100 text-green-800' :
                      scorePercentage >= 65 ? 'bg-blue-100 text-blue-800' :
                      scorePercentage >= 50 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      Score: {score}/{outOf}
                    </Badge>

                    {submission.status === 'returned' && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Feedback Available</span>
                      </Badge>
                    )}
                  </div>
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
                    Feedback Date
                  </h3>
                  <p className="text-sm text-gray-700">
                    {submission.teacherFeedback?.markedAt ? 
                      format(new Date(submission.teacherFeedback.markedAt), 'MMMM d, yyyy') : 
                      'Pending'}
                  </p>
                </div>
                
                <div className="flex justify-end pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    View Feedback Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}

      {/* Feedback Details Dialog */}
      {selectedFeedback && (
        <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedFeedback.assignment.title} - Feedback</DialogTitle>
              <DialogDescription>
                Feedback for your submission on {format(new Date(selectedFeedback.submission.submittedAt), 'MMMM d, yyyy')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-medium">Subject:</span> {selectedFeedback.assignment.subject}
                  {selectedFeedback.assignment.topic && ` - ${selectedFeedback.assignment.topic}`}
                </div>
                
                <Badge className={`${
                  (selectedFeedback.submission.teacherFeedback?.rating === 'excellent') ? 'bg-green-100 text-green-800' :
                  (selectedFeedback.submission.teacherFeedback?.rating === 'good') ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {selectedFeedback.submission.teacherFeedback?.rating?.replace('_', ' ') || 'Unrated'}
                </Badge>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Score</div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{selectedFeedback.submission.teacherFeedback?.score || 0} out of {selectedFeedback.submission.teacherFeedback?.outOf || 10}</span>
                  <span>{Math.round(((selectedFeedback.submission.teacherFeedback?.score || 0) / 
                    (selectedFeedback.submission.teacherFeedback?.outOf || 10)) * 100)}%</span>
                </div>
                <Progress 
                  value={Math.round(((selectedFeedback.submission.teacherFeedback?.score || 0) / 
                    (selectedFeedback.submission.teacherFeedback?.outOf || 10)) * 100)} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Teacher Feedback</div>
                <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap text-sm">
                  {selectedFeedback.submission.teacherFeedback?.comment || 'No written feedback provided.'}
                </div>
              </div>
              
              {selectedFeedback.submission.aiFeedback && (
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-1 flex items-center">
                    <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 mr-2">AI</Badge>
                    Additional AI Feedback
                  </div>
                  <div className="p-4 bg-purple-50 rounded-md whitespace-pre-wrap text-sm">
                    {selectedFeedback.submission.aiFeedback.comment}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                {/* File download if available */}
                {'fileUrls' in selectedFeedback.submission.answers && (
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
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StudentFeedbackPage;
