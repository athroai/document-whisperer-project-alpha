
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentService } from '@/services/assignmentService';
import FileUpload from '@/components/FileUpload';
import { Assignment, Submission } from '@/types/assignment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileDown, Clock, Calendar, Upload } from 'lucide-react';
import { format } from 'date-fns';

const StudentAssignmentViewPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user } = state;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string, name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId || !user?.id) return;
      
      setLoading(true);
      try {
        // Fetch the assignment details
        const fetchedAssignment = await assignmentService.getAssignmentById(assignmentId);
        if (!fetchedAssignment) {
          toast({
            title: "Assignment not found",
            description: "The requested assignment could not be found.",
            variant: "destructive"
          });
          navigate('/student/assignments');
          return;
        }
        
        setAssignment(fetchedAssignment);
        
        // Check if the student has already made a submission
        const submissions = await assignmentService.getSubmissions({
          assignmentId: assignmentId,
          studentId: user.id
        });
        
        if (submissions.length > 0) {
          const currentSubmission = submissions[0]; // Get the most recent submission
          setSubmission(currentSubmission);
          
          // If it's a text submission
          if ((currentSubmission.answers as any).text) {
            setSubmissionText((currentSubmission.answers as any).text);
          }
          
          // If it's file uploads, populate the uploaded files
          const fileAnswers = currentSubmission.answers as any;
          if (fileAnswers.fileUrls && fileAnswers.fileNames) {
            const files = fileAnswers.fileUrls.map((url: string, index: number) => ({
              url,
              name: fileAnswers.fileNames[index]
            }));
            setUploadedFiles(files);
          }
          
          setIsComplete(true);
        }
      } catch (error) {
        console.error('Error fetching assignment:', error);
        toast({
          title: "Error loading assignment",
          description: "Could not load assignment details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId, user?.id, navigate]);

  const handleFileUpload = (fileUrl: string, fileName: string) => {
    setUploadedFiles(prev => [...prev, { url: fileUrl, name: fileName }]);
    toast({
      title: "File uploaded",
      description: "Your file has been uploaded successfully."
    });
  };

  const handleSubmit = async () => {
    if (!user?.id || !assignment) return;
    
    if (!isComplete) {
      toast({
        title: "Incomplete submission",
        description: "Please check the box to confirm you've completed the assignment.",
        variant: "destructive"
      });
      return;
    }
    
    if (uploadedFiles.length === 0 && !submissionText) {
      toast({
        title: "Empty submission",
        description: "Please upload a file or enter text before submitting.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Construct the submission object based on what we have
      let answers;
      
      if (assignment.assignmentType === 'file-upload') {
        answers = {
          fileUrls: uploadedFiles.map(file => file.url),
          fileNames: uploadedFiles.map(file => file.name)
        };
      } else if (assignment.assignmentType === 'open-answer') {
        answers = {
          text: submissionText
        };
      } else {
        // Quiz type - would be handled differently
        answers = [];
      }
      
      const newSubmission: Omit<Submission, "id"> = {
        assignmentId: assignment.id,
        submittedBy: user.id,
        submittedAt: new Date().toISOString(),
        status: "submitted" as const, // Explicitly typed as the literal "submitted"
        answers,
        teacherFeedback: null,
        aiFeedback: null,
        studentComment: null
      };
      
      await assignmentService.createSubmission(newSubmission);
      
      toast({
        title: "Assignment submitted",
        description: "Thanks for submitting your work! Your teacher will review it soon. You'll get notified when feedback is ready."
      });
      
      // Navigate back to assignments list
      navigate('/student/assignments');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your work. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Assignment not found</h2>
          <p className="text-gray-600 mb-4">The requested assignment could not be found.</p>
          <Button onClick={() => navigate('/student/assignments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </Button>
        </div>
      </div>
    );
  }

  const isSubmitted = !!submission;
  const isPastDue = new Date(assignment.dueDate) < new Date();
  const canSubmit = !isSubmitted && !isPastDue;
  
  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="outline" 
          className="mb-4" 
          onClick={() => navigate('/student/assignments')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assignments
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">{assignment.title}</h1>
        <div className="flex flex-wrap gap-2 items-center text-gray-600 mb-4">
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            {assignment.subject}
          </span>
          <span className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-1" />
            Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
          <CardDescription>Instructions from your teacher</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>{assignment.description}</p>
            {assignment.instructions && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Instructions</h3>
                <p>{assignment.instructions}</p>
              </div>
            )}
          </div>
          
          {assignment.filesAttached && assignment.filesAttached.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Reference Materials</h3>
              <div className="space-y-2">
                {assignment.filesAttached.map((file, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="w-full justify-start text-left"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Download Resource {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isSubmitted && submission ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
            <CardDescription>
              Submitted on {format(new Date(submission.submittedAt), 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(submission.answers as any).text ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="whitespace-pre-wrap">{(submission.answers as any).text}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(submission.answers as any).fileUrls?.map((url: string, index: number) => (
                  <a 
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    <FileDown className="w-5 h-5 mr-2 text-blue-600" />
                    <span>{(submission.answers as any).fileNames?.[index] || `File ${index + 1}`}</span>
                  </a>
                ))}
              </div>
            )}
            
            {submission.status === "marked" && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Feedback</h3>
                
                {submission.teacherFeedback && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">Teacher Feedback</h4>
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p>{submission.teacherFeedback.comment}</p>
                      <p className="mt-2 font-medium">
                        Score: {submission.teacherFeedback.score}/{submission.teacherFeedback.outOf}
                      </p>
                    </div>
                  </div>
                )}
                
                {submission.aiFeedback && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">AI Feedback</h4>
                    <div className="bg-purple-50 p-3 rounded-md">
                      <p>{submission.aiFeedback.comment}</p>
                      {submission.aiFeedback.score !== undefined && (
                        <p className="mt-2 font-medium">
                          AI Score: {submission.aiFeedback.score}/10
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : isPastDue ? (
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Submission Deadline Passed
              </h3>
              <p className="text-red-700">
                The deadline for this assignment was {format(new Date(assignment.dueDate), 'MMM d, yyyy')}. 
                Please contact your teacher if you need to submit late work.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Work</CardTitle>
            <CardDescription>
              Upload files or type your answer below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(assignment.assignmentType === 'file-upload' || assignment.assignmentType === 'open-answer') && (
              <div>
                <h3 className="text-lg font-medium mb-3">Upload Files</h3>
                <FileUpload 
                  userId={user?.id || ''}
                  userRole="student"
                  onFileUploaded={handleFileUpload}
                />
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Uploaded Files:</h4>
                    {uploadedFiles.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center p-2 bg-gray-50 rounded-md"
                      >
                        <FileDown className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {(assignment.assignmentType === 'open-answer') && (
              <div>
                <h3 className="text-lg font-medium mb-3">Written Response</h3>
                <Textarea
                  placeholder="Type your answer here..."
                  className="min-h-32"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                />
              </div>
            )}
            
            <div className="pt-4 flex items-center space-x-2">
              <Checkbox 
                id="completion" 
                checked={isComplete} 
                onCheckedChange={(checked) => setIsComplete(!!checked)}
              />
              <label
                htmlFor="completion"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have completed this assignment
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !isComplete || (uploadedFiles.length === 0 && !submissionText)}
            >
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Assignment
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default StudentAssignmentViewPage;
