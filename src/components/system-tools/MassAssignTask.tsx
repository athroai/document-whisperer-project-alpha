
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, SendHorizonal } from 'lucide-react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { SystemToolsService, taskTemplates } from '@/services/systemToolsService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Class } from '@/types/teacher';

const MassAssignTask: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    (() => {
      const date = new Date();
      date.setDate(date.getDate() + 7); // Default to one week from now
      return date;
    })()
  );
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      if (user && user.uid) {
        try {
          const teacherClasses = await SystemToolsService.getClassesForTeacher(user.uid);
          setClasses(teacherClasses);
        } catch (error) {
          console.error('Error fetching classes:', error);
        }
      }
    };
    
    fetchClasses();
  }, [user]);
  
  const handleTaskChange = (value: string) => {
    setSelectedTaskId(value);
  };
  
  const toggleClassSelection = (classId: string) => {
    setSelectedClassIds(prev => 
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };
  
  const handleSelectAllClasses = () => {
    if (selectedClassIds.length === classes.length) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(classes.map(cls => cls.id));
    }
  };
  
  const handleAssignTask = async () => {
    if (!selectedTaskId) {
      toast({
        title: "No task selected",
        description: "Please select a task to assign.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedClassIds.length === 0) {
      toast({
        title: "No classes selected",
        description: "Please select at least one class.",
        variant: "destructive"
      });
      return;
    }
    
    if (!dueDate) {
      toast({
        title: "No due date selected",
        description: "Please select a due date for the task.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await SystemToolsService.assignTask(selectedTaskId, selectedClassIds, dueDate);
      
      const taskName = taskTemplates.find(t => t.id === selectedTaskId)?.title;
      toast({
        title: "Task assigned",
        description: `"${taskName}" has been assigned to ${selectedClassIds.length} class(es).`,
        variant: "default"
      });
      
      // Reset form
      setSelectedTaskId('');
      setSelectedClassIds([]);
    } catch (error) {
      console.error('Error assigning task:', error);
      toast({
        title: "Error",
        description: "Failed to assign task.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedTask = taskTemplates.find(task => task.id === selectedTaskId);
  const areAllClassesSelected = classes.length > 0 && selectedClassIds.length === classes.length;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SendHorizonal className="h-5 w-5 text-indigo-600" />
          Mass Assign Task
        </CardTitle>
        <CardDescription>
          Assign a pre-written task to multiple classes at once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Task Template</label>
          <Select value={selectedTaskId} onValueChange={handleTaskChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
              {taskTemplates.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedTask && (
            <p className="text-sm text-gray-500 pl-2 border-l-2 border-gray-200 mt-2">
              {selectedTask.description}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Target Classes</label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAllClasses}
              disabled={classes.length === 0}
            >
              {areAllClassesSelected ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          
          <div className="max-h-48 overflow-y-auto border rounded-md p-2">
            {classes.length === 0 ? (
              <p className="text-center py-4 text-gray-500">
                No classes available
              </p>
            ) : (
              <div className="space-y-2">
                {classes.map((cls) => (
                  <div key={cls.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                    <Checkbox 
                      id={`class-${cls.id}`}
                      checked={selectedClassIds.includes(cls.id)}
                      onCheckedChange={() => toggleClassSelection(cls.id)}
                    />
                    <label 
                      htmlFor={`class-${cls.id}`}
                      className="text-sm flex-grow cursor-pointer"
                    >
                      {cls.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Set Due Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP') : 'Select a due date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
                disabled={(date) => date <= new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleAssignTask} 
          disabled={!selectedTaskId || selectedClassIds.length === 0 || !dueDate || isLoading}
          className="w-full"
        >
          {isLoading ? "Assigning..." : "Assign Task"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MassAssignTask;
