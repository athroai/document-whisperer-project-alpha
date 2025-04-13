
import { StudentSession, SessionAction, ActivitySummary, SessionFilters } from '@/types/monitoring';
import { Class } from '@/types/teacher';

// Mock session actions for demonstration
const generateMockActions = (): SessionAction[] => {
  const actions = [
    {
      timestamp: new Date(Date.now() - 60000).toISOString(),
      actionType: 'question' as const,
      content: 'What is the formula for calculating area of a circle?'
    },
    {
      timestamp: new Date(Date.now() - 45000).toISOString(),
      actionType: 'answer' as const,
      content: 'π × r²'
    },
    {
      timestamp: new Date(Date.now() - 30000).toISOString(),
      actionType: 'navigation' as const,
      content: 'Moved to next topic: Triangles'
    },
  ];
  
  // Return a random subset of actions
  return actions.slice(0, Math.floor(Math.random() * actions.length) + 1);
};

// Generate mock sessions that change slightly on each refresh
const generateMockSessions = (): StudentSession[] => {
  const mockStudents = [
    { id: 's1', firstName: 'Emma', lastName: 'Wilson', class: '10Y2', subject: 'English' },
    { id: 's2', firstName: 'Michael', lastName: 'Brown', class: '9A', subject: 'Mathematics' },
    { id: 's3', firstName: 'Sophia', lastName: 'Taylor', class: '11C', subject: 'Science' },
    { id: 's4', firstName: 'James', lastName: 'Davis', class: '10Y2', subject: 'History' },
    { id: 's5', firstName: 'Olivia', lastName: 'Miller', class: '9A', subject: 'Mathematics' },
    { id: 's6', firstName: 'Noah', lastName: 'Johnson', class: '11C', subject: 'Science' },
    { id: 's7', firstName: 'Ava', lastName: 'Garcia', class: '10Y2', subject: 'English' },
  ];

  const activityTypes = ['Quiz', 'Study Session', 'AthroChat', 'Practice'] as const;
  const activityNames = {
    'Quiz': ['Poetry Devices', 'Grammar Rules', 'Comprehension Test', 'Literary Analysis'],
    'Study Session': ['Revision Session', 'Topic Review', 'Exam Preparation', 'Concept Study'],
    'AthroChat': ['Query Session', 'Homework Help', 'Concept Explanation', 'Problem Solving'],
    'Practice': ['Practice Questions', 'Worked Examples', 'Topic Exercises', 'Challenge Problems']
  };

  // Return a session for each student with randomized current state
  return mockStudents.map(student => {
    // Choose a random activity type
    const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    
    // Choose a random activity name based on the type
    const activityName = activityNames[activityType][
      Math.floor(Math.random() * activityNames[activityType].length)
    ];
    
    // Generate random session duration between 1-30 minutes
    const sessionDurationSeconds = Math.floor(Math.random() * 1800) + 60;
    
    // Generate random start time
    const startTime = new Date(Date.now() - (sessionDurationSeconds * 1000)).toISOString();
    
    // Generate random last active time (between start time and now)
    const lastActiveTimeOffset = Math.floor(Math.random() * 120) + 1; // 1-120 seconds ago
    const lastActiveTime = new Date(Date.now() - (lastActiveTimeOffset * 1000)).toISOString();
    
    // Generate random confidence (1-10)
    const confidence = Math.floor(Math.random() * 10) + 1;
    
    // Determine engagement status based on last active time
    let engagementStatus: 'active' | 'semi-active' | 'idle';
    if (lastActiveTimeOffset < 30) {
      engagementStatus = 'active';
    } else if (lastActiveTimeOffset < 60) {
      engagementStatus = 'semi-active';
    } else {
      engagementStatus = 'idle';
    }
    
    return {
      id: `session-${student.id}-${Date.now()}`,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      firstName: student.firstName,
      lastName: student.lastName,
      avatarUrl: undefined, // Could add mock avatars here
      class: student.class,
      subject: student.subject,
      activityType,
      activityName,
      startTime,
      lastActiveTime,
      sessionDurationSeconds,
      confidence,
      engagementStatus,
      recentActions: generateMockActions()
    };
  });
};

class MonitoringService {
  private sessionCache: StudentSession[] = [];
  private lastUpdate: number = 0;
  private updateInterval: number = 15000; // 15 seconds

  async getActiveSessions(filters?: SessionFilters): Promise<StudentSession[]> {
    const now = Date.now();
    
    // Update cache if necessary
    if (now - this.lastUpdate > this.updateInterval || this.sessionCache.length === 0) {
      this.sessionCache = generateMockSessions();
      this.lastUpdate = now;
      console.log('Refreshed monitoring data');
    }
    
    // Apply filters
    let filteredSessions = this.sessionCache;
    
    if (filters) {
      if (filters.subject) {
        filteredSessions = filteredSessions.filter(s => s.subject === filters.subject);
      }
      
      if (filters.activityType) {
        filteredSessions = filteredSessions.filter(s => s.activityType === filters.activityType);
      }
      
      if (filters.engagementStatus) {
        filteredSessions = filteredSessions.filter(s => s.engagementStatus === filters.engagementStatus);
      }
      
      if (filters.classId) {
        filteredSessions = filteredSessions.filter(s => s.class === filters.classId);
      }
    }
    
    return filteredSessions;
  }

  async getActivitySummary(): Promise<ActivitySummary[]> {
    const sessions = await this.getActiveSessions();
    
    // Group by subject
    const subjects = [...new Set(sessions.map(s => s.subject))];
    
    return subjects.map(subject => {
      const subjectSessions = sessions.filter(s => s.subject === subject);
      
      return {
        subject,
        activeStudents: subjectSessions.length,
        averageConfidence: Math.round(subjectSessions.reduce((sum, s) => sum + s.confidence, 0) / subjectSessions.length),
        averageSessionTime: Math.round(subjectSessions.reduce((sum, s) => sum + s.sessionDurationSeconds, 0) / subjectSessions.length)
      };
    });
  }

  async sendMessageToStudent(studentId: string, message: string): Promise<boolean> {
    // Mock sending a message to a student
    console.log(`Message sent to student ${studentId}: ${message}`);
    return true;
  }

  async pauseStudentSession(studentId: string): Promise<boolean> {
    // Mock pausing a student's session
    console.log(`Session paused for student ${studentId}`);
    return true;
  }

  async resumeStudentSession(studentId: string): Promise<boolean> {
    // Mock resuming a student's session
    console.log(`Session resumed for student ${studentId}`);
    return true;
  }

  getClassesForTeacher(teacherId: string): Promise<Class[]> {
    // Mock classes for teacher
    const mockClasses: Class[] = [
      { id: '10Y2', name: '10Y2', teacher_id: teacherId, school_id: 'sch1', subject: 'English', student_ids: ['s1', 's4', 's7'] },
      { id: '9A', name: '9A', teacher_id: teacherId, school_id: 'sch1', subject: 'Mathematics', student_ids: ['s2', 's5'] },
      { id: '11C', name: '11C', teacher_id: teacherId, school_id: 'sch1', subject: 'Science', student_ids: ['s3', 's6'] },
    ];
    
    return Promise.resolve(mockClasses);
  }
}

export const monitoringService = new MonitoringService();
