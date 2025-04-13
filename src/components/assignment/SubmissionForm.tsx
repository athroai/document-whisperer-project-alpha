
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Assignment, Submission, OpenAnswer, FileUploadAnswer } from '@/types/assignment';
import { assignmentService } from '@/services/assignmentService';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Schema for open answer form
const openAnswerSchema = z.object({
  text: z
    .string()
    .min(10, { message: "Your answer must be at least 10 characters long" })
    .max(10000, { message: "Your answer must be less than 10,000 characters" })
});

interface SubmissionFormProps {
  assignment: Assignment;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ assignment }) => {
  const { state } = useAuth();
  const { user } = state;
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof openAnswerSchema>>({
    resolver: zodResolver(openAnswerSchema),
    defaultValues: {
      text: ""
    }
  });

  const handleOpenAnswerSubmit = async (values: z.infer<typeof openAnswerSchema>) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please login to submit your assignment",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const answers: OpenAnswer = {
        text: values.text
      };
      
      const submission: Omit<Submission, "id"> = {
        assignmentId: assignment.id,
        submittedBy: user.id,
        submittedAt: new Date().toISOString(),
        status: "submitted",
        answers: answers,
        teacherFeedback: null,
        aiFeedback: null,
        studentComment: null
      };
      
      await assignmentService.createSubmission(submission);
      
      toast({
        title: "Assignment submitted",
        description: "Your work has been submitted successfully"
      });
      
      navigate("/student/assignments");
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please login to submit your assignment",
        variant: "destructive"
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, we'd upload files to storage and get URLs back
      // For now, we'll simulate successful uploads with mock URLs
      const mockFileUrls = selectedFiles.map((file, index) => 
        `https://mockurl.com/files/${assignment.id}/${user.id}/${index}_${file.name}`
      );
      
      const answers: FileUploadAnswer = {
        fileUrls: mockFileUrls,
        fileNames: selectedFiles.map(file => file.name)
      };
      
      const submission: Omit<Submission, "id"> = {
        assignmentId: assignment.id,
        submittedBy: user.id,
        submittedAt: new Date().toISOString(),
        status: "submitted",
        answers: answers,
        teacherFeedback: null,
        aiFeedback: null,
        studentComment: null
      };
      
      await assignmentService.createSubmission(submission);
      
      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${selectedFiles.length} file(s)`
      });
      
      navigate("/student/assignments");
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (assignment.assignmentType === "open-answer") {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleOpenAnswerSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Answer</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Type your answer here..."
                    className="min-h-[300px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Write a detailed response to the assignment task
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  if (assignment.assignmentType === "file-upload") {
    return (
      <form onSubmit={handleFileUploadSubmit} className="space-y-8">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <FileUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload your files</h3>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop files here, or click to select files
          </p>
          <Input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button variant="outline" type="button" className="mb-4">
              Select Files
            </Button>
          </label>
          
          {selectedFiles.length > 0 && (
            <div className="mt-6 text-left">
              <h4 className="text-sm font-medium mb-2">{selectedFiles.length} file(s) selected:</h4>
              <ul className="max-h-[200px] overflow-auto border rounded-md p-2">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="text-sm py-1 flex items-center">
                    <Upload className="h-4 w-4 mr-2 text-blue-500" />
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || selectedFiles.length === 0}>
            {isSubmitting ? "Uploading..." : "Upload Files"}
          </Button>
        </div>
      </form>
    );
  }

  // Default case (quiz type or unknown)
  return (
    <div className="py-4 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Incorrect Assignment Type</h3>
      <p className="text-gray-500 mb-4">
        This assignment type requires a different submission method.
        Please contact your teacher if you are seeing this message.
      </p>
    </div>
  );
};

export default SubmissionForm;
