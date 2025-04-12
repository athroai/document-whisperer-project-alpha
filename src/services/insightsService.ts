
import { InsightSummary, SubjectPerformance, TopicPerformance, StudentPerformance, 
  ConfidenceTrend, PerformanceTrend, ClassHeatmapData, FeedbackTrend, InsightsFilter } from '@/types/insights';
import { Student } from '@/types/dashboard';
import { Class } from '@/types/teacher';
import { QuizResult } from '@/types/quiz';
import { getSubjectColor } from '@/utils/dashboardUtils';

// Mock data for development
const generateMockData = () => {
  // Mock subject performance data
  const subjects = ["maths", "science", "english", "history", "geography"];
  const mockSubjectPerformance: SubjectPerformance[] = subjects.map(subject => ({
    subject: subject.charAt(0).toUpperCase() + subject.slice(1),
    averageScore: Math.round(60 + Math.random() * 30),
    averageConfidence: Math.round(5 + Math.random() * 4),
    studentsCount: Math.round(20 + Math.random() * 10),
    color: getSubjectColor(subject)
  }));

  // Mock topics
  const mockTopics: Record<string, string[]> = {
    maths: ["Algebra", "Geometry", "Trigonometry", "Statistics", "Calculus"],
    science: ["Biology", "Chemistry", "Physics", "Earth Science", "Ecology"],
    english: ["Grammar", "Literature", "Writing", "Comprehension", "Poetry"],
    history: ["Ancient History", "Medieval History", "Modern History", "World Wars", "Local History"],
    geography: ["Physical Geography", "Human Geography", "Maps", "Weather", "Ecosystems"]
  };

  // Mock topic performance
  const mockTopicPerformance: TopicPerformance[] = [];
  subjects.forEach(subject => {
    mockTopics[subject].forEach(topic => {
      mockTopicPerformance.push({
        id: `${subject}-${topic.toLowerCase().replace(/\s/g, '-')}`,
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        topic,
        averageScore: Math.round(50 + Math.random() * 40),
        averageConfidence: Math.round(4 + Math.random() * 5),
        assignmentsCount: Math.round(2 + Math.random() * 8),
        quizzesCount: Math.round(3 + Math.random() * 7)
      });
    });
  });

  // Mock student names
  const studentNames = [
    "Emma Thompson", "James Wilson", "Olivia Martinez", "Noah Johnson", "Ava Williams",
    "Liam Brown", "Sophia Jones", "Mason Davis", "Isabella Miller", "Jacob Garcia",
    "Mia Rodriguez", "Ethan Martinez", "Charlotte Smith", "Michael Johnson", "Amelia Taylor"
  ];

  // Mock student performance
  const mockStudentPerformance: StudentPerformance[] = studentNames.map((name, index) => {
    const studentSubjects: Record<string, { score: number; confidence: number }> = {};
    subjects.forEach(subject => {
      studentSubjects[subject] = {
        score: Math.round(50 + Math.random() * 45),
        confidence: Math.round(3 + Math.random() * 7)
      };
    });

    // Get random weak topics for this student
    const weakTopics: string[] = [];
    const allTopics = Object.values(mockTopics).flat();
    const shuffled = [...allTopics].sort(() => 0.5 - Math.random());
    weakTopics.push(...shuffled.slice(0, 2 + Math.floor(Math.random() * 3)));

    return {
      id: `student-${index + 1}`,
      name,
      averageScore: Math.round(60 + Math.random() * 35),
      averageConfidence: Math.round(5 + Math.random() * 4),
      completionRate: Math.round(70 + Math.random() * 30),
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      subjects: studentSubjects,
      weakTopics
    };
  });

  // Generate mock confidence trends
  const mockConfidenceTrends: ConfidenceTrend[] = [];
  const now = new Date();
  for (let i = 0; i < 90; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    subjects.forEach(subject => {
      // Create some realistic pattern with gradual improvements and occasional dips
      const baseValue = 5 + Math.sin(i / 10) * 1.5 + (i / 90) * 2;
      const randomVariation = Math.random() * 0.5 - 0.25;
      
      mockConfidenceTrends.push({
        date: dateStr,
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        value: Math.min(10, Math.max(1, Math.round((baseValue + randomVariation) * 10) / 10))
      });
    });
  }

  // Generate mock performance trends
  const mockPerformanceTrends: PerformanceTrend[] = [];
  for (let i = 0; i < 90; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    subjects.forEach(subject => {
      // Create some realistic pattern with gradual improvements
      const baseValue = 60 + Math.sin(i / 15) * 5 + (i / 90) * 15;
      const randomVariation = Math.random() * 10 - 5;
      
      mockPerformanceTrends.push({
        date: dateStr,
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        value: Math.min(100, Math.max(0, Math.round(baseValue + randomVariation)))
      });
    });
  }

  // Generate heatmap data
  const mockHeatmapData: ClassHeatmapData[] = mockStudentPerformance.map(student => {
    const subjectScores: Record<string, number> = {};
    subjects.forEach(subject => {
      subjectScores[subject] = student.subjects[subject]?.score || Math.round(50 + Math.random() * 50);
    });
    
    return {
      studentId: student.id,
      studentName: student.name,
      subjects: subjectScores
    };
  });

  // Generate feedback trends
  const feedbackTypes = [
    "Misunderstanding of concept",
    "Calculation error",
    "Missing key details",
    "Incorrect theory application",
    "Wrong formula used",
    "Incomplete explanation",
    "Time management issues",
    "Exam technique needs work"
  ];
  
  const mockFeedbackTrends: FeedbackTrend[] = feedbackTypes.map((type, index) => {
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    const randomTopics = mockTopics[randomSubject].sort(() => 0.5 - Math.random()).slice(0, 1 + Math.floor(Math.random() * 2));
    
    return {
      id: `feedback-${index + 1}`,
      type,
      count: Math.round(5 + Math.random() * 25),
      examples: [
        "Example feedback 1 for this issue type",
        "Another example of this feedback",
        "One more example showing this issue"
      ],
      topics: randomTopics,
      subject: randomSubject.charAt(0).toUpperCase() + randomSubject.slice(1)
    };
  }).sort((a, b) => b.count - a.count);

  // Create overall summary
  const subjectsSum = mockSubjectPerformance.reduce((acc, subject) => acc + subject.averageScore, 0);
  const subjectsAvg = subjectsSum / mockSubjectPerformance.length;
  
  const confidenceSum = mockSubjectPerformance.reduce((acc, subject) => acc + subject.averageConfidence, 0);
  const confidenceAvg = confidenceSum / mockSubjectPerformance.length;

  // Find weakest and strongest topics
  const sortedTopics = [...mockTopicPerformance].sort((a, b) => a.averageScore - b.averageScore);
  const weakestTopic = sortedTopics[0];
  const strongestTopic = sortedTopics[sortedTopics.length - 1];

  const mockSummary: InsightSummary = {
    quizAverage: Math.round(subjectsAvg),
    assignmentsCompleted: Math.round(mockStudentPerformance.length * 3.5),
    feedbackCount: Math.round(mockStudentPerformance.length * 7.2),
    confidenceAverage: parseFloat(confidenceAvg.toFixed(1)),
    studentsCount: mockStudentPerformance.length,
    topicsCount: mockTopicPerformance.length,
    weakestTopic: {
      name: weakestTopic.topic,
      subject: weakestTopic.subject,
      averageScore: weakestTopic.averageScore
    },
    strongestTopic: {
      name: strongestTopic.topic,
      subject: strongestTopic.subject,
      averageScore: strongestTopic.averageScore
    }
  };

  return {
    summary: mockSummary,
    subjectPerformance: mockSubjectPerformance,
    topicPerformance: mockTopicPerformance,
    studentPerformance: mockStudentPerformance,
    confidenceTrends: mockConfidenceTrends,
    performanceTrends: mockPerformanceTrends,
    heatmapData: mockHeatmapData,
    feedbackTrends: mockFeedbackTrends
  };
};

