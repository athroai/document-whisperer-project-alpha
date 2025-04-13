
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, FileDown, Upload, CheckCircle, AlertCircle, FileCheck, Eye, Play, MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { assignmentService } from '@/services/assignmentService';
import { StudentAssignmentView } from '@/types/assignment';
import { format } from 'date-fns';
import StudySessionCard from '@/components/student/StudySessionCard';

const StudentAssignmentsPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const [assignments, setAssignments] = useState<StudentAssignmentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    const loadAssignments = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const studentAssignments = await assignmentService.getStudentAssignments(user.id);
        setAssignments(studentAssignments);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast({
          title: "Error loading assignments",
          description: "Could not fetch your assignments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadAssignments();
  }, [user?.id]);

  const renderDueDate = (assignment: StudentAssignmentView) => {
    if (assignment.isPastDue) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Past due</span>
        </Badge>
      );
    }
    
    if (assignment.daysUntilDue <= 1) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Due today</span>
        </Badge>
      );
    }
    
    if (assignment.daysUntilDue <= 3) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
          <Clock className="h-3 w-3" />
          <span>Due in {assignment.daysUntilDue} days</span>
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        <span>Due {format(new Date(assignment.assignment.dueDate), 'MMM d')}</span>
      </Badge>
    );
  };
  
  const renderAssignmentStatus = (assignment: StudentAssignmentView) => {
    if (assignment.hasSubmitted) {
      if (assignment.hasFeedback) {
        // Enhanced badge for feedback available
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            <span>Feedback available</span>
          </Badge>
        );
      }
      
      if (assignment.submission?.status === "returned") {
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <MessageSquare className="h-3 w-3 mr-1" />
            <span>Feedback available</span>
          </Badge>
        );
      }
      
      return (
        <Badge variant="secondary">
          <FileCheck className="h-3 w-3 mr-1" />
          <span>Submitted</span>
        </Badge>
      );
    }
    
    if (assignment.isPastDue) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>Not submitted</span>
        </Badge>
      );
    }
    
    if (assignment.inProgress) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          <span>In progress</span>
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-800 hover:bg-gray-100">
        <AlertCircle className="h-3 w-3 mr-1" />
        <span>Not started</span>
      </Badge>
    );
  };

  const upcomingAssignments = assignments.filter(a => 
    !a.hasSubmitted && !a.isPastDue
  ).sort((a, b) => 
    new Date(a.assignment.dueDate).getTime() - new Date(b.assignment.dueDate).getTime()
  );
  
  const submittedAssignments = assignments.filter(a => 
    a.hasSubmitted
  ).sort((a, b) => 
    new Date(b.submission?.submittedAt || '').getTime() - new Date(a.submission?.submittedAt || '').getTime()
  );
  
  const pastDueAssignments = assignments.filter(a => 
    !a.hasSubmitted && a.isPastDue
  ).sort((a, b) => 
    new Date(b.assignment.dueDate).getTime() - new Date(a.assignment.dueDate).getTime()
  );

  const renderAssignmentsList = (assignmentsList: StudentAssignmentView[]) => {
    if (loading) {
      return Array(3).fill(0).map((_, i) => (
        <Card key={i} className="mb-4">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-28" />
          </CardFooter>
        </Card>
      ));
    }

    if (assignmentsList.length === 0) {
      return (
        <div className="text-center py-8">
          <FileCheck className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No assignments found</h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'upcoming' 
              ? "You don't have any upcoming assignments" 
              : activeTab === 'submitted'
                ? "You haven't submitted any assignments yet"
                : "You don't have any past due assignments"}
          </p>
        </div>
      );
    }

    return assignmentsList.map(assignment => (
      <Card key={assignment.assignment.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <CardTitle className="text-lg">{assignment.assignment.title}</CardTitle>
              <CardDescription>{assignment.assignment.subject}</CardDescription>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {renderDueDate(assignment)}
              {renderAssignmentStatus(assignment)}
              {assignment.assignment.aiSupportEnabled && (
                <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                  Athro Support
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-gray-700 mb-2">{assignment.assignment.description}</p>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div>
            {assignment.assignment.filesAttached && assignment.assignment.filesAttached.length > 0 && (
              <Button variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Download Resources
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {assignment.hasSubmitted ? (
              assignment.hasFeedback || assignment.submission?.status === "returned" ? (
                <Link to={`/student/feedback`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    View Feedback
                  </Button>
                </Link>
              ) : (
                <Link to={`/student/assignments/${assignment.assignment.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Submission
                  </Button>
                </Link>
              )
            ) : (
              <>
                {!assignment.isPastDue && assignment.assignment.aiSupportEnabled && (
                  <Link to={`/athro/${assignment.assignment.subject.toLowerCase()}`} state={{ assignmentId: assignment.assignment.id }}>
                    <Button variant="outline" size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Study Session
                    </Button>
                  </Link>
                )}
                <Link to={`/student/assignments/${assignment.assignment.id}`}>
                  <Button size="sm">
                    {assignment.isPastDue ? (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        View Assignment
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit Work
                      </>
                    )}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    ));
  };

  const renderStudySessions = () => {
    const sessionsAvailable = upcomingAssignments.filter(a => a.assignment.aiSupportEnabled);
    
    if (sessionsAvailable.length === 0) {
      return (
        <div className="text-center py-8">
          <Play className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No study sessions available</h3>
          <p className="text-gray-500">Complete your assignments to unlock Athro study sessions</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {sessionsAvailable.map(assignment => (
          <StudySessionCard
            key={assignment.assignment.id}
            assignmentId={assignment.assignment.id}
            title={assignment.assignment.title}
            subject={assignment.assignment.subject}
            dueDate={assignment.assignment.dueDate}
            hasAiSupport={!!assignment.assignment.aiSupportEnabled}
          />
        ))}
      </div>
    );
  };

  if (!user) {
    return <div>Please log in to view your assignments</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Assignments</h1>
      
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({submittedAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="past-due">
            Past Due ({pastDueAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="study-sessions">
            Study Sessions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {renderAssignmentsList(upcomingAssignments)}
        </TabsContent>
        
        <TabsContent value="submitted" className="space-y-4">
          {renderAssignmentsList(submittedAssignments)}
        </TabsContent>
        
        <TabsContent value="past-due" className="space-y-4">
          {renderAssignmentsList(pastDueAssignments)}
        </TabsContent>
        
        <TabsContent value="study-sessions" className="space-y-4">
          {renderStudySessions()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentAssignmentsPage;
