
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SystemToolsService, syncIssues } from '@/services/systemToolsService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Class } from '@/types/teacher';

const ClassSyncCheck: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  // Function to get class status
  const getClassStatus = (classId: string) => {
    const issue = syncIssues.find(issue => issue.classId === classId);
    if (!issue) return { status: 'ok', message: 'Synchronized', icon: CheckCircle, color: 'text-green-500' };
    
    return {
      status: issue.severity,
      message: issue.issue,
      icon: issue.severity === 'warning' ? AlertCircle : AlertCircle,
      color: issue.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
    };
  };
  
  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, [user]);
  
  const fetchClasses = async () => {
    if (user && user.id) {
      setIsLoading(true);
      try {
        const teacherClasses = await SystemToolsService.getClassesForTeacher(user.id);
        setClasses(teacherClasses);
        setLastSyncTime(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast({
          title: "Error",
          description: "Failed to fetch class data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleRefreshSync = () => {
    fetchClasses();
    toast({
      title: "Sync check complete",
      description: "Your class data has been refreshed.",
      variant: "default"
    });
  };
  
  const handleFixIssue = (classId: string, issue: string) => {
    // This would actually fix the issue in a real application
    console.log(`Fixing issue "${issue}" for class ${classId}`);
    toast({
      title: "Issue resolved",
      description: `Fixed: ${issue}`,
      variant: "default"
    });
    
    // Refresh the data to reflect the change
    fetchClasses();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-blue-600" />
          Class Sync Check
        </CardTitle>
        <CardDescription>
          Check if teacher-class-subject relationships are correctly synchronized.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left p-2 font-medium text-sm">Class</th>
                <th className="text-left p-2 font-medium text-sm">Subject</th>
                <th className="text-left p-2 font-medium text-sm">Status</th>
                <th className="text-right p-2 font-medium text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No classes found
                  </td>
                </tr>
              ) : (
                classes.map((cls) => {
                  const status = getClassStatus(cls.id);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={cls.id} className="border-b last:border-b-0">
                      <td className="p-2 text-sm">{cls.name}</td>
                      <td className="p-2 text-sm">{cls.subject || 'Unspecified'}</td>
                      <td className="p-2 text-sm">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${status.color}`} />
                          <span>{status.message}</span>
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        {status.status !== 'ok' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleFixIssue(cls.id, status.message)}
                          >
                            Fix
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {lastSyncTime && (
          <p className="text-xs text-gray-500 text-right">
            Last synchronized: {lastSyncTime}
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          variant="outline"
          onClick={handleRefreshSync}
          disabled={isLoading}
          className="flex gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Checking...' : 'Run Sync Check'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClassSyncCheck;
