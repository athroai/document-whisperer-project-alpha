import React, { useState } from 'react';
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
  Send 
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { saveMarkingStyle } from '@/services/fileService';
import { useAuth } from '@/contexts/AuthContext';

const assignments = [
  {
    id: "1",
    title: "Algebra Equations",
    subject: "Mathematics",
    setName: "Year 10 Set 1",
    studentName: "Jamie Davies",
    submissionDate: "2025-04-10",
    status: "pending",
    aiScore: 85,
    plagiarismRisk: "low",
    content: "This is the student's work on algebra equations...",
  },
  {
    id: "2",
    title: "Chemical Reactions",
    subject: "Science",
    setName: "Year 11 Set 1",
    studentName: "Sarah Johnson",
    submissionDate: "2025-04-11",
    status: "pending",
    aiScore: 92,
    plagiarismRisk: "low",
    content: "This is the student's work on chemical reactions...",
  },
  {
    id: "3",
    title: "Shakespeare Analysis",
    subject: "English",
    setName: "Year 9 Set 1",
    studentName: "Michael Chen",
    submissionDate: "2025-04-09",
    status: "pending",
    aiScore: 75,
    plagiarismRisk: "medium",
    content: "This is the student's analysis of Shakespeare...",
  },
  {
    id: "4",
    title: "Geometry Problems",
    subject: "Mathematics",
    setName: "Year 10 Set 2",
    studentName: "Emma Williams",
    submissionDate: "2025-04-11",
    status: "marked",
    aiScore: 88,
    plagiarismRisk: "low",
    content: "This is the student's work on geometry problems...",
  }
];

const TeacherMarkingPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const [filter, setFilter] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [markingStyle, setMarkingStyle] = useState<"detailed" | "headline-only" | "encouraging">("detailed");
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const classId = 'default_class';

  const handleMarkingStyleChange = async (value: string) => {
    const style = value as "detailed" | "headline-only" | "encouraging";
    setMarkingStyle(style);
    
    if (user?.id) {
      try {
        await saveMarkingStyle(user.id, classId, style);
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

  const filteredAssignments = filter === "all" 
    ? assignments 
    : assignments.filter(a => a.status === filter);

  const assignment = selectedAssignment 
    ? assignments.find(a => a.id === selectedAssignment) 
    : null;

  const handleMarkAssignment = () => {
    if (!assignment) return;
    
    toast({
      title: "Assignment marked",
      description: `You've successfully marked ${assignment.title} for ${assignment.studentName}.`,
    });
    
    setSelectedAssignment(null);
    setTeacherFeedback("");
    setFinalScore(null);
  };

  const handleDownload = () => {
    if (!assignment) return;
    
    toast({
      title: "Downloading assignment",
      description: `Downloading ${assignment.title} as PDF.`,
    });
  };

  const markingPageContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marking Panel</h1>
          <p className="text-gray-500">Review and mark student submissions</p>
        </div>
        
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
      </div>
      
      <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All Assignments</TabsTrigger>
          <TabsTrigger value="pending">Pending ({assignments.filter(a => a.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="marked">Marked ({assignments.filter(a => a.status === 'marked').length})</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map(assignment => (
            <Card 
              key={assignment.id} 
              className={`cursor-pointer hover:border-purple-300 transition-colors ${
                selectedAssignment === assignment.id ? 'border-2 border-purple-500' : ''
              }`}
              onClick={() => {
                setSelectedAssignment(assignment.id);
                setFinalScore(assignment.aiScore);
                setTeacherFeedback("");
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-base">{assignment.title}</CardTitle>
                  {assignment.status === 'pending' && <Clock className="h-5 w-5 text-amber-500" />}
                  {assignment.status === 'marked' && <Check className="h-5 w-5 text-green-500" />}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm">{assignment.studentName}</p>
                <p className="text-xs text-gray-500">{assignment.setName}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-gray-500">
                    <FileText className="h-3 w-3 inline mr-1" />
                    {assignment.subject}
                  </div>
                  {assignment.plagiarismRisk === 'medium' && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Check Originality
                    </Badge>
                  )}
                  {assignment.plagiarismRisk === 'high' && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Plagiarism Risk
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="text-xs text-gray-500 pt-0">
                Submitted: {assignment.submissionDate}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full p-8 text-center">
            <div className="text-gray-400 mb-4">No assignments match the selected filter</div>
            <Button onClick={() => setFilter("all")}>Show All Assignments</Button>
          </div>
        )}
      </div>
      
      {assignment && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{assignment.title}</CardTitle>
                <p className="text-gray-500">
                  {assignment.studentName} - {assignment.setName}
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
              <p className="text-sm">{assignment.content}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai-score">AI Suggested Score</Label>
                <div className="flex items-center mt-1">
                  <input
                    type="number"
                    id="ai-score"
                    value={assignment.aiScore}
                    readOnly
                    className="w-16 h-10 px-3 rounded-md border border-gray-300 bg-gray-100 text-center"
                  />
                  <span className="ml-2 text-gray-500">/ 100</span>
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
                    max="100"
                    className="w-16 h-10 px-3 rounded-md border border-gray-300 text-center"
                  />
                  <span className="ml-2 text-gray-500">/ 100</span>
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
            <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAssignment}>
              <Send className="h-4 w-4 mr-2" />
              Submit Marking
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );

  return <TeacherDashboardLayout>{markingPageContent}</TeacherDashboardLayout>;
};

export default TeacherMarkingPage;
