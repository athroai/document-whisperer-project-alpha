
import { format, addDays, parse, isAfter, isBefore, areIntervalsOverlapping } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { 
  StudyRoutine, 
  WeeklyTimetable, 
  TimetableSession, 
  TimetableGenerationOptions,
  DailyAvailability,
  TimeSlot
} from '@/types/timetable';
import { StudyGoal } from '@/types/goals';
import { quizService } from './quizService';
import { assignmentService } from './assignmentService';
import { progressService } from './progressService';
import { SubjectData } from '@/contexts/StudentRecordContext';
import { StudentProgress } from '@/types/progress';

// Default study routine if user hasn't set one
const DEFAULT_ROUTINE: StudyRoutine = {
  userId: '',
  preferredSessionLength: 45,
  availability: [
    // Sunday
    { dayOfWeek: 0, timeSlots: [
      { startTime: '14:00', endTime: '18:00', available: true }
    ]},
    // Monday to Friday
    ...[1, 2, 3, 4, 5].map(day => ({
      dayOfWeek: day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      timeSlots: [
        { startTime: '16:00', endTime: '19:00', available: true }
      ]
    })),
    // Saturday
    { dayOfWeek: 6, timeSlots: [
      { startTime: '10:00', endTime: '12:00', available: true },
      { startTime: '14:00', endTime: '17:00', available: true }
    ]}
  ],
  lastUpdated: new Date().toISOString()
};

// Mock localStorage key for storing routines
const ROUTINE_STORAGE_KEY = 'study_routines';
const TIMETABLE_STORAGE_KEY = 'study_timetables';

