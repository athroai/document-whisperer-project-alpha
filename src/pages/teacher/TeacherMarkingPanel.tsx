
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Submission, FeedbackData, Assignment } from '@/types/assignment';
import { assignmentService } from '@/services/assignmentService';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardCheck, Search, Clock, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import MarkingDetailsView from '@/components/marking/MarkingDetailsView';
import { AssignmentStatusBadge } from '@/components/assignment/AssignmentStatusBadge';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const TeacherMarkingPanel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const assignmentIdFromUrl = searchParams.get('assignmentId');
  
  const { state } = useAuth();
  const { user } = state;
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(assignmentIdFromUrl);
  const [statusFilter, setStatusFilter] = useState<"submitted" | "marked" | "returned" | "all">("all");
  
  // Mock student data (would come from API in real app)
  const studentsMock = {
    "student1": "Alex Johnson",
    "student2": "Jamie Smith",
    "student3": "Pat Nguyen",
    // Add more as needed
  };
  
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        // Fetch assignments
        const teacherAssignments = await assignmentService.getAssignments({
          teacherId: user.id,
          status: "published"
        });
        setAssignments(teacherAssignments);
        
        // Fetch submissions
        let submissionFilter: {
          assignmentId?: string;
          status?: "submitted" | "marked" | "returned";
        } = {};
        
        if (selectedAssignmentId) {
          submissionFilter.assignmentId = selectedAssignmentId;
        }
        
        if (activeTab === 'pending') {
          submissionFilter.status = "submitted";
        } else if (activeTab === 'marked') {
          submissionFilter.status = "marked";
        } else if (activeTab === 'returned') {
          submissionFilter.status = "returned";
        }
        
        // Apply additional status filter if not 'all'
        if (statusFilter !== "all" && !submissionFilter.status) {
          submissionFilter.status = statusFilter;
        }
        
        const fetchedSubmissions = await assignmentService.getSubmissions(submissionFilter);
        setSubmissions(fetchedSubmissions);
        
        // Select the first submission to display details
        if (fetchedSubmissions.length > 0 && !selectedSubmission) {
          setSelectedSubmission(fetchedSubmissions[0]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error loading data",
          description: "Could not fetch submissions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user?.id, activeTab, selectedAssignmentId, selectedSubmission, statusFilter]);
  
  const handleSubmitFeedback = () => {
    // Reset selected submission to trigger reload
    setSelectedSubmission(null);
  };
  
  const filteredSubmissions = submissions.filter(submission => {
    const assignmentMatch = selectedAssignmentId ? submission.assignmentId === selectedAssignmentId : true;
    
    if (!searchTerm.trim()) return assignmentMatch;
    
    const termLower = searchTerm.toLowerCase();
    const studentName = studentsMock[submission.submittedBy]?.toLowerCase() || '';
    
    return assignmentMatch && studentName.includes(termLower);
  });
  
  const getAssignmentTitle = (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    return assignment?.title || 'Untitled Assignment';
  };
  
  const getStudentName = (id: string) => {
    return studentsMock[id] || 'Unknown Student';
  };
  
  const getStatusBadge = (status: "submitted" | "marked" | "returned") => {
    switch(status) {
      case "submitted":
        return (
          <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
            <AlertTriangle size={12} /> Under Review
          </Badge>
        );
      case "marked":
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <ClipboardCheck size={12} /> Marked
          </Badge>
        );
      case "returned":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle size={12} /> Returned
          </Badge>
        );
    }
  };
  
  const renderSubmissionsList = () => {
    if (loading) {
      return Array(3).fill(0).map((_, i) => (
        <Card key={i} className="mb-3 cursor-pointer">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
        </Card>
      ));
    }
    
    if (filteredSubmissions.length === 0) {
      return (
        <div className="text-center py-8">
          <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No submissions found</h3>
          <p className="text-gray-500">
            {activeTab === 'pending' 
              ? "There are no pending submissions to mark" 
              : activeTab === 'marked'
                ? "You haven't marked any submissions yet"
                : "No submissions have been returned to students"}
          </p>
        </div>
      );
    }
    
    return filteredSubmissions.map(submission => (
      <Card 
        key={submission.id} 
        className={`mb-3 cursor-pointer ${selectedSubmission?.id === submission.id ? 'border-blue-500' : ''}`}
        onClick={() => setSelectedSubmission(submission)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-base font-medium">{getStudentName(submission.submittedBy)}</h4>
              <p className="text-sm text-gray-500">{getAssignmentTitle(submission.assignmentId)}</p>
            </div>
            {getStatusBadge(submission.status)}
          </div>
        </CardContent>
      </Card>
    ));
  };
  
  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marking Panel</h1>
          <p className="text-gray-500">Review and provide feedback on student work</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List Panel */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <div className="flex space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by student name"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="assignment-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment
                  </label>
                  <Select 
                    value={selectedAssignmentId || ""} 
                    onValueChange={(value) => setSelectedAssignmentId(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Assignments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Assignments</SelectItem>
                      {assignments.map(assignment => (
                        <SelectItem key={assignment.id} value={assignment.id}>
                          {assignment.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select 
                    value={statusFilter} 
                    onValueChange={(value) => setStatusFilter(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Under Review</SelectItem>
                      <SelectItem value="marked">Marked</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <TabsList className="w-full">
                  <TabsTrigger value="pending" className="flex-1">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="marked" className="flex-1">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Marked
                  </TabsTrigger>
                  <TabsTrigger value="returned" className="flex-1">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Returned
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="space-y-3 h-[calc(100vh-430px)] overflow-y-auto pr-2">
              {renderSubmissionsList()}
            </div>
          </div>
          
          {/* Submission Details Panel */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <MarkingDetailsView
                submission={selectedSubmission}
                assignmentTitle={getAssignmentTitle(selectedSubmission.assignmentId)}
                studentName={getStudentName(selectedSubmission.submittedBy)}
                onSubmitFeedback={handleSubmitFeedback}
              />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a submission to mark</h3>
                  <p className="text-gray-500">
                    Click on a submission from the list to view details and provide feedback
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherMarkingPanel;
