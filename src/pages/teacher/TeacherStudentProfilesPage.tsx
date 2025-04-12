
import React, { useState, useEffect } from 'react';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Search, ChevronRight, UserCircle, BookOpen, AlertTriangle, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Class, StudentDetail, Subject } from '@/types/teacher';

// Mock data for development - will be replaced with Firestore in production
const subjects: Subject[] = [
  { id: "maths", name: "Mathematics" },
  { id: "science", name: "Science" },
  { id: "english", name: "English" },
  { id: "history", name: "History" },
  { id: "geography", name: "Geography" }
];

// Mock classes
const mockClasses: Class[] = [
  { 
    id: "maths-y10-s1", 
    name: "Maths Year 10 Set 1", 
    teacher_id: "123456789",
    school_id: "school-1",
    subject: "maths",
    student_ids: ["1", "2", "3", "10"],
    yearGroup: "Year 10" 
  },
  { 
    id: "science-y11-s1", 
    name: "Science Year 11 Set 1", 
    teacher_id: "123456789",
    school_id: "school-1",
    subject: "science",
    student_ids: ["4", "5", "6", "9"],
    yearGroup: "Year 11" 
  },
  { 
    id: "english-y9-s1", 
    name: "English Year 9 Set 1", 
    teacher_id: "123456789",
    school_id: "school-1",
    subject: "english",
    student_ids: ["7", "8"],
    yearGroup: "Year 9" 
  }
];

// Mock students with extended information
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
    parentInquiry: false,
    subjectScores: {
      "maths": 82,
      "science": 78,
      "english": 70
    },
    confidenceScores: {
      "maths": 7,
      "science": 6,
      "english": 5
    },
    attendance: 92,
    quizResults: [
      { quizId: "q1", subject: "maths", score: 85, date: "2025-04-10" },
      { quizId: "q2", subject: "science", score: 78, date: "2025-04-09" }
    ]
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
    parentInquiry: false,
    subjectScores: {
      "maths": 95,
      "science": 88,
      "english": 90
    },
    confidenceScores: {
      "maths": 9,
      "science": 8,
      "english": 8
    },
    attendance: 98,
    quizResults: [
      { quizId: "q1", subject: "maths", score: 94, date: "2025-04-10" },
      { quizId: "q2", subject: "science", score: 89, date: "2025-04-09" }
    ]
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
    parentInquiry: false,
    subjectScores: {
      "maths": 74,
      "science": 77,
      "english": 72
    },
    confidenceScores: {
      "maths": 5,
      "science": 6,
      "english": 5
    },
    attendance: 85,
    quizResults: [
      { quizId: "q1", subject: "maths", score: 72, date: "2025-04-10" },
      { quizId: "q2", subject: "science", score: 75, date: "2025-04-09" }
    ]
  },
  // Adding more students
  { 
    id: "4", 
    name: "Emma Williams", 
    email: "emma.w@school.edu",
    avatarSrc: "", 
    status: "approved", 
    classId: "science-y11-s1",
    performance: 88,
    lastActive: "2025-04-11",
    parentInquiry: true,
    subjectScores: {
      "maths": 86,
      "science": 93,
      "english": 85
    },
    confidenceScores: {
      "maths": 7,
      "science": 9,
      "english": 7
    },
    attendance: 94,
    quizResults: [
      { quizId: "q3", subject: "science", score: 91, date: "2025-04-08" }
    ]
  },
  { 
    id: "5", 
    name: "Daniel Smith", 
    email: "daniel.s@school.edu",
    avatarSrc: "", 
    status: "approved", 
    classId: "science-y11-s1",
    performance: 62,
    lastActive: "2025-04-05",
    parentInquiry: false,
    subjectScores: {
      "maths": 58,
      "science": 65,
      "english": 60
    },
    confidenceScores: {
      "maths": 3,
      "science": 4,
      "english": 4
    },
    attendance: 78,
    quizResults: [
      { quizId: "q3", subject: "science", score: 62, date: "2025-04-08" }
    ]
  }
];

const TeacherStudentProfilesPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | 'all'>('all');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [targetNote, setTargetNote] = useState('');
  
  const { state } = useAuth();
  const { user } = state;

  useEffect(() => {
    // In production, this would fetch from Firestore
    // where teacher_id = user.id
    if (user) {
      // Simulating fetch from Firestore
      setTimeout(() => {
        setClasses(mockClasses);
        setStudents(mockStudents);
      }, 500);
    }
  }, [user]);

  // Filter students based on selected class and search term
  const filteredStudents = students.filter(student => {
    const matchesClass = selectedClass === 'all' || student.classId === selectedClass;
    const matchesSearch = searchTerm === '' || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesClass && matchesSearch;
  });

  const studentDetails = selectedStudent 
    ? students.find(s => s.id === selectedStudent)
    : null;

  const handleSetTarget = () => {
    if (targetNote.trim() && studentDetails) {
      // In production, this would update Firestore
      toast({
        title: "Target set",
        description: `Target note set for ${studentDetails.name}.`
      });
      setTargetNote('');
    }
  };

  const handleRecommendTask = () => {
    if (studentDetails) {
      // In production, this would trigger a task assignment flow
      toast({
        title: "Task recommendation",
        description: `Based on performance, recommended task for ${studentDetails.name}.`
      });
    }
  };

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Profiles</h1>
          <p className="text-gray-500">View and analyze student performance across your classes</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/3">
            <label htmlFor="class-filter" className="text-sm font-medium text-gray-700">Filter by Class</label>
            <select 
              id="class-filter" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full sm:w-2/3">
            <label htmlFor="search" className="text-sm font-medium text-gray-700">Search</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Search students by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Students</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const studentClass = classes.find(c => c.id === student.classId);
                    return (
                      <TableRow key={student.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedStudent(student.id)}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.avatarSrc} />
                              <AvatarFallback className="bg-purple-100 text-purple-700">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{studentClass?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={student.performance} className="w-24" />
                            <span className="text-sm font-medium">{student.performance}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{student.lastActive}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {student.status === 'approved' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            )}
                            {student.status === 'pending' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                            {student.status === 'removed' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Removed
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <UserCircle size={40} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No students found</p>
                      <p className="text-sm text-gray-400">Try adjusting your filters or search criteria</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Student Profile Dialog */}
        <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Student Profile</DialogTitle>
            </DialogHeader>
            {studentDetails && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 border-b pb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={studentDetails.avatarSrc} />
                    <AvatarFallback className="text-lg bg-purple-100 text-purple-700">
                      {studentDetails.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">{studentDetails.name}</h3>
                    <p className="text-sm text-gray-500">
                      {classes.find(c => c.id === studentDetails.classId)?.name || 'No class assigned'}
                    </p>
                    <div className="flex items-center mt-1 space-x-1 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        <Calendar size={12} className="mr-1" />
                        Attendance: {studentDetails.attendance || 0}%
                      </span>
                      {studentDetails.parentInquiry && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          <AlertTriangle size={12} className="mr-1" />
                          Parent Inquiry
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="subjects">Subject Performance</TabsTrigger>
                    <TabsTrigger value="quizzes">Quiz Results</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Performance Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Average Score</span>
                                <span className="font-medium">{studentDetails.performance}%</span>
                              </div>
                              <Progress value={studentDetails.performance} className="mt-1" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Attendance</span>
                                <span className="font-medium">{studentDetails.attendance || 0}%</span>
                              </div>
                              <Progress value={studentDetails.attendance || 0} className="mt-1" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Average Confidence</span>
                                <span className="font-medium">
                                  {studentDetails.confidenceScores 
                                    ? Math.round(Object.values(studentDetails.confidenceScores).reduce((a, b) => a + b, 0) / Object.values(studentDetails.confidenceScores).length * 10) / 10
                                    : 'N/A'}/10
                                </span>
                              </div>
                              {studentDetails.confidenceScores && (
                                <Progress 
                                  value={Object.values(studentDetails.confidenceScores).reduce((a, b) => a + b, 0) / 
                                    Object.values(studentDetails.confidenceScores).length * 10} 
                                  className="mt-1" 
                                />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Target Setting</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <Textarea 
                              placeholder="Set a learning target for this student..." 
                              value={targetNote}
                              onChange={(e) => setTargetNote(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" onClick={handleSetTarget}>
                                Set Target
                              </Button>
                            </div>
                            <div className="pt-2 border-t mt-2">
                              <Button variant="outline" size="sm" className="w-full" onClick={handleRecommendTask}>
                                <BookOpen size={16} className="mr-1" />
                                Recommend Task
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm text-gray-500">
                            Last active: {studentDetails.lastActive}
                          </div>
                          {studentDetails.quizResults && studentDetails.quizResults.length > 0 ? (
                            <ul className="space-y-2">
                              {studentDetails.quizResults.slice(0, 3).map((result, index) => (
                                <li key={index} className="flex justify-between text-sm border-b pb-2">
                                  <span>{result.subject} Quiz</span>
                                  <span>{result.score}% on {result.date}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">No recent activity recorded</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="subjects">
                    <Card>
                      <CardContent className="pt-4">
                        {studentDetails.subjectScores ? (
                          <div className="space-y-4">
                            {Object.entries(studentDetails.subjectScores).map(([subject, score]) => {
                              const confidence = studentDetails.confidenceScores?.[subject] || 0;
                              const subjectName = subjects.find(s => s.id === subject)?.name || subject;
                              return (
                                <div key={subject} className="space-y-2">
                                  <h4 className="font-medium">{subjectName}</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Performance</span>
                                        <span>{score}%</span>
                                      </div>
                                      <Progress value={score} className="mt-1" />
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Confidence</span>
                                        <span>{confidence}/10</span>
                                      </div>
                                      <Progress value={confidence * 10} className="mt-1" />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500">No subject data available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="quizzes">
                    <Card>
                      <CardContent className="pt-4">
                        {studentDetails.quizResults && studentDetails.quizResults.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Score</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {studentDetails.quizResults.map((result, index) => (
                                <TableRow key={index}>
                                  <TableCell>{subjects.find(s => s.id === result.subject)?.name || result.subject}</TableCell>
                                  <TableCell>{result.date}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Progress value={result.score} className="w-24" />
                                      <span>{result.score}%</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500">No quiz results available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end pt-2">
                  <Button variant="outline" onClick={() => setSelectedStudent(null)}>
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

export default TeacherStudentProfilesPage;
