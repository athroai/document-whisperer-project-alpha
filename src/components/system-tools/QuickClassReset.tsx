
import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCcw } from 'lucide-react';
import { Class, StudentDetail } from '@/types/teacher';
import { SystemToolsService } from '@/services/systemToolsService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const QuickClassReset: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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
  
  // Fetch students when a class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClassId) {
        try {
          const classStudents = await SystemToolsService.getStudentsForClass(selectedClassId);
          setStudents(classStudents);
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      } else {
        setStudents([]);
      }
      setSelectedStudents([]);
    };
    
    fetchStudents();
  }, [selectedClassId]);
  
  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
  };
  
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student.id));
    }
  };
  
  const handleReset = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student to reset.",
        variant: "destructive"
      });
      return;
    }
    
    setIsConfirmOpen(true);
  };
  
  const confirmReset = async () => {
    setIsLoading(true);
    try {
      await SystemToolsService.resetStudentMemory(selectedStudents);
      toast({
        title: "Memory reset successful",
        description: `Reset ${selectedStudents.length} student(s) successfully.`,
        variant: "default"
      });
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error resetting student memory:', error);
      toast({
        title: "Error",
        description: "Failed to reset student memory.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };
  
  const areAllSelected = students.length > 0 && selectedStudents.length === students.length;
  const selectedClass = classes.find(c => c.id === selectedClassId);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCcw className="h-5 w-5 text-purple-600" />
          Quick Class Reset
        </CardTitle>
        <CardDescription>
          Clear session history and memory for students who need a fresh start.
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
        
        {selectedClassId && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Select Students</label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAll}
                disabled={students.length === 0}
              >
                {areAllSelected ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              {students.length === 0 ? (
                <p className="text-center py-4 text-gray-500">
                  {selectedClassId ? 'No students in this class' : 'Select a class first'}
                </p>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                      <Checkbox 
                        id={`student-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => toggleStudentSelection(student.id)}
                      />
                      <label 
                        htmlFor={`student-${student.id}`}
                        className="text-sm flex-grow cursor-pointer"
                      >
                        {student.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleReset} 
          disabled={selectedStudents.length === 0}
          className="w-full"
        >
          Clear Memory for Selected
        </Button>
        
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Memory Reset</DialogTitle>
              <DialogDescription>
                You are about to reset the session memory for {selectedStudents.length} student(s)
                in {selectedClass?.name}. This will clear their Athro AI conversation history.
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmReset} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Reset Memory'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default QuickClassReset;
