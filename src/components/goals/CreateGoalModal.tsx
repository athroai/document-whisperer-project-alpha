
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { NewGoalData, StudyGoal } from '@/types/goals';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from 'lucide-react';
import { format, addDays, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface CreateGoalModalProps {
  onCreateGoal: (goalData: NewGoalData) => Promise<void>;
  onUpdateGoal?: (goalId: string, goalData: NewGoalData) => Promise<void>;
  editingGoal?: StudyGoal | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Validation schema for the goal form
const formSchema = z.object({
  subject: z.string().min(1, { message: "Subject is required" }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }).max(100),
  description: z.string().min(10, { message: "Description should be more detailed" }).max(500),
  targetDate: z.date({
    required_error: "Target date is required",
  }).refine((date) => isBefore(new Date(), date), {
    message: "Target date must be in the future",
  }),
  motivation: z.string().optional(),
});

export function CreateGoalModal({ 
  onCreateGoal, 
  onUpdateGoal, 
  editingGoal,
  trigger,
  open,
  onOpenChange
}: CreateGoalModalProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Initialize the form with the editing goal data or defaults
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: editingGoal?.subject || "",
      title: editingGoal?.title || "",
      description: editingGoal?.description || "",
      targetDate: editingGoal ? new Date(editingGoal.targetDate) : addDays(new Date(), 7),
      motivation: "",
    },
  });
  
  // Update form values when editing goal changes
  useEffect(() => {
    if (editingGoal) {
      form.reset({
        subject: editingGoal.subject,
        title: editingGoal.title,
        description: editingGoal.description,
        targetDate: new Date(editingGoal.targetDate),
        motivation: "",
      });
    }
  }, [editingGoal, form]);
  
  // Handle controlled open state from parent
  useEffect(() => {
    if (open !== undefined) {
      setDialogOpen(open);
    }
  }, [open]);
  
  const handleOpenChange = (newOpen: boolean) => {
    setDialogOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const goalData: NewGoalData = {
        subject: values.subject,
        title: values.title,
        description: values.description,
        targetDate: format(values.targetDate, 'yyyy-MM-dd'),
        motivation: values.motivation,
      };
      
      if (editingGoal && onUpdateGoal) {
        await onUpdateGoal(editingGoal.id, goalData);
        toast({
          title: "Goal updated",
          description: "Your study goal has been updated successfully",
        });
      } else {
        await onCreateGoal(goalData);
        toast({
          title: "Goal created",
          description: "Your new study goal has been created",
        });
      }
      
      form.reset();
      handleOpenChange(false);
    } catch (error) {
      console.error("Error submitting goal:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your goal",
        variant: "destructive",
      });
    }
  };

  const subjectOptions = [
    { value: "Mathematics", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "English", label: "English" },
    { value: "History", label: "History" },
    { value: "Geography", label: "Geography" },
    { value: "Languages", label: "Languages" },
    { value: "Religious Education", label: "Religious Education" },
    { value: "Welsh", label: "Welsh" },
  ];

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            {editingGoal ? "Edit Goal" : "Create New Goal"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {editingGoal ? "Edit Study Goal" : "Create New Study Goal"}
          </DialogTitle>
          <DialogDescription>
            {editingGoal 
              ? "Update your existing study goal details below." 
              : "Define a new study goal to track your progress and stay motivated."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Master quadratic equations" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, specific goal title helps you stay focused
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what you want to achieve and why it's important..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Target Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When do you plan to complete this goal?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivation (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What motivates you to achieve this goal?" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Reminding yourself why this goal matters can help you stay motivated
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">
                {editingGoal ? "Save Changes" : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
