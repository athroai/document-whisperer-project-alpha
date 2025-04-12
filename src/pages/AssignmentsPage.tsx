
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Assignment } from '@/types/assignment';
import { assignmentService } from '@/services/assignmentService';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const AssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user } = state;
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAssignments = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // Get all assignments for the student's classes
        const fetchedAssignments = await assignmentService.getAssignments({
          visibility: "active",
          status: "published"
        });
        
        // Filter to show active assignments
        const filteredAssignments = fetchedAssignments.filter(a => {
          // In a real app, we would check if the student is in the class
          // For now, we'll show all assignments
          return true;
        });
        
        setAssignments(filteredAssignments);
        
        // Get student's submissions
        const allSubmissions = await assignmentService.getSubmissions({
          studentId: user.id
        });
        
        // Create a map of assignment ID to submission
        const submissionsMap: Record<string, any> = {};
        for (const submission of allSubmissions) {
          submissionsMap[submission.assignmentId] = submission;
        }
        
        setSubmissions(submissionsMap);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast({
          title: "Error loading assignments",
          description: "Could not fetch your assignments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAssignments();
  }, [user?.id, activeTab]);

  const isPending = (assignment: Assignment) => {
    // Check if assignment is not submitted
    return !submissions[assignment.id];
  };
  
  const isSubmitted = (assignment: Assignment) => {
    // Check if assignment is submitted but not marked or returned
    const submission = submissions[assignment.id];
    return submission && submission.status === "submitted";
  };
  
  const isMarked = (assignment: Assignment) => {
    // Check if assignment is marked or returned
    const submission = submissions[assignment.id];
    return submission && (submission.status === "marked" || submission.status === "returned");
  };

  const isDueDate = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    return isAfter(due, today);
  };

  const formatDueDate = (dueDate: string) => {
    try {
      return formatDistanceToNow(new Date(dueDate), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getAssignmentTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'Quiz';
      case 'file-upload':
        return 'File Upload';
      case 'open-answer':
        return 'Open Answer';
      default:
        return type;
    }
  };

  const handleStartAssignment = (assignment: Assignment) => {
    // Navigate to the appropriate page based on assignment type
    switch (assignment.assignmentType) {
      case 'quiz':
        navigate(`/quiz?assignmentId=${assignment.id}`);
        break;
      case 'file-upload':
        navigate(`/assignment/${assignment.id}`);
        break;
      case 'open-answer':
        navigate(`/assignment/${assignment.id}`);
        break;
      default:
        toast({
          title: "Unsupported assignment type",
          description: "This assignment type is not supported yet.",
          variant: "destructive",
        });
    }
  };

  const handleViewFeedback = (assignment: Assignment) => {
    navigate(`/feedback?submissionId=${submissions[assignment.id].id}`);
  };

  const renderAssignmentList = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <Card key={i} className="mb-4">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-24" />
          </CardFooter>
        </Card>
      ));
    }

    // Filter assignments based on the active tab
    const filteredAssignments = assignments.filter(assignment => {
      if (activeTab === "pending") return isPending(assignment);
      if (activeTab === "submitted") return isSubmitted(assignment);
      if (activeTab === "feedback") return isMarked(assignment);
      return true;
    });

    if (filteredAssignments.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {activeTab === "pending" && "No pending assignments"}
            {activeTab === "submitted" && "No assignments awaiting marking"}
            {activeTab === "feedback" && "No feedback available yet"}
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === "pending" 
              ? "You're all caught up!" 
              : activeTab === "submitted" 
              ? "You have not submitted any assignments yet."
              : "No marked assignments to show."}
          </p>
          {activeTab !== "pending" && (
            <Button onClick={() => setActiveTab("pending")}>View Pending Assignments</Button>
          )}
        </div>
      );
    }

    return filteredAssignments.map(assignment => (
      <Card key={assignment.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
              <div className="text-sm text-gray-500 flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span className={isDueDate(assignment.dueDate) ? "text-gray-500" : "text-red-500"}>
                  Due {formatDueDate(assignment.dueDate)}
                </span>
              </div>
            </div>
            <Badge variant="outline" className="bg-gray-50">
              {getAssignmentTypeLabel(assignment.assignmentType)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-2">{assignment.description}</p>
          <div className="text-xs text-gray-500">
            <span className="font-medium">Subject:</span> {assignment.subject}
            {assignment.topic && (
              <>
                {" • "}
                <span className="font-medium">Topic:</span> {assignment.topic}
              </>
            )}
          </div>
          
          {isMarked(assignment) && (
            <div className="mt-3 p-2 bg-green-50 rounded-md">
              <div className="flex items-center text-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="font-medium">Marked</span>
              </div>
              <div className="mt-1 text-sm">
                Score: {submissions[assignment.id]?.teacherFeedback?.score || submissions[assignment.id]?.aiFeedback?.score}/
                {submissions[assignment.id]?.teacherFeedback?.outOf || 5}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-3">
          {isPending(assignment) && (
            <Button
              onClick={() => handleStartAssignment(assignment)}
              className="w-full sm:w-auto"
            >
              Start Assignment
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          
          {isSubmitted(assignment) && (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center text-amber-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>Awaiting Feedback</span>
              </div>
              <Button variant="outline" disabled>
                Submitted
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
          
          {isMarked(assignment) && (
            <Button
              onClick={() => handleViewFeedback(assignment)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              View Feedback
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    ));
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Login Required</h2>
        <p>Please log in to view your assignments.</p>
        <Button onClick={() => navigate('/login')} className="mt-4">
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-500">View and complete your assigned work</p>
      </div>
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-4">
          {renderAssignmentList()}
        </TabsContent>
        
        <TabsContent value="submitted" className="mt-4">
          {renderAssignmentList()}
        </TabsContent>
        
        <TabsContent value="feedback" className="mt-4">
          {renderAssignmentList()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssignmentsPage;
