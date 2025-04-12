
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  FileText, 
  FilePlus, 
  Clock, 
  Edit,
  Trash,
  Archive
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Assignment } from '@/types/assignment';
import { assignmentService } from '@/services/assignmentService';
import { formatDistanceToNow, isAfter } from 'date-fns';
import CreateAssignmentForm from '@/components/dashboard/CreateAssignmentForm';
import { Skeleton } from '@/components/ui/skeleton';

const TeacherAssignPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user } = state;
  const [activeTab, setActiveTab] = useState<string>("active");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [classId, setClassId] = useState<string>("all");

  useEffect(() => {
    const loadAssignments = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const visibility = activeTab as "active" | "archived";
        const classFilter = classId !== "all" ? classId : undefined;
        
        const fetchedAssignments = await assignmentService.getAssignments({
          teacherId: user.id,
          visibility,
          classId: classFilter
        });
        
        setAssignments(fetchedAssignments);
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
  }, [user?.id, activeTab, classId]);

  const handleCreateAssignment = async (newAssignment: Omit<Assignment, "id">) => {
    try {
      await assignmentService.createAssignment(newAssignment);
      toast({
        title: "Assignment created",
        description: `"${newAssignment.title}" has been created.`
      });
      setIsCreateDialogOpen(false);
      
      // Refresh the list
      const updatedAssignments = await assignmentService.getAssignments({
        teacherId: user?.id,
        visibility: activeTab as "active" | "archived"
      });
      setAssignments(updatedAssignments);
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error creating assignment",
        description: "There was a problem creating your assignment.",
        variant: "destructive"
      });
    }
  };

  const handleArchiveAssignment = async (id: string) => {
    try {
      await assignmentService.updateAssignment(id, { visibility: "archived" });
      toast({
        title: "Assignment archived",
        description: "The assignment has been moved to archives."
      });
      
      // Refresh the list
      const updatedAssignments = await assignmentService.getAssignments({
        teacherId: user?.id,
        visibility: activeTab as "active" | "archived"
      });
      setAssignments(updatedAssignments);
    } catch (error) {
      console.error('Error archiving assignment:', error);
      toast({
        title: "Error archiving assignment",
        description: "There was a problem archiving the assignment.",
        variant: "destructive"
      });
    }
  };

  const handlePublishAssignment = async (id: string) => {
    try {
      await assignmentService.updateAssignment(id, { status: "published" });
      toast({
        title: "Assignment published",
        description: "The assignment is now visible to students."
      });
      
      // Refresh the list
      const updatedAssignments = await assignmentService.getAssignments({
        teacherId: user?.id,
        visibility: activeTab as "active" | "archived"
      });
      setAssignments(updatedAssignments);
    } catch (error) {
      console.error('Error publishing assignment:', error);
      toast({
        title: "Error publishing assignment",
        description: "There was a problem publishing the assignment.",
        variant: "destructive"
      });
    }
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
            <Skeleton className="h-9 w-24 mr-2" />
            <Skeleton className="h-9 w-24" />
          </CardFooter>
        </Card>
      ));
    }

    if (assignments.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No assignments found</h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'active' 
              ? "You haven't created any active assignments yet." 
              : "There are no archived assignments."}
          </p>
          {activeTab === 'active' && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <FilePlus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          )}
        </div>
      );
    }

    return assignments.map(assignment => (
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
            <div className="flex items-center space-x-2">
              <Badge variant={assignment.status === "published" ? "default" : "outline"}>
                {assignment.status === "published" ? "Published" : "Draft"}
              </Badge>
              <Badge variant="outline" className="bg-gray-50">
                {getAssignmentTypeLabel(assignment.assignmentType)}
              </Badge>
            </div>
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
        </CardContent>
        <CardFooter className="border-t pt-3 flex justify-between">
          <div>
            {assignment.status === "draft" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePublishAssignment(assignment.id)}
              >
                Publish
              </Button>
            )}
          </div>
          <div className="space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/teacher/marking?assignmentId=${assignment.id}`)}
            >
              View Submissions
            </Button>
            {activeTab === "active" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleArchiveAssignment(assignment.id)}
              >
                <Archive className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assign Work</h1>
            <p className="text-gray-500">Create and manage assignments for your classes</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <FilePlus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </div>
        
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active Assignments</TabsTrigger>
            <TabsTrigger value="archived">Archived Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4 mt-4">
            {renderAssignmentList()}
          </TabsContent>
          
          <TabsContent value="archived" className="space-y-4 mt-4">
            {renderAssignmentList()}
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
          </DialogHeader>
          <CreateAssignmentForm 
            onSubmit={handleCreateAssignment} 
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </TeacherDashboardLayout>
  );
};

export default TeacherAssignPage;