class TimetableService {
  /**
   * Save a student's study routine
   */
  async saveStudyRoutine(routine: StudyRoutine): Promise<StudyRoutine> {
    // In a real implementation, this would save to Firestore
    try {
      const routines = this.getStoredRoutines();
      
      // Update or add the routine
      const index = routines.findIndex(r => r.userId === routine.userId);
      if (index >= 0) {
        routines[index] = routine;
      } else {
        routines.push(routine);
      }
      
      localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routines));
      return routine;
    } catch (error) {
      console.error('Error saving study routine:', error);
      throw error;
    }
  }
  
  /**
   * Get a student's study routine
   */
  async getStudyRoutine(userId: string): Promise<StudyRoutine | null> {
    // In a real implementation, this would fetch from Firestore
    try {
      const routines = this.getStoredRoutines();
      const routine = routines.find(r => r.userId === userId);
      
      return routine || null;
    } catch (error) {
      console.error('Error fetching study routine:', error);
      return null;
    }
  }
  
  /**
   * Get all stored routines from localStorage
   */
  private getStoredRoutines(): StudyRoutine[] {
    try {
      const stored = localStorage.getItem(ROUTINE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving stored routines:', error);
      return [];
    }
  }
  
  /**
   * Get stored timetables from localStorage
   */
  private getStoredTimetables(): WeeklyTimetable[] {
    try {
      const stored = localStorage.getItem(TIMETABLE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving stored timetables:', error);
      return [];
    }
  }
  
  /**
   * Save a weekly timetable
   */
  async saveTimetable(timetable: WeeklyTimetable): Promise<WeeklyTimetable> {
    // In a real implementation, this would save to Firestore
    try {
      const timetables = this.getStoredTimetables();
      
      // Update or add the timetable
      const index = timetables.findIndex(t => 
        t.userId === timetable.userId && 
        t.weekStartDate === timetable.weekStartDate
      );
      
      if (index >= 0) {
        timetables[index] = timetable;
      } else {
        timetables.push(timetable);
      }
      
      localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(timetables));
      return timetable;
    } catch (error) {
      console.error('Error saving timetable:', error);
      throw error;
    }
  }
  
  /**
   * Get a student's timetable for a specific week
   */
  async getTimetable(userId: string, weekStartDate: string): Promise<WeeklyTimetable | null> {
    // In a real implementation, this would fetch from Firestore
    try {
      const timetables = this.getStoredTimetables();
      const timetable = timetables.find(t => 
        t.userId === userId && 
        t.weekStartDate === weekStartDate
      );
      
      return timetable || null;
    } catch (error) {
      console.error('Error fetching timetable:', error);
      return null;
    }
  }
  
  /**
   * Generate a weekly timetable for a student
   */
  async generateTimetable(
    userId: string, 
    weekStartDate: string,
    options: TimetableGenerationOptions = {}
  ): Promise<WeeklyTimetable> {
    try {
      // Get the student's routine
      let routine = await this.getStudyRoutine(userId);
      
      // If no routine exists, use the default routine
      if (!routine) {
        routine = { ...DEFAULT_ROUTINE, userId };
      }
      
      // Get subject priorities
      const subjectPriorities = await this.calculateSubjectPriorities(userId);
      
      // Get active goals to include in the timetable
      const goals = await this.getActiveGoals(userId);
      
      // Get upcoming assignments
      const assignments = await this.getUpcomingAssignments(userId);
      
      // Generate the timetable
      const timetable = this.buildTimetable(
        userId,
        weekStartDate,
        routine,
        subjectPriorities,
        goals,
        assignments,
        options
      );
      
      // Save the generated timetable
      await this.saveTimetable(timetable);
      
      return timetable;
    } catch (error) {
      console.error('Error generating timetable:', error);
      throw error;
    }
  }
  
  /**
   * Calculate priorities for each subject based on performance and study history
   */
  private async calculateSubjectPriorities(userId: string): Promise<Record<string, number>> {
    // In a real implementation, this would use actual student data
    
    try {
      // Get quiz results
      const quizResults = await quizService.getQuizResults(userId);
      
      // Get student progress data
      let progressData: StudentProgress | null = null;
      try {
        progressData = await progressService.getStudentProgress(userId);
      } catch (error) {
        console.warn('Could not fetch progress data, using defaults');
      }
      
      // Extract the subject averages from quiz results
      const subjectScores: Record<string, { total: number; count: number }> = {};
      
      quizResults.forEach(result => {
        if (!subjectScores[result.subject]) {
          subjectScores[result.subject] = { total: 0, count: 0 };
        }
        
        subjectScores[result.subject].total += result.score;
        subjectScores[result.subject].count += 1;
      });
      
      // Calculate average scores and convert to priority (higher priority for lower scores)
      const subjectPriorities: Record<string, number> = {};
      
      // Default subjects if no data is available
      const defaultSubjects = ['maths', 'english', 'science', 'history', 'geography'];
      
      // If no scores are available, assign default priorities
      if (Object.keys(subjectScores).length === 0) {
        defaultSubjects.forEach((subject, index) => {
          // Random priority between 3 and 8
          subjectPriorities[subject] = 3 + Math.floor(Math.random() * 6);
        });
      } else {
        // Calculate priorities based on scores
        Object.entries(subjectScores).forEach(([subject, { total, count }]) => {
          const averageScore = total / count;
          // Convert to priority: lower scores = higher priority
          // Scale from 1-10 where 10 is highest priority
          subjectPriorities[subject] = Math.max(1, Math.min(10, Math.round((100 - averageScore) / 10)));
        });
      }
      
      // Factor in progress data if available
      if (progressData && progressData.subjectProgress) {
        Object.entries(progressData.subjectProgress).forEach(([subject, progress]) => {
          // If the subject is below target, increase priority
          if (progress.currentLevel < progress.targetLevel) {
            const gap = progress.targetLevel - progress.currentLevel;
            subjectPriorities[subject] = (subjectPriorities[subject] || 5) + Math.min(3, gap);
          }
        });
      }
      
      return subjectPriorities;
    } catch (error) {
      console.error('Error calculating subject priorities:', error);
      
      // Return default priorities if calculation fails
      return {
        'maths': 8,
        'english': 6,
        'science': 7,
        'history': 5,
        'geography': 4
      };
    }
  }
  
  /**
   * Get active goals for a student
   */
  private async getActiveGoals(userId: string): Promise<StudyGoal[]> {
    try {
      // In a real implementation, this would fetch from Firestore via GoalsService
      // For now, check localStorage for any goals
      const goalsStr = localStorage.getItem(`goals_${userId}`);
      const allGoals = goalsStr ? JSON.parse(goalsStr) : [];
      
      // Filter to active goals
      return allGoals.filter((goal: StudyGoal) => goal.status === 'active');
    } catch (error) {
      console.error('Error fetching active goals:', error);
      return [];
    }
  }
  
  /**
   * Get upcoming assignments for a student
   */
  private async getUpcomingAssignments(userId: string): Promise<any[]> {
    try {
      // In a real implementation, this would use AssignmentService
      const assignments = await assignmentService.getStudentAssignments(userId);
      
      // Filter to upcoming, not yet submitted assignments
      return assignments
        .filter(assignment => !assignment.hasSubmitted && !assignment.isPastDue)
        .map(assignment => ({
          id: assignment.assignment.id,
          subject: assignment.assignment.subject,
          dueDate: assignment.assignment.dueDate,
          title: assignment.assignment.title,
          priority: assignment.daysUntilDue < 3 ? 'high' : 
                   assignment.daysUntilDue < 7 ? 'medium' : 'low'
        }));
    } catch (error) {
      console.error('Error fetching upcoming assignments:', error);
      return [];
    }
  }
  
  /**
   * Build a timetable based on availability, priorities, goals, and assignments
   */
  private buildTimetable(
    userId: string,
    weekStartDate: string,
    routine: StudyRoutine,
    subjectPriorities: Record<string, number>,
    goals: StudyGoal[],
    assignments: any[],
    options: TimetableGenerationOptions
  ): WeeklyTimetable {
    // Parse the week start date
    const startDate = new Date(weekStartDate);
    
    // Calculate the week end date (Saturday)
    const endDate = addDays(startDate, 6);
    
    // Create a new timetable
    const timetable: WeeklyTimetable = {
      userId,
      weekStartDate,
      weekEndDate: format(endDate, 'yyyy-MM-dd'),
      generatedAt: new Date().toISOString(),
      sessions: []
    };
    
    // Get the session length to use
    const sessionLength = options.sessionLengthOverride || routine.preferredSessionLength;
    
    // Prioritized list of subjects based on scores and goals
    const prioritizedSubjects = this.getPrioritizedSubjects(
      subjectPriorities, 
      goals, 
      assignments
    );
    
    // Create sessions for each available time slot throughout the week
    for (let day = 0; day <= 6; day++) {
      const currentDate = addDays(startDate, day);
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      
      // Get availability for this day
      const dailyAvailability = routine.availability.find(a => a.dayOfWeek === day);
      
      if (!dailyAvailability || !dailyAvailability.timeSlots) {
        continue;
      }
      
      // Process each available time slot
      for (const slot of dailyAvailability.timeSlots) {
        if (!slot.available) {
          continue;
        }
        
        // Check if this time is in a do-not-disturb range
        if (options.respectDoNotDisturb && routine.doNotDisturbRanges) {
          const isDND = routine.doNotDisturbRanges.some(range => 
            range.days.includes(day) &&
            this.timeRangeOverlaps(slot.startTime, slot.endTime, range.startTime, range.endTime)
          );
          
          if (isDND) {
            continue;
          }
        }
        
        // Break the time slot into study sessions based on preferred length
        const sessions = this.createSessionsForTimeSlot(
          day,
          formattedDate,
          slot,
          sessionLength,
          prioritizedSubjects,
          goals,
          assignments
        );
        
        // Add sessions to the timetable
        timetable.sessions.push(...sessions);
      }
    }
    
    // Ensure we have a good distribution of subjects
    if (options.rebalanceSubjects) {
      this.balanceSubjects(timetable, prioritizedSubjects);
    }
    
    return timetable;
  }
  
  /**
   * Get prioritized list of subjects based on performance scores, goals, and assignments
   */
  private getPrioritizedSubjects(
    subjectPriorities: Record<string, number>,
    goals: StudyGoal[],
    assignments: any[]
  ): { subject: string; priority: number }[] {
    const subjects = new Set<string>();
    const priorityMap: Record<string, number> = { ...subjectPriorities };
    
    // Add all subjects we know about
    Object.keys(subjectPriorities).forEach(subject => subjects.add(subject));
    
    // Factor in goals
    goals.forEach(goal => {
      const subject = goal.subject.toLowerCase();
      subjects.add(subject);
      
      // Increase priority for goal subjects
      priorityMap[subject] = (priorityMap[subject] || 5) + 2;
    });
    
    // Factor in assignments
    assignments.forEach(assignment => {
      const subject = assignment.subject.toLowerCase();
      subjects.add(subject);
      
      // Increase priority based on assignment due date
      if (assignment.priority === 'high') {
        priorityMap[subject] = (priorityMap[subject] || 5) + 3;
      } else if (assignment.priority === 'medium') {
        priorityMap[subject] = (priorityMap[subject] || 5) + 2;
      } else {
        priorityMap[subject] = (priorityMap[subject] || 5) + 1;
      }
    });
    
    // Convert to sorted array
    return Array.from(subjects)
      .map(subject => ({
        subject,
        priority: priorityMap[subject] || 5
      }))
      .sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Create study sessions for a specific time slot
   */
  private createSessionsForTimeSlot(
    day: number,
    formattedDate: string,
    slot: TimeSlot,
    sessionLength: number,
    prioritizedSubjects: { subject: string; priority: number }[],
    goals: StudyGoal[],
    assignments: any[]
  ): TimetableSession[] {
    const sessions: TimetableSession[] = [];
    const sessionLengthMs = sessionLength * 60 * 1000; // Convert minutes to milliseconds
    
    const startTime = parse(slot.startTime, 'HH:mm', new Date());
    const endTime = parse(slot.endTime, 'HH:mm', new Date());
    
    // Calculate how many sessions can fit in the time slot
    const slotDurationMs = endTime.getTime() - startTime.getTime();
    const possibleSessions = Math.floor(slotDurationMs / sessionLengthMs);
    
    if (possibleSessions <= 0) {
      return [];
    }
    
    // Create sessions
    for (let i = 0; i < possibleSessions; i++) {
      // Calculate session times
      const sessionStartMs = startTime.getTime() + (i * sessionLengthMs);
      const sessionEndMs = sessionStartMs + sessionLengthMs;
      
      const sessionStartTime = format(new Date(sessionStartMs), 'HH:mm');
      const sessionEndTime = format(new Date(sessionEndMs), 'HH:mm');
      
      // Select a subject for this session
      const subjectIndex = i % prioritizedSubjects.length;
      const { subject, priority } = prioritizedSubjects[subjectIndex];
      
      // Check if there's a related assignment
      const relatedAssignment = assignments.find(a => a.subject.toLowerCase() === subject);
      
      // Check if there's a related goal
      const relatedGoal = goals.find(g => g.subject.toLowerCase() === subject);
      
      // Create the session
      const session: TimetableSession = {
        id: uuidv4(),
        day: day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        date: formattedDate,
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        subject,
        sessionType: relatedAssignment ? 'assignment' : 'study',
        priority: priority >= 8 ? 'high' : priority >= 5 ? 'medium' : 'low',
        completed: false
      };
      
      // Link to goal or assignment if applicable
      if (relatedGoal) {
        session.linkedGoalId = relatedGoal.id;
      }
      
      if (relatedAssignment) {
        session.linkedAssignmentId = relatedAssignment.id;
        session.topic = relatedAssignment.title;
      }
      
      sessions.push(session);
    }
    
    return sessions;
  }
  
  /**
   * Check if two time ranges overlap
   */
  private timeRangeOverlaps(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    // Parse times
    const baseDate = new Date();
    const s1 = parse(start1, 'HH:mm', baseDate);
    const e1 = parse(end1, 'HH:mm', baseDate);
    const s2 = parse(start2, 'HH:mm', baseDate);
    const e2 = parse(end2, 'HH:mm', baseDate);
    
    // Check overlap
    return areIntervalsOverlapping(
      { start: s1, end: e1 },
      { start: s2, end: e2 }
    );
  }
  
  /**
   * Balance subjects in the timetable to ensure good distribution
   */
  private balanceSubjects(timetable: WeeklyTimetable, prioritizedSubjects: { subject: string; priority: number }[]): void {
    // Count sessions per subject
    const subjectCounts: Record<string, number> = {};
    
    timetable.sessions.forEach(session => {
      subjectCounts[session.subject] = (subjectCounts[session.subject] || 0) + 1;
    });
    
    // Find over-represented and under-represented subjects
    const totalSessions = timetable.sessions.length;
    const idealSessionsPerSubject = totalSessions / prioritizedSubjects.length;
    
    const overRepresented = Object.entries(subjectCounts)
      .filter(([_, count]) => count > idealSessionsPerSubject + 1)
      .map(([subject]) => subject);
      
    const underRepresented = prioritizedSubjects
      .filter(({ subject }) => !subjectCounts[subject] || subjectCounts[subject] < idealSessionsPerSubject)
      .map(({ subject }) => subject);
      
    // Rebalance if needed
    if (overRepresented.length > 0 && underRepresented.length > 0) {
      // Get sessions of over-represented subjects
      const sessionsToChange = timetable.sessions
        .filter(session => overRepresented.includes(session.subject))
        .slice(0, Math.min(overRepresented.length, underRepresented.length));
      
      // Change their subjects
      sessionsToChange.forEach((session, index) => {
        const newSubject = underRepresented[index % underRepresented.length];
        session.subject = newSubject;
        
        // Update session type and links
        session.linkedAssignmentId = undefined;
        session.linkedGoalId = undefined;
        session.topic = undefined;
        session.sessionType = 'study';
      });
    }
  }
  
  /**
   * Mark a session as completed
   */
  async markSessionCompleted(
    userId: string,
    weekStartDate: string,
    sessionId: string,
    completed: boolean = true
  ): Promise<boolean> {
    try {
      // Get the timetable
      const timetable = await this.getTimetable(userId, weekStartDate);
      
      if (!timetable) {
        return false;
      }
      
      // Find and update the session
      const sessionIndex = timetable.sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        return false;
      }
      
      // Update the session
      timetable.sessions[sessionIndex].completed = completed;
      
      // Save the updated timetable
      await this.saveTimetable(timetable);
      
      return true;
    } catch (error) {
      console.error('Error marking session as completed:', error);
      return false;
    }
  }
}

export const timetableService = new TimetableService();
