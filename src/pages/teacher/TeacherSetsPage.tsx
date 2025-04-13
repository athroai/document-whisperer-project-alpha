import React, { useState, useEffect } from 'react';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, AlertCircle, HelpCircle, AlertTriangle, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Class, StudentDetail, Subject } from '@/types/teacher';
import StudentClassService from '@/services/StudentClassService';

const subjects: Subject[] = [
  { id: "maths", name: "Mathematics" },
  { id: "science", name: "Science" },
  { id: "english", name: "English" },
  { id: "history", name: "History" },
  { id: "geography", name: "Geography" }
];

const yearGroups = ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11"];

const mockClasses: Class[] = [
  { 
    id: "maths-y10-s1", 
    name: "Set 1", 
    teacher_id: "123456789",
    school_id: "school-1",
    subject: "maths",
    student_ids: ["1", "2", "3"],
    yearGroup: "Year 10" 
  },
  { 
    id: "maths-y10-s2", 
    name: "Set 2", 
    teacher_id: "123456789",
    school_id: "school-1",
    subject: "maths",
    student_ids: ["4", "5"],
    yearGroup: "Year 10" 
  },
  { 
    id: "science-y11-s1", 
    name: "Set 1", 
    teacher_id: "123456789",
    school_id: "school-1",
    subject: "science",
    student_ids: ["6", "7", "8", "9"],
    yearGroup: "Year 11" 
  },
  { 
    id: "english-y9-s1", 
    name: "Set 1", 
    teacher_id: "123456789",
    school_id: "school-1",
    subject: "english",
    student_ids: ["10", "11", "12"],
    yearGroup: "Year 9" 
  }
];

const mockStudents: StudentDetail[] = [
  { 
    id: "1", 
    name: "Jamie Davies", 
    email: "jamie.d@school.edu",
    avatarSrc: "",
    status: "approved", 
    classId: "maths-y10-s1",
    performance: 85,
    lastActive: "2025-04-11",
    parentInquiry: false 
  },
  { 
    id: "2", 
    name: "Sarah Johnson", 
    email: "sarah.j@school.edu",
    avatarSrc: "", 
    status: "approved", 
    classId: "maths-y10-s1",
    performance: 92,
    lastActive: "2025-04-12",
    parentInquiry: false 
  },
  { 
    id: "3", 
    name: "Michael Chen", 
    email: "michael.c@school.edu",
    avatarSrc: "", 
    status: "pending", 
    classId: "maths-y10-s1",
    performance: 75,
    lastActive: "2025-04-10",
    parentInquiry: false 
  },
  { 
    id: "4", 
    name: "Emma Williams", 
    email: "emma.w@school.edu",
    avatarSrc: "", 
    status: "approved", 
    classId: "maths-y10-s2",
    performance: 88,
    lastActive: "2025-04-11",
    parentInquiry: true 
  },
  { 
    id: "5", 
    name: "Daniel Smith", 
    email: "daniel.s@school.edu",
    avatarSrc: "", 
    status: "removed", 
    classId: "maths-y10-s2",
    performance: 62,
    lastActive: "2025-04-05",
    parentInquiry: false 
  }
];

