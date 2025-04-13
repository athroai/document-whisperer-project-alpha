
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Assignment } from '@/types/assignment';
import { useAuth } from '@/contexts/AuthContext';
import ResourceUpload from './ResourceUpload';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

// Schema for form validation
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  subject: z.string({ required_error: "Subject is required" }),
  topic: z.string().optional(),
  classId: z.string({ required_error: "Class is required" }),
  assignmentType: z.enum(["quiz", "file-upload", "open-answer"]),
  dueDate: z.date({ required_error: "Due date is required" }),
  status: z.enum(["draft", "published"]),
  linkedResources: z.array(z.string()).default([]),
  instructions: z.string().optional(),
  filesAttached: z.array(z.string()).default([]),
  aiSupportEnabled: z.boolean().default(false), // Added AI support field
});

interface CreateAssignmentFormProps {
  onSubmit: (data: Omit<Assignment, "id">) => void;
  onCancel: () => void;
}

const CreateAssignmentForm: React.FC<CreateAssignmentFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const { state } = useAuth();
  const { user } = state;
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  
  // Mock class data (would come from API in real app)
  const classesMock = [
    { id: "class1", name: "Year 10 Mathematics" },
    { id: "class2", name: "Year 11 Biology" },
    { id: "class3", name: "Year 9 Science" }
  ];
  
  // Mock subject data (would come from API in real app)
  const subjectsMock = [
    { id: "mathematics", name: "Mathematics" },
    { id: "science", name: "Science" },
    { id: "english", name: "English" }
  ];
  
  // Mock topics by subject
  const topicsBySubject: Record<string, string[]> = {
    "mathematics": ["percentages", "algebra", "geometry", "statistics"],
    "science": ["cells", "photosynthesis", "forces", "electricity"],
    "english": ["poetry", "shakespeare", "creative writing", "non-fiction"]
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      topic: "",
      classId: "",
      assignmentType: "quiz",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week from now
      status: "draft",
      linkedResources: [],
      instructions: "",
      filesAttached: [],
      aiSupportEnabled: true, // Default to enabled
    },
  });

  const watchSubject = form.watch("subject");
  
  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user?.id) return;
    
    const assignmentData: Omit<Assignment, "id"> = {
      title: values.title,
      description: values.description,
      assignedBy: user.id,
      subject: values.subject,
      topic: values.topic || null,
      classId: values.classId,
      dueDate: values.dueDate.toISOString(),
      creationDate: new Date().toISOString(),
      visibility: "active",
      assignmentType: values.assignmentType,
      status: values.status,
      linkedResources: values.linkedResources,
      instructions: values.instructions || values.description,
      filesAttached: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      aiSupportEnabled: values.aiSupportEnabled,
    };
    
    onSubmit(assignmentData);
  };

  const handleResourceUploadComplete = () => {
    // In a real app, this would fetch the latest uploaded resources
    // For now, we'll simulate adding a resource ID
    const mockResourceId = `resource_${Date.now()}`;
    setUploadedFiles([...uploadedFiles, mockResourceId]);
    form.setValue('filesAttached', [...uploadedFiles, mockResourceId]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignment Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a title for your assignment" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classesMock.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of the assignment" 
                  rows={2}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Instructions</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide detailed instructions for students" 
                  rows={4}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Include specific requirements, formatting details, or step-by-step guidance
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjectsMock.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={!watchSubject}>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {watchSubject && topicsBySubject[watchSubject]?.map(topic => (
                      <SelectItem key={topic} value={topic}>
                        {topic.charAt(0).toUpperCase() + topic.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Helps categorize and organize assignments
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="assignmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignment Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="file-upload">File Upload</SelectItem>
                    <SelectItem value="open-answer">Open Answer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <FormLabel className="block mb-4">Attach Resources</FormLabel>
            <div className="mb-4">
              <ResourceUpload 
                onUploadComplete={handleResourceUploadComplete}
                subjectId={form.getValues().subject}
                classId={form.getValues().classId}
              />
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">{uploadedFiles.length} file(s) attached</p>
                <ul className="text-sm text-gray-600">
                  {uploadedFiles.map((fileId, index) => (
                    <li key={fileId} className="flex items-center">
                      <Upload className="h-3 w-3 mr-2" />
                      File {index + 1}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="aiSupportEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Enable Athro AI Support</FormLabel>
                <FormDescription>
                  Allow students to access Athro AI assistance during their study session
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="published">Publish Immediately</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Draft assignments won't be visible to students until published
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">Create Assignment</Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateAssignmentForm;
