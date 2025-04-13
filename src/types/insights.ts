
export interface InsightSummary {
  quizAverage: number;
  assignmentsCompleted: number;
  feedbackCount: number;
  confidenceAverage: number;
  studentsCount: number;
  topicsCount: number;
  weeklyTasksCompleted: number;
  quizPassRate: number;
  mostStudiedSubject: {
    name: string;
    count: number;
  };
  mostActiveStudent: {
    name: string;
    id: string;
    activityCount: number;
  };
  weakestTopic: {
    name: string;
    subject: string;
    averageScore: number;
  };
  strongestTopic: {
    name: string;
    subject: string;
    averageScore: number;
  };
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number;
  averageConfidence: number;
  studentsCount: number;
  color: string;
}

export interface TopicPerformance {
  id: string;
  subject: string;
  topic: string;
  averageScore: number;
  averageConfidence: number;
  assignmentsCount: number;
  quizzesCount: number;
}

export interface StudentPerformance {
  id: string;
  name: string;
  averageScore: number;
  averageConfidence: number;
  completionRate: number;
  lastActive: string;
  tasksSubmitted: number;
  aiFeedbackSummary: string;
  subjects: {
    [subject: string]: {
      score: number;
      confidence: number;
    };
  };
  weakTopics: string[];
  confidenceTrend: Array<{
    date: string;
    value: number;
  }>;
}

export interface ConfidenceTrend {
  date: string;
  subject: string;
  value: number;
}

export interface PerformanceTrend {
  date: string;
  subject: string;
  value: number;
}

export interface ClassHeatmapData {
  studentId: string;
  studentName: string;
  subjects: {
    [subject: string]: number;
  };
}

export interface TaskSubmissionHeatmap {
  date: string;
  count: number;
}

export interface FeedbackTrend {
  id: string;
  type: string;
  count: number;
  examples: string[];
  topics: string[];
  subject: string;
}

export interface AIAlert {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  subject?: string;
  topic?: string;
}

export type TimeRange = "7days" | "30days" | "90days" | "year" | "all";

export interface InsightsFilter {
  classId: string;
  subject: string | null;
  timeRange: TimeRange;
  studentIds?: string[];
  yearGroup?: string;
  set?: string;
}
