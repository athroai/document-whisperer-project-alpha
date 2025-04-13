
import { StudentProgress } from '@/types/progress';

export const generateMockProgress = (userId: string): StudentProgress => {
  const now = new Date();
  
  // Generate dates for the last 10 weeks (for history)
  const generateDates = () => {
    const dates = [];
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - (i * 7));
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };
  
  const dates = generateDates();
  
  // Generate mock data for each subject
  return {
    userId,
    lastUpdated: now.toISOString(),
    subjects: [
      {
        subject: 'Mathematics',
        completionRate: 78,
        averageScore: 82.5,
        recentActivity: 'Completed Quadratic Equations quiz',
        assignmentsCompleted: 15,
        assignmentsIncomplete: 3,
        strengthAreas: ['Algebra', 'Geometry'],
        weaknessAreas: ['Statistics', 'Calculus'],
        studyTimeMinutes: 340,
        scoreHistory: dates.map((date, index) => ({
          date,
          score: Math.floor(70 + Math.random() * 25) // Scores between 70-95
        }))
      },
      {
        subject: 'Science',
        completionRate: 65,
        averageScore: 76.8,
        recentActivity: 'Submitted Chemistry lab report',
        assignmentsCompleted: 12,
        assignmentsIncomplete: 5,
        strengthAreas: ['Biology', 'Chemistry'],
        weaknessAreas: ['Physics'],
        studyTimeMinutes: 290,
        scoreHistory: dates.map((date, index) => ({
          date,
          score: Math.floor(65 + Math.random() * 30) // Scores between 65-95
        }))
      },
      {
        subject: 'English',
        completionRate: 85,
        averageScore: 88.2,
        recentActivity: 'Completed essay on Shakespeare',
        assignmentsCompleted: 18,
        assignmentsIncomplete: 1,
        strengthAreas: ['Literature', 'Essay Writing'],
        weaknessAreas: ['Grammar'],
        studyTimeMinutes: 310,
        scoreHistory: dates.map((date, index) => ({
          date,
          score: Math.floor(75 + Math.random() * 25) // Scores between 75-100
        }))
      },
      {
        subject: 'History',
        completionRate: 72,
        averageScore: 79.5,
        recentActivity: 'Completed World War II timeline project',
        assignmentsCompleted: 14,
        assignmentsIncomplete: 4,
        strengthAreas: ['Modern History'],
        weaknessAreas: ['Ancient Civilizations'],
        studyTimeMinutes: 280,
        scoreHistory: dates.map((date, index) => ({
          date,
          score: Math.floor(70 + Math.random() * 20) // Scores between 70-90
        }))
      }
    ]
  };
};
