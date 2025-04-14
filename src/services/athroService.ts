
import { AthroCharacter, AthroSubject, ExamBoard } from '@/types/athro';
import { FeedbackSummary } from '@/types/feedback';
import { supabase } from '@/integrations/supabase/client';

// Service for Athro character management
const athroService = {
  // Get available Athro characters - from Supabase
  getCharacters: async (): Promise<AthroCharacter[]> => {
    try {
      // Using explicit type assertion for the table name
      const { data, error } = await supabase
        .from('athro_characters' as any)
        .select('*');
        
      if (error) {
        console.error('Error fetching Athro characters:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('No Athro characters found, returning fallback data');
        return athroService.getFallbackCharacters();
      }
      
      // Map database fields to our AthroCharacter type with explicit type assertions
      return data.map((char: any) => ({
        id: char.id,
        name: char.name,
        subject: char.subject as AthroSubject,
        avatar: char.avatar_url,
        description: char.description,
        topics: char.strengths || [],
        examBoards: ['WJEC', 'AQA', 'OCR'],
        supportsMathNotation: char.subject === 'Mathematics'
      }));
    } catch (error) {
      console.error('Error in getCharacters:', error);
      return athroService.getFallbackCharacters();
    }
  },
  
  // Fallback characters in case of database connection issues
  getFallbackCharacters: (): AthroCharacter[] => {
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
  getCharacterById: async (id: string): Promise<AthroCharacter | null> => {
    try {
      // Using explicit type assertion for the table name
      const { data, error } = await supabase
        .from('athro_characters' as any)
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error(`Error fetching character with ID ${id}:`, error);
        return null;
      }
      
      if (!data) return null;
      
      // Explicit type assertion for database fields
      const char = data as any;
      return {
        id: char.id,
        name: char.name,
        subject: char.subject as AthroSubject,
        avatar: char.avatar_url,
        description: char.description,
        topics: char.strengths || [],
        examBoards: ['WJEC', 'AQA', 'OCR'],
        supportsMathNotation: char.subject === 'Mathematics'
      };
    } catch (error) {
      console.error(`Error in getCharacterById for ID ${id}:`, error);
      return null;
    }
  },
  
  // Get a character by subject
  getCharacterBySubject: async (subject: string): Promise<AthroCharacter | null> => {
    try {
      // Using type assertion to bypass TypeScript constraints
      const { data, error } = await supabase
        .from('athro_characters' as any)
        .select('*')
        .ilike('subject', subject)
        .maybeSingle();
        
      if (error) {
        console.error(`Error fetching character for subject ${subject}:`, error);
        return null;
      }
      
      if (!data) return null;
      
      // Type assertion to access properties
      const char = data as any;
      return {
        id: char.id,
        name: char.name,
        subject: char.subject as AthroSubject,
        avatar: char.avatar_url,
        description: char.description,
        topics: char.strengths || [],
        examBoards: ['WJEC', 'AQA', 'OCR'],
        supportsMathNotation: char.subject === 'Mathematics'
      };
    } catch (error) {
      console.error(`Error in getCharacterBySubject for subject ${subject}:`, error);
      return null;
    }
  },
  
  // Get a feedback summary for a submission
  getFeedbackSummary: (submission: any): FeedbackSummary => {
    // This would typically come from the backend
    // But for now, we'll generate a mock feedback
    return {
      score: submission.score || Math.floor(Math.random() * 100),
      strengths: [
        'Good understanding of core concepts',
        'Clear explanations of methods used',
        'Effective use of subject-specific terminology'
      ],
      improvements: [
        'Review formulas in section 3.2',
        'Practice more complex problem-solving',
        'Work on time management during assessments'
      ],
      nextSteps: [
        'Complete practice exercises 5-8',
        'Book a session with your Athro mentor',
        'Review feedback on previous assignments'
      ],
      confidence: 7,
      feedback: `Feedback for ${submission.subject || 'activity'}`,
      encouragement: 'Keep up the great work!',
      activityType: 'quiz',
      activityId: submission.id || 'default-activity',
      activityName: submission.title || 'Practice Activity',
      subject: submission.subject || 'Unknown'
    };
  },
  
  // Get recent activity for a student
  getRecentActivity: (studentId: string) => {
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
  trackStudySession: (sessionData: {
    studentId: string;
    subject: AthroSubject;
    topic: string;
    duration: number;
    confidence?: number;
  }) => {
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