const TeacherSetsPage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [selectedYearGroup, setSelectedYearGroup] = useState(yearGroups[3]); // Year 10
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showNewSetDialog, setShowNewSetDialog] = useState(false);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  
  const { state } = useAuth();
  const { user } = state;

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setClasses(mockClasses);
        setStudents(mockStudents);
      }, 500);
    }
  }, [user]);

  const filteredSets = classes.filter(
    set => set.subject === selectedSubject && set.yearGroup === selectedYearGroup
  );

  const fetchSetStudents = async (setId: string) => {
    try {
      const studentIds = await StudentClassService.getClassStudents(setId);
      return students.filter(student => studentIds.includes(student.id));
    } catch (error) {
      console.error("Error fetching set students:", error);
      return [];
    }
  };

  const [setStudentsList, setSetStudentsList] = useState<StudentDetail[]>([]);

  useEffect(() => {
    if (selectedSet) {
      fetchSetStudents(selectedSet).then(setSetStudentsList);
    } else {
      setSetStudentsList([]);
    }
  }, [selectedSet, students]);

  const studentDetails = selectedStudent 
    ? students.find(s => s.id === selectedStudent)
    : null;

  const handleCreateNewSet = () => {
    setShowNewSetDialog(true);
  };

  const handleCloseNewSetDialog = () => {
    setShowNewSetDialog(false);
  };
  
  const handleAddStudent = () => {
    setShowAddStudentDialog(true);
  };
  
  const handleAddStudentSubmit = () => {
    if (selectedSet) {
      toast({
        title: "Student invited",
        description: `A student invitation has been sent with join code: ${joinCodeInput || 'CLASS123'}`
      });
      setShowAddStudentDialog(false);
      setJoinCodeInput('');
    }
  };

  const handleApproveStudent = (studentId: string) => {
    const updatedStudents = students.map(student => 
      student.id === studentId ? { ...student, status: "approved" as const } : student
    );
    setStudents(updatedStudents);
    
    toast({
      title: "Student approved",
      description: "Student has been approved for this set."
    });
  };

  const handleRemoveStudent = (studentId: string) => {
    const updatedStudents = students.map(student => 
      student.id === studentId ? { ...student, status: "removed" as const } : student
    );
    setStudents(updatedStudents);
    
    toast({
      title: "Student removed",
      description: "Student has been removed from this set."
    });
  };

  const handleCloseStudentProfile = () => {
    setSelectedStudent(null);
  };

  console.log("Student shape:", students);

  const setsPageContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Sets</h1>
          <p className="text-gray-500">View and manage your class sets and students</p>
        </div>
        <Button onClick={handleCreateNewSet} className="flex items-center gap-2">
          <Plus size={16} />
          Create New Set
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-base font-medium">Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedSubject} onValueChange={setSelectedSubject}>
              <TabsList className="mb-2 flex flex-wrap">
                {subjects.map(subject => (
                  <TabsTrigger key={subject.id} value={subject.id}>
                    {subject.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-base font-medium">Year Group</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedYearGroup} onValueChange={setSelectedYearGroup}>
              <TabsList className="mb-2 flex flex-wrap">
                {yearGroups.map(year => (
                  <TabsTrigger key={year} value={year}>
                    {year}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSets.length > 0 ? (
          filteredSets.map(set => (
            <Card 
              key={set.id} 
              className={`cursor-pointer hover:border-purple-300 transition-colors ${selectedSet === set.id ? 'border-2 border-purple-500' : ''}`}
              onClick={() => setSelectedSet(set.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle>{set.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {set.student_ids.length} students
                </p>
                <p className="text-sm text-muted-foreground">
                  {set.yearGroup} - {subjects.find(s => s.id === set.subject)?.name}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Alert className="col-span-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No sets found</AlertTitle>
            <AlertDescription>
              No sets found for the selected subject and year group. Create a new set to get started.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {selectedSet && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Students in {filteredSets.find(s => s.id === selectedSet)?.name}
            </h2>
            <Button onClick={handleAddStudent} size="sm" className="flex items-center gap-2">
              <Plus size={16} />
              Add Student
            </Button>
          </div>
          
          {setStudentsList.length > 0 ? (
            <div className="bg-white rounded-md border">
              {setStudentsList.map(student => (
                <div 
                  key={student.id}
                  className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedStudent(student.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={student.avatarSrc} />
                      <AvatarFallback className="bg-purple-200 text-purple-800">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-500">
                        Last active: {student.lastActive}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {student.status === 'approved' && (
                      <div className="bg-green-100 text-green-700 p-1 rounded-full">
                        <Check size={16} />
                      </div>
                    )}
                    {student.status === 'pending' && (
                      <div className="bg-amber-100 text-amber-700 p-1 rounded-full">
                        <HelpCircle size={16} />
                      </div>
                    )}
                    {student.status === 'removed' && (
                      <div className="bg-red-100 text-red-700 p-1 rounded-full">
                        <AlertCircle size={16} />
                      </div>
                    )}
                    {student.parentInquiry && (
                      <div className="bg-yellow-100 text-yellow-700 p-1 rounded-full">
                        <AlertTriangle size={16} />
                      </div>
                    )}
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No students</AlertTitle>
              <AlertDescription>
                No students found in this set. Share the class code to invite students.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <Dialog open={!!selectedStudent} onOpenChange={handleCloseStudentProfile}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>
              Comprehensive overview of student performance and activity
            </DialogDescription>
          </DialogHeader>
          {studentDetails && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg bg-purple-200 text-purple-800">
                    {studentDetails.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{studentDetails.name}</h3>
                  <p className="text-sm text-gray-500">
                    {filteredSets.find(s => s.id === studentDetails.classId)?.yearGroup} - 
                    {subjects.find(s => s.id === filteredSets.find(set => set.id === studentDetails.classId)?.subject)?.name} - 
                    {filteredSets.find(s => s.id === studentDetails.classId)?.name}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Performance</p>
                <div className="flex items-center space-x-2">
                  <Progress value={studentDetails.performance} className="flex-1" />
                  <span className="text-sm font-medium">{studentDetails.performance}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{studentDetails.status}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-500">Last Activity</p>
                  <p className="font-medium">{studentDetails.lastActive}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{studentDetails.email}</p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                {studentDetails.status === 'pending' && (
                  <Button onClick={() => handleApproveStudent(studentDetails.id)}>
                    Approve Student
                  </Button>
                )}
                {studentDetails.status !== 'removed' && (
                  <Button variant="destructive" onClick={() => handleRemoveStudent(studentDetails.id)}>
                    Remove from Set
                  </Button>
                )}
                <Button variant="secondary" onClick={handleCloseStudentProfile}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={showNewSetDialog} onOpenChange={setShowNewSetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Set</DialogTitle>
            <DialogDescription>
              Add a new class set for your students
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="set-name" className="text-sm font-medium">
                Set Name
              </label>
              <input
                id="set-name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g. Set 1, Group A"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="set-year" className="text-sm font-medium">
                Year Group
              </label>
              <select
                id="set-year"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={selectedYearGroup}
              >
                {yearGroups.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="set-subject" className="text-sm font-medium">
                Subject
              </label>
              <select
                id="set-subject"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={selectedSubject}
              >
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseNewSetDialog}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Set created",
                description: "Your new set has been created successfully."
              });
              setShowNewSetDialog(false);
            }}>
              Create Set
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Student to Set</DialogTitle>
            <DialogDescription>
              Add a student directly to this class
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="student-email" className="text-sm font-medium">
                Student Email
              </label>
              <input
                id="student-email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                type="email"
                placeholder="student@school.edu"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="student-name" className="text-sm font-medium">
                Student Name (Optional)
              </label>
              <input
                id="student-name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                type="text"
                placeholder="John Smith"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStudentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStudentSubmit}>
              Add Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return <TeacherDashboardLayout>{setsPageContent}</TeacherDashboardLayout>;
};

export default TeacherSetsPage;
