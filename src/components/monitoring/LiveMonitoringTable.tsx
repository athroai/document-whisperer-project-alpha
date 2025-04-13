
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { monitoringService } from '@/services/monitoringService';
import { StudentSession } from '@/types/monitoring';
import { Circle, Eye, MessageSquare, Pause, Play } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import StudentSessionModal from './StudentSessionModal';
import SendMessageModal from './SendMessageModal';
import { useToast } from '@/hooks/use-toast';

interface LiveMonitoringTableProps {
  sortBy?: string;
  filterSubject?: string | null;
  filterActivity?: string | null;
}

const LiveMonitoringTable: React.FC<LiveMonitoringTableProps> = ({
  sortBy = 'lastName',
  filterSubject = null,
  filterActivity = null,
}) => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  
  const [activeSessions, setActiveSessions] = useState<StudentSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentSession | null>(null);
  const [messageStudent, setMessageStudent] = useState<StudentSession | null>(null);
  const [pausedStudents, setPausedStudents] = useState<Set<string>>(new Set());
  
  // Fetch active sessions
  const fetchSessions = async () => {
    if (!user) return;
    
    try {
      const sessions = await monitoringService.getActiveSessions({
        subject: filterSubject,
        activityType: filterActivity,
      });
      
      // Sort sessions
      const sortedSessions = [...sessions].sort((a, b) => {
        switch (sortBy) {
          case 'lastName':
            return a.lastName.localeCompare(b.lastName);
          case 'confidence':
            return b.confidence - a.confidence;
          case 'activity':
            return a.activityType.localeCompare(b.activityType);
          case 'engagement':
            const engagementOrder = { active: 0, 'semi-active': 1, idle: 2 };
            return engagementOrder[a.engagementStatus] - engagementOrder[b.engagementStatus];
          case 'sessionTime':
            return b.sessionDurationSeconds - a.sessionDurationSeconds;
          default:
            return a.lastName.localeCompare(b.lastName);
        }
      });
      
      setActiveSessions(sortedSessions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      setIsLoading(false);
    }
  };
  
  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchSessions();
    
    // Set up interval for refreshing data every 15 seconds
    const intervalId = setInterval(fetchSessions, 15000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [user, filterSubject, filterActivity, sortBy]);
  
  // Handle view student session
  const handleViewSession = (student: StudentSession) => {
    setSelectedStudent(student);
  };
  
  // Handle send message
  const handleOpenMessageDialog = (student: StudentSession) => {
    setMessageStudent(student);
  };
  
  // Handle toggle pause/resume
  const handleTogglePause = async (student: StudentSession) => {
    try {
      const isPaused = pausedStudents.has(student.studentId);
      
      if (isPaused) {
        await monitoringService.resumeStudentSession(student.studentId);
        setPausedStudents(prev => {
          const updated = new Set(prev);
          updated.delete(student.studentId);
          return updated;
        });
        toast({
          title: "Session resumed",
          description: `${student.studentName}'s session has been resumed.`,
        });
      } else {
        await monitoringService.pauseStudentSession(student.studentId);
        setPausedStudents(prev => {
          const updated = new Set(prev);
          updated.add(student.studentId);
          return updated;
        });
        toast({
          title: "Session paused",
          description: `${student.studentName}'s session has been paused.`,
        });
      }
    } catch (error) {
      console.error('Error toggling session status:', error);
      toast({
        title: "Action failed",
        description: "Could not change session status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Get engagement status color
  const getEngagementColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'semi-active':
        return 'text-amber-500';
      case 'idle':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  // Format session duration
  const formatSessionDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  return (
    <div>
      <TooltipProvider>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class & Subject</TableHead>
                <TableHead>Current Activity</TableHead>
                <TableHead>Session Time</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700 mb-2"></div>
                      <span>Loading sessions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : activeSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                    No active sessions found
                  </TableCell>
                </TableRow>
              ) : (
                activeSessions.map((session) => (
                  <TableRow key={session.id} className={pausedStudents.has(session.studentId) ? "bg-gray-50" : ""}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
                          {session.firstName[0]}{session.lastName[0]}
                        </div>
                        <div>{session.studentName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{session.class}</div>
                      <div className="text-sm text-muted-foreground">{session.subject}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{session.activityType}</div>
                      <div className="text-sm text-muted-foreground">{session.activityName}</div>
                    </TableCell>
                    <TableCell>
                      {formatSessionDuration(session.sessionDurationSeconds)}
                      <div className="text-xs text-muted-foreground">
                        Last active: {formatDistanceToNow(new Date(session.lastActiveTime), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{session.confidence}/10</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Circle className={`h-3 w-3 fill-current ${getEngagementColor(session.engagementStatus)}`} />
                        <span className="capitalize">{session.engagementStatus}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewSession(session)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View session details</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleTogglePause(session)}
                            >
                              {pausedStudents.has(session.studentId) ? 
                                <Play className="h-4 w-4" /> : 
                                <Pause className="h-4 w-4" />
                              }
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{pausedStudents.has(session.studentId) ? "Resume session" : "Pause session"}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenMessageDialog(session)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Send a message</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>
      
      {/* Student Session Modal */}
      <StudentSessionModal
        session={selectedStudent}
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
      
      {/* Send Message Modal */}
      <SendMessageModal
        student={messageStudent}
        open={!!messageStudent}
        onClose={() => setMessageStudent(null)}
      />
    </div>
  );
};

export default LiveMonitoringTable;
