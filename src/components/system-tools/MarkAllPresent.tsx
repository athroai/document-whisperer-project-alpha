
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
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
import { SystemToolsService } from '@/services/systemToolsService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Class } from '@/types/teacher';

const MarkAllPresent: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      if (user && user.id) {
        try {
          const teacherClasses = await SystemToolsService.getClassesForTeacher(user.id);
          setClasses(teacherClasses);
        } catch (error) {
          console.error('Error fetching classes:', error);
        }
      }
    };
    
    fetchClasses();
  }, [user]);
  
  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
  };
  
  const handleMarkAllPresent = async () => {
    if (!selectedClassId) {
      toast({
        title: "No class selected",
        description: "Please select a class first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await SystemToolsService.markAllPresent(selectedClassId, date);
      
      const selectedClass = classes.find(c => c.id === selectedClassId);
      toast({
        title: "Attendance recorded",
        description: `All students in ${selectedClass?.name} marked present for ${format(date, 'PPP')}.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to record attendance.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Mark All as Present
        </CardTitle>
        <CardDescription>
          Quickly record attendance for an entire class on a specific date.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Class</label>
          <Select value={selectedClassId} onValueChange={handleClassChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleMarkAllPresent} 
          disabled={!selectedClassId || isLoading}
          className="w-full"
        >
          {isLoading ? "Recording..." : "Mark All Present Today"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MarkAllPresent;
