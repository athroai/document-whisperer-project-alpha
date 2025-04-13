import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Assignment, Submission, OpenAnswer } from '@/types/assignment';
import { assignmentService } from '@/services/assignmentService';
import { Calendar, Upload, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import FileUpload from '@/components/FileUpload';
import { UploadMetadata } from '@/types/files';

const AssignmentSubmission: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useAuth();
  const { user } = state;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadAssignment = async () => {
      if (!id || !user?.id) return;
      
      setIsLoading(true);
      try {
        const fetchedAssignment = await assignmentService.getAssignmentById(id);
        
        if (!fetchedAssignment) {
          toast({
            title: "Assignment not found",
            description: "The requested assignment could not be found.",
            variant: "destructive",
          });
          navigate('/assignments');
          return;
        }
        
        setAssignment(fetchedAssignment);
        
        const submissions = await assignmentService.getSubmissions({
          assignmentId: id,
          studentId: user.id
        });
        
        if (submissions.length > 0) {
          const submission = submissions[0];
          setExistingSubmission(submission);
          
          if (fetchedAssignment.assignmentType === 'open-answer') {
            setAnswerText((submission.answers as OpenAnswer).text);
          } else if (fetchedAssignment.assignmentType === 'file-upload') {
            const fileAnswer = submission.answers as { fileUrls: string[], fileNames: string[] };
            setFileUrls(fileAnswer.fileUrls);
            setFileNames(fileAnswer.fileNames);
          }
        }
      } catch (error) {
        console.error('Error loading assignment:', error);
        toast({
          title: "Error loading assignment",
          description: "Could not load the assignment details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAssignment();
  }, [id, user?.id, navigate]);

  const handleSubmit = async () => {
    if (!assignment || !user?.id) return;
    
    setIsSubmitting(true);
    try {
      let answers: any;
      
      if (assignment.assignmentType === 'open-answer') {
        answers = { text: answerText };
      } else if (assignment.assignmentType === 'file-upload') {
        answers = { fileUrls, fileNames };
      } else {
        toast({
          title: "Unsupported assignment type",
          description: "This assignment type cannot be submitted from this page.",
          variant: "destructive",
        });
        return;
      }
      
      if (existingSubmission) {
        await assignmentService.updateSubmission(existingSubmission.id, {
          answers,
          submittedAt: new Date().toISOString(),
          status: "submitted"
        });
      } else {
        await assignmentService.createSubmission({
          assignmentId: assignment.id,
          submittedBy: user.id,
          submittedAt: new Date().toISOString(),
          status: "submitted",
          answers,
          teacherFeedback: null,
          aiFeedback: null,
          studentComment: null
        });
      }
      
      toast({
        title: "Assignment submitted",
        description: "Your work has been submitted successfully.",
      });
      
      navigate('/assignments');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Error submitting assignment",
        description: "Could not submit your work. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (metadata: UploadMetadata) => {
    setFileUrls(prev => [...prev, metadata.url]);
    setFileNames(prev => [...prev, metadata.filename]);
    
    toast({
      title: "File uploaded",
      description: `${metadata.filename} has been uploaded successfully.`,
    });
  };

  const handleRemoveFile = (index: number) => {
    setFileUrls(prev => prev.filter((_, i) => i !== index));
    setFileNames(prev => prev.filter((_, i) => i !== index));
  };

  const formatDueDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-80 mb-4" />
        <Skeleton className="h-6 w-64 mb-8" />
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
            
            <div className="mt-6">
              <Skeleton className="h-40 w-full" />
            </div>
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
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-bold mb-2">Assignment Not Found</h2>
        <p>The assignment you are looking for could not be found.</p>
        <Button onClick={() => navigate('/assignments')} className="mt-4">
          Back to Assignments
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
        <div className="flex items-center mt-1 text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Due {formatDueDate(assignment.dueDate)}</span>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Assignment Details</CardTitle>
            <Badge>{assignment.subject}{assignment.topic ? ` - ${assignment.topic}` : ''}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6">{assignment.description}</p>
          
          {assignment.assignmentType === 'open-answer' && (
            <div className="space-y-3">
              <label htmlFor="answer" className="block font-medium">
                Your Answer
              </label>
              <Textarea
                id="answer"
                placeholder="Type your answer here..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={10}
                className="w-full"
              />
              <p className="text-gray-500 text-sm">
                Write your answer in the box above. Make sure to address all parts of the question.
              </p>
            </div>
          )}
          
          {assignment.assignmentType === 'file-upload' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Upload Files</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Upload your completed work as a file. Accepted formats: PDF, Word, Excel, PowerPoint, images.
                </p>
                <FileUpload onFileUploaded={handleFileUpload} />
              </div>
              
              {fileUrls.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Uploaded Files</h3>
                  <ul className="border rounded-md divide-y">
                    {fileNames.map((name, index) => (
                      <li key={index} className="p-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <Upload className="h-4 w-4 mr-2 text-blue-500" />
                          <span>{name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/assignments')}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || (
              (assignment.assignmentType === 'open-answer' && !answerText) ||
              (assignment.assignmentType === 'file-upload' && fileUrls.length === 0)
            )}
          >
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : existingSubmission ? 'Update Submission' : 'Submit Assignment'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AssignmentSubmission;
