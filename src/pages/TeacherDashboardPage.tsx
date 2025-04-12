
import React, { useState } from 'react';
import { Users, TrendingUp, Clock, BookOpen, Upload, Settings } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

// Mock data for students
const mockStudents = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@school.edu',
    confidenceTrend: [
      { date: '2025-03-01', confidence: 6 },
      { date: '2025-03-08', confidence: 7 },
      { date: '2025-03-15', confidence: 6 },
      { date: '2025-03-22', confidence: 8 },
      { date: '2025-04-01', confidence: 9 },
    ],
    lastStudy: '2025-04-10',
    lastQuiz: {
      date: '2025-04-08',
      score: 85,
      subject: 'Mathematics'
    }
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.c@school.edu',
    confidenceTrend: [
      { date: '2025-03-01', confidence: 4 },
      { date: '2025-03-08', confidence: 5 },
      { date: '2025-03-15', confidence: 6 },
      { date: '2025-03-22', confidence: 7 },
      { date: '2025-04-01', confidence: 8 },
    ],
    lastStudy: '2025-04-11',
    lastQuiz: {
      date: '2025-04-09',
      score: 78,
      subject: 'Science'
    }
  },
  {
    id: '3',
    name: 'Emma Williams',
    email: 'emma.w@school.edu',
    confidenceTrend: [
      { date: '2025-03-01', confidence: 8 },
      { date: '2025-03-08', confidence: 7 },
      { date: '2025-03-15', confidence: 9 },
      { date: '2025-03-22', confidence: 8 },
      { date: '2025-04-01', confidence: 9 },
    ],
    lastStudy: '2025-04-09',
    lastQuiz: {
      date: '2025-04-07',
      score: 92,
      subject: 'English'
    }
  },
];

const TeacherDashboardPage = () => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [markingStyle, setMarkingStyle] = useState('detailed');
  const { toast } = useToast();
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // In a real app, we would handle the file upload to a storage service
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) have been uploaded successfully.`,
      });
    }
  };

  const student = selectedStudent 
    ? mockStudents.find(s => s.id === selectedStudent) 
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor student progress and manage class resources
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload size={18} />
            <label htmlFor="file-upload" className="cursor-pointer">
              Upload Resources
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
          </Button>
          <div className="flex items-center">
            <Settings size={18} className="mr-2" />
            <div className="space-y-1">
              <Label htmlFor="marking-style">Marking Style</Label>
              <Select value={markingStyle} onValueChange={setMarkingStyle}>
                <SelectTrigger id="marking-style" className="w-[180px]">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="headline-only">Headline Only</SelectItem>
                  <SelectItem value="encouraging">Encouraging</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Students</CardTitle>
              <CardDescription>Total students in class</CardDescription>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStudents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Average Confidence</CardTitle>
              <CardDescription>Class-wide confidence score</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7.5</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">16 sessions</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Students List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStudents.map((student) => (
                    <TableRow 
                      key={student.id} 
                      className={`cursor-pointer ${selectedStudent === student.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedStudent(student.id)}
                    >
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.lastStudy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {student ? `${student.name}'s Details` : 'Select a student to view details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {student ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <p className="text-sm text-muted-foreground mb-2">{student.email}</p>
                    
                    <h3 className="text-lg font-medium mt-4">Last Study Session</h3>
                    <p className="text-sm text-muted-foreground">{student.lastStudy}</p>
                    
                    <h3 className="text-lg font-medium mt-4">Last Quiz</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>Date: {student.lastQuiz.date}</p>
                      <p>Subject: {student.lastQuiz.subject}</p>
                      <p>Score: {student.lastQuiz.score}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Confidence Trend</h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={student.confidenceTrend}
                          margin={{
                            top: 5,
                            right: 10,
                            left: 0,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          />
                          <YAxis 
                            domain={[0, 10]} 
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            formatter={(value) => [`Confidence: ${value}`, 'Score']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          />
                          <Line
                            type="monotone"
                            dataKey="confidence"
                            stroke="#8884d8"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Actions</h3>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm">
                      <BookOpen size={16} className="mr-1" />
                      View Progress
                    </Button>
                    <Button size="sm" variant="outline">
                      Send Message
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a student from the list to view their details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
