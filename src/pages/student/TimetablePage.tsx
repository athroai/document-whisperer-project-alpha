
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parse, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Settings, 
  RefreshCw, 
  CheckCircle2,
  ChevronRight,
  Book,
  GraduationCap,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { timetableService } from '@/services/timetableService';
import { WeeklyTimetable, TimetableSession, TimetableGenerationOptions } from '@/types/timetable';

// Day names and subjects mapping for display
const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'maths': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'english': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  'science': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  'history': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'geography': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  'welsh': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'languages': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  're': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  'default': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
};

// Helper function to get subject styling
const getSubjectStyling = (subject: string) => {
  const key = subject.toLowerCase();
  return SUBJECT_COLORS[key] || SUBJECT_COLORS.default;
};

// Format time to 12h format
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Session type icons
const sessionTypeIcons = {
  'study': <Book className="w-4 h-4" />,
  'quiz': <GraduationCap className="w-4 h-4" />,
  'assignment': <ClipboardList className="w-4 h-4" />,
  'revision': <RefreshCw className="w-4 h-4" />
};

const TimetablePage: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 0 });
  });
  const [timetable, setTimetable] = useState<WeeklyTimetable | null>(null);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' or 'list'
  const [selectedSession, setSelectedSession] = useState<TimetableSession | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Format the current week range for display
  const weekDateRange = `${format(currentWeekStart, 'MMM d')} - ${format(endOfWeek(currentWeekStart, { weekStartsOn: 0 }), 'MMM d, yyyy')}`;
  
  // Get formatted weekStartDate string for API calls
  const weekStartDateString = format(currentWeekStart, 'yyyy-MM-dd');

  // Load timetable data on component mount or week change
  useEffect(() => {
    const loadTimetable = async () => {
      if (!state.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const weeklyTimetable = await timetableService.getTimetable(
          state.user.id,
          weekStartDateString
        );

        if (weeklyTimetable) {
          setTimetable(weeklyTimetable);
        } else {
          // No timetable exists for this week, we'll generate one
          await generateTimetable();
        }
      } catch (error) {
        console.error('Error loading timetable:', error);
        toast({
          title: 'Error',
          description: 'Could not load your study timetable.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadTimetable();
  }, [state.user, weekStartDateString]);

  // Generate a new timetable
  const generateTimetable = async (options: TimetableGenerationOptions = {}) => {
    if (!state.user) {
      toast({
        title: 'Not logged in',
        description: 'You need to be logged in to generate a timetable.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setGenerating(true);
      const newTimetable = await timetableService.generateTimetable(
        state.user.id,
        weekStartDateString,
        options
      );

      setTimetable(newTimetable);
      toast({
        title: 'Timetable generated',
        description: 'Your study timetable has been created.',
      });
    } catch (error) {
      console.error('Error generating timetable:', error);
      toast({
        title: 'Error',
        description: 'Could not generate your study timetable.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  // Navigate to the previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prevWeek => addDays(prevWeek, -7));
  };

  // Navigate to the next week
  const goToNextWeek = () => {
    setCurrentWeekStart(prevWeek => addDays(prevWeek, 7));
  };

  // Handle clicking on a session
  const handleSessionClick = (session: TimetableSession) => {
    setSelectedSession(session);
    setDialogOpen(true);
  };

  // Mark a session as completed
  const markSessionCompleted = async (session: TimetableSession, completed: boolean = true) => {
    if (!state.user || !timetable) return;

    try {
      const success = await timetableService.markSessionCompleted(
        state.user.id,
        timetable.weekStartDate,
        session.id,
        completed
      );

      if (success) {
        // Update the UI
        setTimetable(prevTimetable => {
          if (!prevTimetable) return null;
          
          return {
            ...prevTimetable,
            sessions: prevTimetable.sessions.map(s => 
              s.id === session.id ? { ...s, completed } : s
            )
          };
        });
        
        toast({
          title: completed ? 'Session completed' : 'Session marked incomplete',
          description: `${session.subject} session has been updated.`,
        });
      }
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: 'Error',
        description: 'Could not update the session status.',
        variant: 'destructive'
      });
    }
  };

  // Navigate to study session
  const startStudySession = (session: TimetableSession) => {
    setDialogOpen(false);
    
    // Navigate to the appropriate Athro page based on subject
    let path = `/athro/${session.subject.toLowerCase()}`;
    
    // If this is an assignment, navigate to the assignment page instead
    if (session.sessionType === 'assignment' && session.linkedAssignmentId) {
      path = `/student/assignments/${session.linkedAssignmentId}`;
    }
    
    navigate(path);
  };

  // Group sessions by day for calendar view
  const sessionsByDay = DAYS_OF_WEEK.map((_, dayIndex) => {
    return {
      dayName: DAYS_OF_WEEK[dayIndex],
      date: format(addDays(currentWeekStart, dayIndex), 'yyyy-MM-dd'),
      sessions: timetable?.sessions.filter(session => session.day === dayIndex) || []
    };
  });

  // Calculate some statistics
  const sessionStats = {
    total: timetable?.sessions.length || 0,
    completed: timetable?.sessions.filter(s => s.completed).length || 0,
    subjects: timetable?.sessions
      .reduce((acc, session) => {
        if (!acc.includes(session.subject)) {
          acc.push(session.subject);
        }
        return acc;
      }, [] as string[]) || []
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Study Timetable</h1>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/student/study-routine')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Edit Routine
          </Button>
          <Button 
            onClick={() => generateTimetable({ rebalanceSubjects: true })}
            disabled={generating}
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Regenerate Timetable'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToPreviousWeek}
                aria-label="Previous week"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="font-medium">{weekDateRange}</div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToNextWeek}
                aria-label="Next week"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12 border rounded-md bg-muted/10">
              <div className="text-center">
                <Calendar className="mx-auto h-10 w-10 animate-pulse text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Loading your timetable...</p>
              </div>
            </div>
          ) : !timetable ? (
            <div className="flex flex-col items-center justify-center py-12 border rounded-md bg-muted/10 text-center">
              <Calendar className="mx-auto h-10 w-10 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No timetable yet</h3>
              <p className="text-muted-foreground mb-6">
                You don't have a study timetable for this week yet.
              </p>
              <Button onClick={() => generateTimetable()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Timetable
              </Button>
            </div>
          ) : (
            <TabsContent value="calendar" className="mt-0">
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {DAYS_OF_WEEK.map((day, index) => (
                  <div key={`header-${index}`} className="bg-muted/20 p-2 text-center rounded-md font-medium">
                    <div className="text-sm md:text-base">{day.slice(0, 3)}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(addDays(currentWeekStart, index), 'd MMM')}
                    </div>
                  </div>
                ))}
                
                {/* Day content */}
                {sessionsByDay.map((day, dayIndex) => (
                  <div 
                    key={`content-${dayIndex}`} 
                    className={`border rounded-md p-2 min-h-[140px] ${
                      isSameDay(new Date(day.date), new Date()) ? 'border-primary/50 bg-primary/5' : ''
                    }`}
                  >
                    {day.sessions.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground p-2">
                        No sessions
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {day.sessions
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((session) => {
                            const subjectStyle = getSubjectStyling(session.subject);
                            return (
                              <button
                                key={session.id}
                                onClick={() => handleSessionClick(session)}
                                className={`w-full text-left p-1.5 rounded-md border ${subjectStyle.border} ${subjectStyle.bg} 
                                  ${session.completed ? 'opacity-60' : ''} hover:opacity-80 transition-opacity`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium">
                                    {formatTime(session.startTime)}
                                  </span>
                                  <span className="text-xs">
                                    {session.completed && (
                                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                                    )}
                                  </span>
                                </div>
                                <div className={`text-xs font-medium mt-1 ${subjectStyle.text}`}>
                                  {session.subject}
                                </div>
                                <div className="text-xs mt-0.5 flex items-center">
                                  {sessionTypeIcons[session.sessionType]}
                                  <span className="ml-1">
                                    {session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1)}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          <TabsContent value="list" className="mt-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 border rounded-md bg-muted/10">
                <div className="text-center">
                  <Clock className="mx-auto h-10 w-10 animate-pulse text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Loading your sessions...</p>
                </div>
              </div>
            ) : !timetable || timetable.sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border rounded-md bg-muted/10 text-center">
                <Clock className="mx-auto h-10 w-10 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No sessions scheduled</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any study sessions for this week yet.
                </p>
                <Button onClick={() => generateTimetable()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Timetable
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {DAYS_OF_WEEK.map((dayName, dayIndex) => {
                  const daySessions = timetable.sessions.filter(s => s.day === dayIndex);
                  if (daySessions.length === 0) return null;
                  
                  return (
                    <div key={dayIndex} className="mb-4">
                      <h3 className="font-medium text-lg mb-2">
                        {dayName} <span className="text-muted-foreground text-sm font-normal">
                          ({format(addDays(currentWeekStart, dayIndex), 'd MMM')})
                        </span>
                      </h3>
                      
                      <div className="space-y-2">
                        {daySessions
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map(session => {
                            const subjectStyle = getSubjectStyling(session.subject);
                            
                            return (
                              <div 
                                key={session.id} 
                                className={`border rounded-lg p-3 flex items-center
                                  ${session.completed ? 'bg-muted/30' : 'bg-card'}`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <Badge 
                                      variant="outline" 
                                      className={`${subjectStyle.bg} ${subjectStyle.text} border-none mr-2`}
                                    >
                                      {session.subject}
                                    </Badge>
                                    
                                    <Badge 
                                      variant="outline" 
                                      className="gap-1 flex items-center"
                                    >
                                      {sessionTypeIcons[session.sessionType]}
                                      {session.sessionType}
                                    </Badge>
                                    
                                    {session.priority === 'high' && (
                                      <Badge className="ml-2 bg-red-500">High Priority</Badge>
                                    )}
                                  </div>
                                  
                                  <div className="mt-2">
                                    <span className="font-medium">{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                                    {session.topic && (
                                      <p className="text-sm text-muted-foreground mt-1">{session.topic}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant={session.completed ? "outline" : "default"}
                                          size="sm"
                                          className="gap-1"
                                          onClick={() => markSessionCompleted(session, !session.completed)}
                                        >
                                          <CheckCircle2 className="h-4 w-4" />
                                          <span className="hidden sm:inline">
                                            {session.completed ? 'Completed' : 'Mark Complete'}
                                          </span>
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {session.completed ? 'Mark as incomplete' : 'Mark as completed'}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <Button 
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSessionClick(session)}
                                  >
                                    Details <ChevronRight className="ml-1 h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Study Progress</CardTitle>
              <CardDescription>
                This week's study statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Completion</span>
                    <span className="text-sm font-medium">
                      {sessionStats.completed}/{sessionStats.total} sessions
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ 
                        width: `${sessionStats.total > 0 
                          ? (sessionStats.completed / sessionStats.total) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Subjects Covered</h4>
                  <div className="flex flex-wrap gap-1">
                    {sessionStats.subjects.map((subject) => {
                      const subjectStyle = getSubjectStyling(subject);
                      return (
                        <Badge 
                          key={subject} 
                          variant="outline"
                          className={`${subjectStyle.bg} ${subjectStyle.text} border-none`}
                        >
                          {subject}
                        </Badge>
                      );
                    })}
                    
                    {sessionStats.subjects.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        No subjects in this week's timetable.
                      </span>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Quick Generate Options</h4>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={() => generateTimetable({ prioritizeUpcomingExams: true })}
                    >
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Focus on Exam Prep
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={() => generateTimetable({ includeWeakestSubjects: true })}
                    >
                      <Book className="mr-2 h-4 w-4" />
                      Prioritize Weak Subjects
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={() => generateTimetable({ respectDoNotDisturb: true, rebalanceSubjects: true })}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Balanced Schedule
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Session Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedSession && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-4 h-4 rounded-full
                      ${getSubjectStyling(selectedSession.subject).bg}
                      ${getSubjectStyling(selectedSession.subject).border}
                    `}
                  ></div>
                  <DialogTitle>{selectedSession.subject} Session</DialogTitle>
                </div>
                <DialogDescription>
                  {DAYS_OF_WEEK[selectedSession.day]}, {format(new Date(selectedSession.date), 'MMMM d')} at {formatTime(selectedSession.startTime)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Time</h4>
                    <p>{formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Session Type</h4>
                    <div className="flex items-center">
                      {sessionTypeIcons[selectedSession.sessionType]}
                      <span className="ml-1.5 capitalize">{selectedSession.sessionType}</span>
                    </div>
                  </div>
                </div>
                
                {selectedSession.topic && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Topic</h4>
                    <p>{selectedSession.topic}</p>
                  </div>
                )}
                
                {selectedSession.linkedGoalId && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Linked Goal</h4>
                    <Badge variant="outline">Goal #{selectedSession.linkedGoalId.slice(0, 6)}</Badge>
                  </div>
                )}
                
                {selectedSession.linkedAssignmentId && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Linked Assignment</h4>
                    <Badge variant="outline">Assignment #{selectedSession.linkedAssignmentId.slice(0, 6)}</Badge>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant={selectedSession.completed ? "outline" : "default"}
                  onClick={() => markSessionCompleted(selectedSession, !selectedSession.completed)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {selectedSession.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
                
                <Button onClick={() => startStudySession(selectedSession)}>
                  Start Session
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimetablePage;