// Cache mock data to ensure consistency during development
let mockCache: ReturnType<typeof generateMockData> | null = null;

const getMockData = () => {
  if (!mockCache) {
    mockCache = generateMockData();
  }
  return mockCache;
};

// In production, this would use Firebase/Firestore
const insightsService = {
  // Get summary statistics for the overview tab
  getInsightsSummary: async (teacherId: string, filter: InsightsFilter): Promise<InsightSummary> => {
    console.log(`Fetching insights summary for teacher ${teacherId} with filter:`, filter);
    return getMockData().summary;
  },
  
  // Get performance data by subject
  getSubjectPerformance: async (teacherId: string, filter: InsightsFilter): Promise<SubjectPerformance[]> => {
    console.log(`Fetching subject performance for teacher ${teacherId} with filter:`, filter);
    return getMockData().subjectPerformance;
  },
  
  // Get performance data by topic
  getTopicPerformance: async (teacherId: string, filter: InsightsFilter): Promise<TopicPerformance[]> => {
    console.log(`Fetching topic performance for teacher ${teacherId} with filter:`, filter);
    let topics = getMockData().topicPerformance;
    
    // Apply subject filter if specified
    if (filter.subject) {
      topics = topics.filter(t => t.subject.toLowerCase() === filter.subject?.toLowerCase());
    }
    
    return topics;
  },
  
  // Get performance data by student
  getStudentPerformance: async (teacherId: string, classId: string): Promise<StudentPerformance[]> => {
    console.log(`Fetching student performance for teacher ${teacherId} in class ${classId}`);
    return getMockData().studentPerformance;
  },
  
  // Get confidence trends over time
  getConfidenceTrends: async (teacherId: string, filter: InsightsFilter): Promise<ConfidenceTrend[]> => {
    console.log(`Fetching confidence trends for teacher ${teacherId} with filter:`, filter);
    let trends = getMockData().confidenceTrends;
    
    // Apply subject filter if specified
    if (filter.subject) {
      trends = trends.filter(t => t.subject.toLowerCase() === filter.subject?.toLowerCase());
    }
    
    // Apply time range filter
    const now = new Date();
    let daysToInclude = 90; // default to 90 days
    
    switch(filter.timeRange) {
      case "7days":
        daysToInclude = 7;
        break;
      case "30days":
        daysToInclude = 30;
        break;
      case "90days":
        daysToInclude = 90;
        break;
      case "year":
        daysToInclude = 365;
        break;
      case "all":
        daysToInclude = 9999; // effectively all
        break;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysToInclude);
    
    trends = trends.filter(t => new Date(t.date) >= cutoffDate);
    
    return trends;
  },
  
  // Get performance trends over time
  getPerformanceTrends: async (teacherId: string, filter: InsightsFilter): Promise<PerformanceTrend[]> => {
    console.log(`Fetching performance trends for teacher ${teacherId} with filter:`, filter);
    let trends = getMockData().performanceTrends;
    
    // Apply subject filter if specified
    if (filter.subject) {
      trends = trends.filter(t => t.subject.toLowerCase() === filter.subject?.toLowerCase());
    }
    
    // Apply time range filter similar to confidence trends
    const now = new Date();
    let daysToInclude = 90; // default to 90 days
    
    switch(filter.timeRange) {
      case "7days":
        daysToInclude = 7;
        break;
      case "30days":
        daysToInclude = 30;
        break;
      case "90days":
        daysToInclude = 90;
        break;
      case "year":
        daysToInclude = 365;
        break;
      case "all":
        daysToInclude = 9999; // effectively all
        break;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysToInclude);
    
    trends = trends.filter(t => new Date(t.date) >= cutoffDate);
    
    return trends;
  },
  
  // Get class heatmap data
  getClassHeatmapData: async (teacherId: string, classId: string): Promise<ClassHeatmapData[]> => {
    console.log(`Fetching class heatmap data for teacher ${teacherId} in class ${classId}`);
    return getMockData().heatmapData;
  },
  
  // Get feedback trends
  getFeedbackTrends: async (teacherId: string, filter: InsightsFilter): Promise<FeedbackTrend[]> => {
    console.log(`Fetching feedback trends for teacher ${teacherId} with filter:`, filter);
    let trends = getMockData().feedbackTrends;
    
    // Apply subject filter if specified
    if (filter.subject) {
      trends = trends.filter(t => t.subject.toLowerCase() === filter.subject?.toLowerCase());
    }
    
    return trends;
  },
  
  // Get teacher's classes
  getTeacherClasses: async (teacherId: string): Promise<Class[]> => {
    console.log(`Fetching classes for teacher ${teacherId}`);
    // This would normally fetch from Firestore
    // For now return mock classes with IDs that match our mock students
    return [
      { 
        id: "class-1", 
        name: "10A Mathematics", 
        teacher_id: teacherId,
        school_id: "school-1",
        subject: "maths",
        student_ids: ["student-1", "student-2", "student-3", "student-4", "student-5"],
        yearGroup: "Year 10" 
      },
      { 
        id: "class-2", 
        name: "11B Science", 
        teacher_id: teacherId,
        school_id: "school-1",
        subject: "science",
        student_ids: ["student-6", "student-7", "student-8", "student-9", "student-10"],
        yearGroup: "Year 11" 
      }
    ];
  },
  
  // Export data to CSV
  exportToCsv: async (teacherId: string, filter: InsightsFilter, type: 'performance' | 'confidence' | 'topics'): Promise<string> => {
    console.log(`Exporting ${type} data to CSV for teacher ${teacherId} with filter:`, filter);
    
    // This would normally generate a proper CSV from data
    // For now, return a mock URL
    return `data:text/csv;charset=utf-8,mock_export_${type}_${filter.classId}_${Date.now()}.csv`;
  },
  
  // Export data to PDF
  exportToPdf: async (teacherId: string, filter: InsightsFilter, type: 'performance' | 'confidence' | 'topics'): Promise<string> => {
    console.log(`Exporting ${type} data to PDF for teacher ${teacherId} with filter:`, filter);
    
    // This would normally generate a proper PDF from data
    // For now, return a mock URL
    return `data:application/pdf;base64,mock_pdf_data_${type}_${filter.classId}_${Date.now()}`;
  }
};

export default insightsService;
