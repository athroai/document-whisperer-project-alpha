
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench, 
  RefreshCcw, 
  CheckCircle, 
  RefreshCw, 
  SendHorizonal, 
  Trash2, 
  Activity,
  FileText,
  UserCheck,
  UserX,
  Archive,
  Shield
} from 'lucide-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import QuickClassReset from '@/components/system-tools/QuickClassReset';
import MarkAllPresent from '@/components/system-tools/MarkAllPresent';
import ClassSyncCheck from '@/components/system-tools/ClassSyncCheck';
import MassAssignTask from '@/components/system-tools/MassAssignTask';
import ClassCleanupUtility from '@/components/system-tools/ClassCleanupUtility';
import SystemDiagnostics from '@/components/system-tools/SystemDiagnostics';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SystemToolsService } from '@/services/systemToolsService';
import { Class } from '@/types/teacher';

const TeacherSystemToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('class-management');
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  
  // Fetch classes when tab changes to class-management
  React.useEffect(() => {
    if (activeTab === 'class-management' && user?.id) {
      fetchClasses();
    }
  }, [activeTab, user]);
  
  const fetchClasses = async () => {
    if (user?.id) {
      try {
        const fetchedClasses = await SystemToolsService.getClassesForTeacher(user.id);
        setClasses(fetchedClasses);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: "Error",
          description: "Failed to fetch class data",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleExportStudentList = () => {
    // In a real application, this would generate and download a CSV file
    toast({
      title: "Export Started",
      description: "Student list is being exported to CSV",
    });
    
    // Simulate download after a short delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Student list has been downloaded",
      });
    }, 1500);
  };
  
  const handleResetClassCodes = async () => {
    try {
      // This would regenerate class join codes in a real application
      toast({
        title: "Classes Updated",
        description: "All class join codes have been reset",
      });
      
      // Refresh class data
      await fetchClasses();
    } catch (error) {
      console.error('Error resetting class codes:', error);
      toast({
        title: "Error",
        description: "Failed to reset class codes",
        variant: "destructive",
      });
    }
  };
  
  const handleApproveAllPending = () => {
    toast({
      title: "Students Approved",
      description: "All pending students have been approved",
    });
  };
  
  const handleRemoveInactive = () => {
    toast({
      title: "Cleanup Complete",
      description: "Inactive students have been removed",
    });
  };
  
  const handleArchiveClass = (classId: string) => {
    toast({
      title: "Class Archived",
      description: `Class ${classId} has been archived`,
    });
    // In a real app, this would archive the class and refresh the list
    fetchClasses();
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6 text-purple-600" />
          System Tools
        </h1>
        <p className="text-gray-500 mt-1">
          Advanced utilities to manage your classes, students, and system settings.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="class-management" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Class Management</span>
            <span className="inline md:hidden">Classes</span>
          </TabsTrigger>
          <TabsTrigger value="bulk-actions" className="flex items-center gap-1">
            <UserCheck className="h-4 w-4" />
            <span className="hidden md:inline">Bulk Actions</span>
            <span className="inline md:hidden">Actions</span>
          </TabsTrigger>
          <TabsTrigger value="licensing" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Licensing & Status</span>
            <span className="inline md:hidden">License</span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Developer Tools</span>
            <span className="inline md:hidden">Tools</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="class-management" className="mt-0 space-y-4">
            {/* Class Management Tab */}
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                className="flex items-center gap-2" 
                onClick={handleExportStudentList}
              >
                <FileText className="h-4 w-4" />
                Export Student List
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset Class Codes
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset All Class Codes?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will generate new join codes for all your classes. Students will need the new codes to join.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetClassCodes}>
                      Reset Codes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Classes</CardTitle>
                <CardDescription>
                  All classes you are currently teaching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Join Code</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>{cls.subject}</TableCell>
                        <TableCell>{cls.student_ids.length}</TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {cls.id.substring(0, 6).toUpperCase()}
                          </code>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                              >
                                <Archive className="h-4 w-4 mr-1" />
                                Archive
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Archive this class?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will archive {cls.name} and all associated data. You can restore it later if needed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleArchiveClass(cls.id)}>
                                  Archive Class
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {classes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          No classes found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bulk-actions" className="mt-0">
            {/* Bulk Actions Tab */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    Approve Students
                  </CardTitle>
                  <CardDescription>
                    Approve all pending student accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    There are currently <span className="font-bold">3</span> pending student accounts waiting for approval.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full">Approve All Pending</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve All Pending Students?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will grant access to all students who have requested to join your classes.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApproveAllPending}>
                          Approve All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserX className="h-5 w-5 text-red-600" />
                    Remove Inactive
                  </CardTitle>
                  <CardDescription>
                    Remove students inactive for 60+ days
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    There are currently <span className="font-bold">2</span> students who have been inactive for more than 60 days.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">Remove Inactive</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Inactive Students?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove all students who haven't logged in for more than 60 days. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveInactive}>
                          Remove Inactive
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Archive className="h-5 w-5 text-amber-600" />
                    Class Cleanup
                  </CardTitle>
                  <CardDescription>
                    Archive empty or completed classes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Consider archiving classes that have ended or are no longer active to keep your dashboard clean.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("class-management")}>
                    Manage Classes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="licensing" className="mt-0">
            {/* Licensing & Status Tab */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  School License Status
                </CardTitle>
                <CardDescription>
                  Current licensing information for your school
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">License Information</h3>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Plan:</span>
                      <span>School Standard</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Expiration Date:</span>
                      <span>July 31, 2026</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <h3 className="text-sm font-medium">Usage</h3>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Student Licenses:</span>
                      <span>32 / 150 used</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Teacher Accounts:</span>
                      <span>5 / 10 used</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Storage:</span>
                      <span>124 MB / 10 GB used</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" className="text-sm">Contact Support</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tools" className="mt-0">
            <SystemDiagnostics />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default TeacherSystemToolsPage;
