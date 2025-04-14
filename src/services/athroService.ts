
import { AthroCharacter, AthroSubject, ExamBoard, FeedbackSummary } from '@/types/athro';

// Mock service for Athro character management
const athroService = {
  // Get available Athro characters
  getCharacters(): AthroCharacter[] {
    return [
      {
        id: 'athro-math',
        name: 'AthroMath',
        subject: 'Mathematics',
        avatar: '/assets/athro-math.png',
        description: 'Your personal GCSE Mathematics mentor',
        topics: ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
        examBoards: ['WJEC', 'AQA', 'OCR'],
        supportsMathNotation: true
      },
      {
        id: 'athro-science',
        name: 'AthroScience',
        subject: 'Science',
        avatar: '/assets/athro-science.png',
        description: 'Your personal GCSE Science mentor',
        topics: ['Biology', 'Chemistry', 'Physics', 'Environmental Science'],
        examBoards: ['WJEC', 'AQA', 'OCR']
      },
      {
        id: 'athro-english',
        name: 'AthroEnglish',
        subject: 'English',
        avatar: '/assets/athro-english.png',
        description: 'Your personal GCSE English mentor',
        topics: ['Literature', 'Language', 'Writing', 'Poetry'],
        examBoards: ['WJEC', 'AQA', 'OCR']
      }
    ];
  },
  
  // Get a character by ID
  getCharacterById(id: string): AthroCharacter | null {
    const characters = this.getCharacters();
    return characters.find(character => character.id === id) || null;
  },
  
  // Get a character by subject
  getCharacterBySubject(subject: string): AthroCharacter | null {
    const characters = this.getCharacters();
    return characters.find(character => 
      character.subject.toLowerCase() === subject.toLowerCase()
    ) || null;
  },
  
  // Get a feedback summary for a submission
  getFeedbackSummary(submission: any): FeedbackSummary {
    // This would typically come from the backend
    // But for now, we'll generate a mock feedback
    return {
      id: `feedback-${submission.id}`,
      score: submission.score || Math.floor(Math.random() * 100),
      strengths: [
        'Good understanding of core concepts',
        'Clear explanations of methods used',
        'Effective use of subject-specific terminology'
      ],
      areasToImprove: [
        'Review formulas in section 3.2',
        'Practice more complex problem-solving',
        'Work on time management during assessments'
      ],
      nextSteps: [
        'Complete practice exercises 5-8',
        'Book a session with your Athro mentor',
        'Review feedback on previous assignments'
      ],
      confidence: 7
    };
  },
  
  // Get recent activity for a student
  getRecentActivity(studentId: string) {
    // Simulated data - would come from database
    return [
      {
        id: 'activity-1',
        type: 'quiz',
        subject: 'Mathematics',
        topic: 'Algebra',
        score: 85,
        completedAt: new Date(),
        duration: 15 // minutes
      },
      {
        id: 'activity-2',
        type: 'study',
        subject: 'Science',
        topic: 'Chemistry',
        completedAt: new Date(Date.now() - 86400000), // yesterday
        duration: 25 // minutes
      }
    ];
  },
  
  // Track a study session
  trackStudySession(sessionData: {
    studentId: string;
    subject: AthroSubject;
    topic: string;
    duration: number;
    confidence?: number;
  }) {
    // In a real implementation, this would send data to a backend
    console.log('Study session tracked:', sessionData);
    return {
      id: `session-${Date.now()}`,
      ...sessionData,
      timestamp: new Date()
    };
  }
};

export default athroService;
