
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentService } from '@/services/assignmentService';
import { Submission, Assignment } from '@/types/assignment';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { FileDown, Eye, CheckCircle, Pencil, Filter, Search, DownloadCloud } from 'lucide-react';
import { format } from 'date-fns';

interface StudentSubmissionTableProps {
  submissions: (Submission & { assignment: Assignment })[];
  onMarkSubmission: (submission: Submission) => void;
}

const StudentSubmissionTable: React.FC<StudentSubmissionTableProps> = ({ 
  submissions, 
  onMarkSubmission 
}) => {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No submissions found matching your criteria.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>List of student submissions</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Assignment</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.submittedBy}</TableCell>
            <TableCell>{item.assignment.title}</TableCell>
            <TableCell>{item.assignment.subject}</TableCell>
            <TableCell>{format(new Date(item.submittedAt), 'MMM d, yyyy')}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                item.status === 'submitted' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : item.status === 'marked' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Button 
                variant={item.status === "submitted" ? "default" : "outline"} 
                size="sm" 
                onClick={() => onMarkSubmission(item)}
              >
                {item.status === "submitted" ? (
                  <>
                    <Pencil className="h-4 w-4 mr-2" />
                    View & Mark
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    View Feedback
                  </>
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

interface SubmissionDetailProps {
  submission: Submission | null;
  assignment: Assignment | null;
  onClose: () => void;
  onSaveFeedback: (submissionId: string, feedback: { score: number, comment: string }) => void;
}

const SubmissionDetail: React.FC<SubmissionDetailProps> = ({
  submission,
  assignment,
  onClose,
  onSaveFeedback
}) => {
  const [score, setScore] = useState<string>("0");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (submission?.teacherFeedback) {
      setScore(submission.teacherFeedback.score?.toString() || "0");
      setFeedback(submission.teacherFeedback.comment || "");
    } else {
      setScore("0");
      setFeedback("");
    }
  }, [submission]);

  if (!submission || !assignment) return null;

  const handleSaveFeedback = () => {
    if (!submission) return;
    
    setIsSaving(true);
    
    const scoreNum = parseInt(score) || 0;
    
    onSaveFeedback(submission.id, {
      score: scoreNum,
      comment: feedback
    });
    
    setIsSaving(false);
  };

  // Determine what type of answers we have
  const hasTextAnswer = (submission.answers as any).text;
  const hasFileAnswers = (submission.answers as any).fileUrls && (submission.answers as any).fileUrls.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Assignment Details</h3>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Title:</span>
            <span className="font-medium">{assignment.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subject:</span>
            <span>{assignment.subject}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Due Date:</span>
            <span>{format(new Date(assignment.dueDate), 'MMMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Student Submission</h3>
        <div className="mt-2 space-y-4">
          {hasTextAnswer && (
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">Written Response:</h4>
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                {(submission.answers as any).text}
              </div>
            </div>
          )}
          
          {hasFileAnswers && (
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">Uploaded Files:</h4>
              <div className="space-y-2">
                {(submission.answers as any).fileUrls.map((url: string, index: number) => (
                  <a 
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    <FileDown className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-sm">
                      {(submission.answers as any).fileNames?.[index] || `File ${index + 1}`}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {submission.aiFeedback && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">AI Feedback</h3>
          <div className="mt-2 bg-purple-50 p-4 rounded-md text-sm">
            <p>{submission.aiFeedback.comment}</p>
            {submission.aiFeedback.score !== undefined && (
              <p className="mt-2 font-medium">Score: {submission.aiFeedback.score}/10</p>
            )}
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-3">Teacher Feedback</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label htmlFor="score">Score:</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="10"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="col-span-2"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback:</Label>
            <Textarea
              id="feedback"
              placeholder="Provide your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSaveFeedback} 
          disabled={isSaving || !feedback.trim()}
        >
          {isSaving ? "Saving..." : "Save & Mark as Complete"}
        </Button>
      </div>
    </div>
  );
};

const TeacherMarkingPanel: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<(Submission & { assignment: Assignment })[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<(Submission & { assignment: Assignment })[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState<{ id: string, name: string }[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Get all submissions
        const allSubmissions = await assignmentService.getSubmissions();
        
        // Get all assignments to map to submissions
        const allAssignments = await assignmentService.getAssignments();
        
        // Combine the data
        const submissionsWithAssignments = allSubmissions.map(submission => {
          const matchingAssignment = allAssignments.find(a => a.id === submission.assignmentId);
          return {
            ...submission,
            assignment: matchingAssignment || {
              id: 'unknown',
              title: 'Unknown Assignment',
              subject: 'Unknown',
              assignedBy: '',
              classId: '',
              creationDate: '',
              description: '',
              dueDate: '',
              status: 'published' as const,
              visibility: 'active' as const,
              assignmentType: 'quiz' as const,
              linkedResources: [],
              topic: null, // Add the missing topic property
            }
          };
        });
        
        setSubmissions(submissionsWithAssignments);
        setFilteredSubmissions(submissionsWithAssignments);
        
        // Extract unique classes and subjects for filters
        const uniqueClasses = Array.from(new Set(allAssignments.map(a => a.classId)))
          .map(id => ({ id, name: `Class ${id}` }));
        
        const uniqueSubjects = Array.from(new Set(allAssignments.map(a => a.subject)));
        
        setClasses(uniqueClasses);
        setSubjects(uniqueSubjects);
      } catch (error) {
        console.error('Error loading submissions:', error);
        toast({
          title: "Failed to load submissions",
          description: "There was an error loading the submissions data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  useEffect(() => {
    // Apply filters whenever filter criteria change
    let filtered = [...submissions];
    
    if (selectedClass !== "all") {
      filtered = filtered.filter(sub => sub.assignment.classId === selectedClass);
    }
    
    if (selectedSubject !== "all") {
      filtered = filtered.filter(sub => sub.assignment.subject === selectedSubject);
    }
    
    if (selectedStatus !== "all") {
      filtered = filtered.filter(sub => sub.status === selectedStatus);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        sub => sub.submittedBy.toLowerCase().includes(query) || 
               sub.assignment.title.toLowerCase().includes(query)
      );
    }
    
    setFilteredSubmissions(filtered);
  }, [selectedClass, selectedSubject, selectedStatus, searchQuery, submissions]);

  const handleMarkSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    
    // Find the corresponding assignment
    const assignment = submissions.find(s => s.id === submission.id)?.assignment || null;
    setSelectedAssignment(assignment);
    
    setIsModalOpen(true);
  };

  const handleSaveFeedback = async (submissionId: string, feedbackData: { score: number, comment: string }) => {
    try {
      // First mark the submission
      const updatedSubmission = await assignmentService.markSubmission(
        submissionId,
        {
          score: feedbackData.score,
          outOf: 10,
          comment: feedbackData.comment,
          markedBy: user?.id || 'unknown',
          markedAt: new Date().toISOString()
        }
      );
      
      // Then return it to the student
      if (updatedSubmission) {
        await assignmentService.returnSubmission(submissionId);
      }
      
      // Update UI
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId ? { ...sub, status: 'returned' as const, teacherFeedback: {
          score: feedbackData.score,
          outOf: 10,
          comment: feedbackData.comment,
          markedBy: user?.id || 'unknown',
          markedAt: new Date().toISOString()
        }} : sub
      ));
      
      setIsModalOpen(false);
      
      toast({
        title: "Feedback saved",
        description: "Feedback saved and student notified.",
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "Failed to save feedback",
        description: "There was an error saving your feedback.",
        variant: "destructive"
      });
    }
  };

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Marking Panel</h1>
          <Button variant="outline" size="sm">
            <DownloadCloud className="w-4 h-4 mr-2" />
            Export Marking Log
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>View and mark student submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="w-full sm:w-auto">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-auto">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-auto">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="marked">Marked</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by student name or assignment title"
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <StudentSubmissionTable 
                  submissions={filteredSubmissions} 
                  onMarkSubmission={handleMarkSubmission}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Review</DialogTitle>
            <DialogDescription>
              Review the student's submission and provide feedback.
            </DialogDescription>
          </DialogHeader>
          
          <SubmissionDetail
            submission={selectedSubmission}
            assignment={selectedAssignment}
            onClose={() => setIsModalOpen(false)}
            onSaveFeedback={handleSaveFeedback}
          />
        </DialogContent>
      </Dialog>
    </TeacherDashboardLayout>
  );
};

export default TeacherMarkingPanel;
