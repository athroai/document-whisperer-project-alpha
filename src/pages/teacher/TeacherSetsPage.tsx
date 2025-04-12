
import React, { useState } from 'react';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, AlertCircle, HelpCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

// Mock data for the sets and students
const subjects = [
  { id: "maths", name: "Mathematics" },
  { id: "science", name: "Science" },
  { id: "english", name: "English" }
];

const yearGroups = ["Year 7", "Year 8", "Year 9", "Year 10", "Year 11"];

const sets = [
  { id: "maths-y10-s1", subject: "maths", yearGroup: "Year 10", name: "Set 1", studentCount: 15 },
  { id: "maths-y10-s2", subject: "maths", yearGroup: "Year 10", name: "Set 2", studentCount: 12 },
  { id: "science-y11-s1", subject: "science", yearGroup: "Year 11", name: "Set 1", studentCount: 18 },
  { id: "english-y9-s1", subject: "english", yearGroup: "Year 9", name: "Set 1", studentCount: 16 }
];

const students = [
  { 
    id: "1", 
    name: "Jamie Davies", 
    avatarSrc: "",
    status: "approved", 
    setId: "maths-y10-s1",
    performance: 85,
    lastActive: "2025-04-11",
    parentInquiry: false 
  },
  { 
    id: "2", 
    name: "Sarah Johnson", 
    avatarSrc: "", 
    status: "approved", 
    setId: "maths-y10-s1",
    performance: 92,
    lastActive: "2025-04-12",
    parentInquiry: false 
  },
  { 
    id: "3", 
    name: "Michael Chen", 
    avatarSrc: "", 
    status: "pending", 
    setId: "maths-y10-s1",
    performance: 75,
    lastActive: "2025-04-10",
    parentInquiry: false 
  },
  { 
    id: "4", 
    name: "Emma Williams", 
    avatarSrc: "", 
    status: "approved", 
    setId: "maths-y10-s2",
    performance: 88,
    lastActive: "2025-04-11",
    parentInquiry: true 
  },
  { 
    id: "5", 
    name: "Daniel Smith", 
    avatarSrc: "", 
    status: "removed", 
    setId: "maths-y10-s2",
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

  // Filtered sets based on selected subject and year group
  const filteredSets = sets.filter(
    set => set.subject === selectedSubject && set.yearGroup === selectedYearGroup
  );

  // Students in the selected set
  const setStudents = selectedSet 
    ? students.filter(student => student.setId === selectedSet)
    : [];

  // Find the currently selected student
  const studentDetails = selectedStudent 
    ? students.find(s => s.id === selectedStudent)
    : null;

  // Handle approving a student
  const handleApproveStudent = (studentId: string) => {
    toast({
      title: "Student approved",
      description: "Student has been approved for this set."
    });
    // In a real app, this would update the database
  };

  // Handle removing a student
  const handleRemoveStudent = (studentId: string) => {
    toast({
      title: "Student removed",
      description: "Student has been removed from this set."
    });
    // In a real app, this would update the database
  };

  // Handle closing the student profile dialog
  const handleCloseStudentProfile = () => {
    setSelectedStudent(null);
  };

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Sets</h1>
          <p className="text-gray-500">View and manage your class sets and students</p>
        </div>
        
        {/* Subject and Year Group Selection */}
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-base font-medium">Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedSubject} onValueChange={setSelectedSubject}>
                <TabsList className="mb-2">
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
                <TabsList className="mb-2">
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

        {/* Sets List */}
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
                  <p className="text-sm text-muted-foreground">{set.studentCount} students</p>
                  <p className="text-sm text-muted-foreground">{set.yearGroup} - {subjects.find(s => s.id === set.subject)?.name}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Alert className="col-span-full">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No sets found</AlertTitle>
              <AlertDescription>
                No sets found for the selected subject and year group.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Students List */}
        {selectedSet && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Students in {filteredSets.find(s => s.id === selectedSet)?.name}</h2>
            {setStudents.length > 0 ? (
              <div className="bg-white rounded-md border">
                {setStudents.map(student => (
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
                        <div className="text-sm text-gray-500">Last active: {student.lastActive}</div>
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
                  No students found in this set.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Student Profile Dialog */}
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
                      {filteredSets.find(s => s.id === studentDetails.setId)?.yearGroup} - 
                      {subjects.find(s => s.id === filteredSets.find(set => set.id === studentDetails.setId)?.subject)?.name} - 
                      {filteredSets.find(s => s.id === studentDetails.setId)?.name}
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
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherSetsPage;
