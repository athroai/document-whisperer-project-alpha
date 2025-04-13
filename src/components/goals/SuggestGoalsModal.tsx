
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Check, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import GoalsService from '@/services/goalsService';
import { NewGoalData } from '@/types/goals';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

interface SuggestGoalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalSuggestionAccept: (goal: NewGoalData) => Promise<void>;
}

// Schema for the suggestion form
const formSchema = z.object({
  subject: z.string().min(1, { message: "Subject is required" }),
  examDate: z.date({
    required_error: "Exam date is required",
  }),
  weakAreas: z.string().min(1, { message: "Please enter at least one weak area" }),
  pace: z.enum(['slow', 'medium', 'fast'], {
    required_error: "Please select a pace",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function SuggestGoalsModal({ 
  open, 
  onOpenChange, 
  onGoalSuggestionAccept 
}: SuggestGoalsModalProps) {
  const [suggestions, setSuggestions] = useState<NewGoalData[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<Set<number>>(new Set());
  const [generationStep, setGenerationStep] = useState<'form' | 'suggestions'>('form');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      examDate: undefined,
      weakAreas: '',
      pace: 'medium',
    },
  });
  
  const handleGenerateSuggestions = (values: FormValues) => {
    const weakAreasList = values.weakAreas
      .split(',')
      .map(area => area.trim())
      .filter(area => area.length > 0);
      
    const suggestedGoals = GoalsService.generateGoalSuggestions(
      values.subject,
      format(values.examDate, 'yyyy-MM-dd'),
      weakAreasList,
      values.pace
    );
    
    setSuggestions(suggestedGoals);
    setGenerationStep('suggestions');
  };
  
  const toggleGoalSelection = (index: number) => {
    setSelectedGoals(prev => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return updated;
    });
  };
  
  const handleAcceptSelected = async () => {
    try {
      if (selectedGoals.size === 0) return;
      
      // Use Promise.all to create all selected goals in parallel
      await Promise.all(
        Array.from(selectedGoals).map(index => 
          onGoalSuggestionAccept(suggestions[index])
        )
      );
      
      // Reset the modal state
      setGenerationStep('form');
      setSuggestions([]);
      setSelectedGoals(new Set());
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error accepting goal suggestions:", error);
    }
  };
  
  const handleBack = () => {
    setGenerationStep('form');
  };
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setGenerationStep('form');
      setSuggestions([]);
      setSelectedGoals(new Set());
      form.reset();
    }
    onOpenChange(open);
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
  
  const paceOptions = [
    { 
      value: 'slow', 
      label: 'Gentle Pace', 
      description: 'Fewer, more focused goals with longer timeframes' 
    },
    { 
      value: 'medium', 
      label: 'Balanced Pace', 
      description: 'Moderate number of goals with reasonable deadlines' 
    },
    { 
      value: 'fast', 
      label: 'Intensive Pace', 
      description: 'More goals with shorter timeframes for quick progress' 
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[550px]">
        {generationStep === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Let Athro suggest study goals
              </DialogTitle>
              <DialogDescription>
                Tell us about your exam plans and we'll suggest personalized study goals.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGenerateSuggestions)} className="space-y-4 py-2">
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
                  name="examDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Exam Date</FormLabel>
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
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When is your exam or assessment due?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weakAreas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challenging Areas</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="E.g., quadratic equations, photosynthesis, essay writing" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        List areas you find challenging, separated by commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pace"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Study Pace</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {paceOptions.map(option => (
                            <FormItem
                              key={option.value}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={option.value} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium cursor-pointer">
                                  {option.label}
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  {option.description}
                                </FormDescription>
                              </div>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button type="submit">
                    Generate Suggestions
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Suggested Study Goals
              </DialogTitle>
              <DialogDescription>
                Select the goals you'd like to add to your dashboard.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="space-y-4">
                {suggestions.map((goal, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedGoals.has(index) 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                    onClick={() => toggleGoalSelection(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{goal.title}</h3>
                          <Badge variant="outline">{goal.subject}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        <div className="text-xs text-gray-500">
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedGoals.has(index) 
                          ? 'bg-green-500 text-white' 
                          : 'border border-gray-300'
                      }`}>
                        {selectedGoals.has(index) && <Check className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>
                ))}
                
                {suggestions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No suggestions could be generated. Try adjusting your criteria.
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <div className="flex justify-between w-full">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleAcceptSelected}
                  disabled={selectedGoals.size === 0}
                >
                  Add Selected Goals ({selectedGoals.size})
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SuggestGoalsModal;
