
import React, { useState, useEffect } from 'react';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  FileText, 
  AlertTriangle, 
  Clock, 
  Download, 
  Send,
  Filter,
  Calendar
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  markAnswer,
  getMarkingRecords,
  updateMarkingRecord,
  saveTeacherMarkingStyle,
  getTeacherMarkingStyle
} from '@/services/markingEngine';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkingRecord, MarkingStyle } from '@/types/marking';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

const TeacherMarkingPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const [filter, setFilter] = useState("pending");
  const [subject, setSubject] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<MarkingRecord | null>(null);
  const [markingStyle, setMarkingStyle] = useState<MarkingStyle>("detailed");
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [records, setRecords] = useState<MarkingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarkingRecords = async () => {
      setIsLoading(true);
      if (user?.id) {
        try {
          const teacherStyle = await getTeacherMarkingStyle(user.id);
          setMarkingStyle(teacherStyle);
          
          let status: 'ai_only' | 'teacher_reviewed' | undefined;
          if (filter === 'pending') status = 'ai_only';
          else if (filter === 'marked') status = 'teacher_reviewed';
          
          const fetchedRecords = await getMarkingRecords({
            teacherId: user.id,
            status,
            subject: subject || undefined
          });
          
          setRecords(fetchedRecords);
        } catch (error) {
          console.error('Error fetching marking records:', error);
          toast({
            title: "Failed to load records",
            description: "Could not load marking records. Please try again.",
            variant: "destructive",
          });
        }
      }
      setIsLoading(false);
    };
    
    fetchMarkingRecords();
  }, [user?.id, filter, subject, date]);

  const handleMarkingStyleChange = async (value: string) => {
    const style = value as MarkingStyle;
    setMarkingStyle(style);
    
    if (user?.id) {
      try {
        await saveTeacherMarkingStyle(user.id, style);
        toast({
          title: "Marking style updated",
          description: `Your marking style preference has been set to ${style}.`,
        });
      } catch (error) {
        console.error('Error saving marking style:', error);
        toast({
          title: "Error saving preference",
          description: "Could not save your marking style preference.",
          variant: "destructive",
        });
      }
    }
  };

  const handleMarkAssignment = async () => {
    if (!selectedAssignment || !user?.id) return;
    
    try {
      await updateMarkingRecord(selectedAssignment.id, {
        score: finalScore,
        comment: teacherFeedback,
        override: true,
        finalFeedback: teacherFeedback
      });
      
      // Refresh the records list
      const updatedStatus = 'teacher_reviewed';
      const updatedRecords = await getMarkingRecords({
        teacherId: user.id,
        status: filter === 'all' ? undefined : (filter === 'pending' ? 'ai_only' : updatedStatus),
        subject: subject || undefined
      });
      
      setRecords(updatedRecords);
      setSelectedAssignment(null);
      setTeacherFeedback("");
      setFinalScore(null);
      
      toast({
        title: "Assignment marked",
        description: "You've successfully provided feedback for this submission.",
      });
    } catch (error) {
      console.error('Error marking assignment:', error);
      toast({
        title: "Error marking assignment",
        description: "Could not save your feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveAIMark = async () => {
    if (!selectedAssignment || !user?.id) return;
    
    try {
      await updateMarkingRecord(selectedAssignment.id, {
        score: selectedAssignment.aiMark.score,
        comment: `I agree with the AI assessment: ${selectedAssignment.aiMark.comment}`,
        override: false
      });
      
      // Refresh the records list
      const updatedStatus = 'teacher_reviewed';
      const updatedRecords = await getMarkingRecords({
        teacherId: user.id,
        status: filter === 'all' ? undefined : (filter === 'pending' ? 'ai_only' : updatedStatus),
        subject: subject || undefined
      });
      
      setRecords(updatedRecords);
      setSelectedAssignment(null);
      
      toast({
        title: "AI Mark Approved",
        description: "You've approved the AI marking for this submission.",
      });
    } catch (error) {
      console.error('Error approving AI mark:', error);
      toast({
        title: "Error approving AI mark",
        description: "Could not save your approval. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!selectedAssignment) return;
    
    toast({
      title: "Downloading submission",
      description: `Downloading submission as PDF.`,
    });
    
    // In a real app, this would generate and download a PDF
    console.log('Download functionality would be implemented here');
  };

  const getStudentName = (id: string): string => {
    // In a real app, this would fetch the student name from the database
    const studentMap: Record<string, string> = {
      'student1': 'Jamie Davies',
      'student2': 'Sarah Johnson',
      'student3': 'Michael Chen',
      'student4': 'Emma Williams',
      'anonymous': 'Anonymous Student'
    };
    
    return studentMap[id] || 'Unknown Student';
  };

  const formatDate = (isoString: string): string => {
    try {
      return new Date(isoString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const renderRecordList = () => {
    if (isLoading) {
      return Array(4).fill(0).map((_, i) => (
        <Card key={i} className="cursor-default">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="pb-2">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
          <CardFooter className="pt-0">
            <Skeleton className="h-3 w-28" />
          </CardFooter>
        </Card>
      ));
    }

    if (records.length === 0) {
      return (
        <div className="col-span-full p-8 text-center">
          <div className="text-gray-400 mb-4">No assignments match the selected filter</div>
          <Button onClick={() => setFilter("all")}>Show All Assignments</Button>
        </div>
      );
    }

    return records.map(record => (
      <Card 
        key={record.id} 
        className={`cursor-pointer hover:border-purple-300 transition-colors ${
          selectedAssignment?.id === record.id ? 'border-2 border-purple-500' : ''
        }`}
        onClick={() => {
          setSelectedAssignment(record);
          setFinalScore(record.aiMark.score);
          setTeacherFeedback(record.teacherMark?.comment || "");
        }}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <CardTitle className="text-base">{record.originalPrompt.substring(0, 30)}...</CardTitle>
            {record.teacherMark === null && <Clock className="h-5 w-5 text-amber-500" />}
            {record.teacherMark !== null && <Check className="h-5 w-5 text-green-500" />}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm">{getStudentName(record.submittedBy)}</p>
          <p className="text-xs text-gray-500">{record.subject} - {record.topic || 'General'}</p>
          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-gray-500">
              <FileText className="h-3 w-3 inline mr-1" />
              {record.source === 'quiz' ? 'Quiz' : 
               record.source === 'task' ? 'Task' : 'Athro Chat'}
            </div>
            {record.aiMark.score / record.aiMark.outOf < 0.5 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Low Score
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-gray-500 pt-0">
          Submitted: {formatDate(record.timestamp)}
        </CardFooter>
      </Card>
    ));
  };

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marking Panel</h1>
            <p className="text-gray-500">Review and mark student submissions</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-64">
              <Label htmlFor="marking-style">Marking Style</Label>
              <Select value={markingStyle} onValueChange={handleMarkingStyleChange}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select marking style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="headline-only">Headline Only</SelectItem>
                  <SelectItem value="encouraging">Encouraging</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Filter Submissions</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject-filter">Subject</Label>
                    <Select value={subject || ""} onValueChange={value => setSubject(value || null)}>
                      <SelectTrigger id="subject-filter">
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Subjects</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Submission Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <Button className="w-full" onClick={() => {
                    setSubject(null);
                    setDate(null);
                  }}>
                    Reset Filters
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs defaultValue="pending" value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All Submissions</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({records.filter(a => a.teacherMark === null).length})
            </TabsTrigger>
            <TabsTrigger value="marked">
              Marked ({records.filter(a => a.teacherMark !== null).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderRecordList()}
        </div>
        
        {selectedAssignment && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedAssignment.originalPrompt}</CardTitle>
                  <p className="text-gray-500">
                    {getStudentName(selectedAssignment.submittedBy)} - {selectedAssignment.subject} ({selectedAssignment.topic || 'General'})
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium mb-2">Student Submission</h3>
                <p className="text-sm">{selectedAssignment.studentAnswer}</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-md">
                <h3 className="text-sm font-medium mb-2">AI Assessment</h3>
                <div className="flex items-center mb-3">
                  <span className="font-medium text-blue-800">Score: </span>
                  <span className="ml-2">{selectedAssignment.aiMark.score}/{selectedAssignment.aiMark.outOf}</span>
                </div>
                <p className="text-sm text-blue-800">{selectedAssignment.aiMark.comment}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ai-score">AI Suggested Score</Label>
                  <div className="flex items-center mt-1">
                    <input
                      type="number"
                      id="ai-score"
                      value={selectedAssignment.aiMark.score}
                      readOnly
                      className="w-16 h-10 px-3 rounded-md border border-gray-300 bg-gray-100 text-center"
                    />
                    <span className="ml-2 text-gray-500">/ {selectedAssignment.aiMark.outOf}</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="teacher-score">Your Score</Label>
                  <div className="flex items-center mt-1">
                    <input
                      type="number"
                      id="teacher-score"
                      value={finalScore ?? ""}
                      onChange={(e) => setFinalScore(parseInt(e.target.value) || 0)}
                      min="0"
                      max={selectedAssignment.aiMark.outOf}
                      className="w-16 h-10 px-3 rounded-md border border-gray-300 text-center"
                    />
                    <span className="ml-2 text-gray-500">/ {selectedAssignment.aiMark.outOf}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="teacher-feedback">Your Feedback</Label>
                <Textarea
                  id="teacher-feedback"
                  placeholder="Enter your feedback for the student..."
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  className="mt-1 h-32"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedAssignment(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="secondary"
                onClick={handleApproveAIMark}
                disabled={selectedAssignment.teacherMark !== null}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve AI Mark
              </Button>
              <Button onClick={handleMarkAssignment}>
                <Send className="h-4 w-4 mr-2" />
                Submit Marking
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherMarkingPage;
