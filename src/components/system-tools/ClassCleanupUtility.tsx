
import React, { useState, useEffect } from 'react';
import { Trash2, Search, Filter } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/components/ui/dialog';
import { SystemToolsService } from '@/services/systemToolsService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Class, StudentDetail } from '@/types/teacher';

const ClassCleanupUtility: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTestDataOnly, setShowTestDataOnly] = useState(false);
  
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
  
  // Fetch students when a class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClassId) {
        try {
          const classStudents = await SystemToolsService.getStudentsForClass(selectedClassId);
          setStudents(classStudents);
          applyFilters(classStudents, searchQuery, showTestDataOnly);
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      } else {
        setStudents([]);
        setFilteredStudents([]);
      }
      setSelectedStudents([]);
    };
    
    fetchStudents();
  }, [selectedClassId]);
  
  // Apply filters when search or test data filter changes
  useEffect(() => {
    applyFilters(students, searchQuery, showTestDataOnly);
  }, [searchQuery, showTestDataOnly, students]);
  
  const applyFilters = (students: StudentDetail[], query: string, testOnly: boolean) => {
    let filtered = students;
    
    // Apply test data filter
    if (testOnly) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes('test') || 
        student.email.toLowerCase().includes('test') ||
        student.attendance !== undefined && student.attendance < 70
      );
    }
    
    // Apply search filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(lowerQuery) || 
        student.email.toLowerCase().includes(lowerQuery)
      );
    }
    
    setFilteredStudents(filtered);
  };
  
  const handleClassChange = (value: string) => {
    setSelectedClassId(value);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleTestDataOnly = () => {
    setShowTestDataOnly(!showTestDataOnly);
  };
  
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };
  
  const handleDeleteSelected = () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student to delete.",
        variant: "destructive"
      });
      return;
    }
    
    setIsConfirmOpen(true);
  };
  
  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await SystemToolsService.deleteTestStudents(selectedStudents);
      
      // Update the local state to reflect the deletion
      const updatedStudents = students.filter(student => !selectedStudents.includes(student.id));
      setStudents(updatedStudents);
      applyFilters(updatedStudents, searchQuery, showTestDataOnly);
      
      toast({
        title: "Students deleted",
        description: `Successfully deleted ${selectedStudents.length} student(s).`,
        variant: "default"
      });
      
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error deleting students:', error);
      toast({
        title: "Error",
        description: "Failed to delete students.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };
  
  const areAllSelected = filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-600" />
          Class Cleanup Utility
        </CardTitle>
        <CardDescription>
          Remove test students or temporary data from your classes.
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
          <>
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className={showTestDataOnly ? "bg-purple-100" : ""}
                onClick={toggleTestDataOnly}
                title="Show test data only"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Students</label>
                  <span className="text-xs text-gray-500">
                    ({filteredStudents.length} found)
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                  disabled={filteredStudents.length === 0}
                >
                  {areAllSelected ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                {filteredStudents.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">
                    {students.length > 0 
                      ? 'No students match the filter criteria' 
                      : selectedClassId 
                        ? 'No students in this class' 
                        : 'Select a class first'
                    }
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {filteredStudents.map((student) => {
                      const isTestData = 
                        student.name.toLowerCase().includes('test') || 
                        student.email.toLowerCase().includes('test') ||
                        (student.attendance !== undefined && student.attendance < 70);
                      
                      return (
                        <div 
                          key={student.id} 
                          className={`flex items-center space-x-2 p-1.5 rounded
                            ${isTestData ? 'bg-amber-50' : 'hover:bg-gray-50'}`
                          }
                        >
                          <Checkbox 
                            id={`student-${student.id}`}
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudentSelection(student.id)}
                          />
                          <div className="flex-grow">
                            <label 
                              htmlFor={`student-${student.id}`}
                              className="block text-sm font-medium cursor-pointer"
                            >
                              {student.name}
                            </label>
                            <span className="text-xs text-gray-500">{student.email}</span>
                          </div>
                          {isTestData && (
                            <span className="text-xs bg-amber-100 px-2 py-0.5 rounded text-amber-700">
                              Test Data
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-gray-500">
          {showTestDataOnly && "Filtering: Test Data Only"}
        </div>
        <Button 
          variant="destructive" 
          onClick={handleDeleteSelected} 
          disabled={selectedStudents.length === 0}
          className="ml-auto"
        >
          Delete Selected
        </Button>
        
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                You are about to permanently delete {selectedStudents.length} student(s).
                This action cannot be undone. Are you sure you want to continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default ClassCleanupUtility;
