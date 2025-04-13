
import { AnalyticsOverview, AnalyticsSummary } from "@/types/analytics";

// Generate dates for the past month
const generatePastDates = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = days; i > 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
};

const pastDates = generatePastDates(30);

// Subjects and sets
const subjects = ['Maths', 'Science', 'English', 'History', 'Geography'];
const sets = ['10A', '10B', '11A', '11B', '11C'];
const topics = {
  'Maths': ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry'],
  'Science': ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Ecology'],
  'English': ['Literature', 'Grammar', 'Essay Writing', 'Poetry', 'Comprehension'],
  'History': ['Ancient History', 'Medieval', 'Modern', 'World Wars', 'Local History'],
  'Geography': ['Physical Geography', 'Human Geography', 'Maps', 'Weather', 'Ecosystems']
};

// Generate random analytics data
export const generateMockAnalytics = (): {
  overviews: AnalyticsOverview[],
  summary: AnalyticsSummary
} => {
  const overviews: AnalyticsOverview[] = [];
  let totalStudents = 0;
  let totalScores = 0;
  let totalCompletionRates = 0;

  // Generate data for each subject and set combination
  subjects.forEach(subject => {
    sets.forEach(set => {
      const students = Math.floor(Math.random() * 20) + 10; // 10-30 students
      const avgScore = Math.floor(Math.random() * 30) + 60; // 60-90 avg score
      const completionRate = Math.floor(Math.random() * 40) + 60; // 60-100% completion
      
      totalStudents += students;
      totalScores += avgScore;
      totalCompletionRates += completionRate;

      // Generate submissions over time
      const submissionsOverTime = pastDates.map(date => ({
        date,
        submitted: Math.floor(Math.random() * students * 0.8) // Random submissions based on class size
      }));

      // Generate topic scores
      const subjectTopics = topics[subject as keyof typeof topics] || [];
      const topicScores = subjectTopics.map(topic => ({
        topic,
        avgScore: Math.floor(Math.random() * 40) + 60 // 60-100 avg score
      }));

      overviews.push({
        subject,
        set,
        students,
        avgScore,
        completionRate,
        submissionsOverTime,
        topicScores
      });
    });
  });

  // Calculate summary
  const totalEntries = subjects.length * sets.length;
  const summary: AnalyticsSummary = {
    totalStudents,
    totalAssignments: Math.floor(totalStudents * 2.5), // Approx 2-3 assignments per student
    averageCompletionRate: Math.floor(totalCompletionRates / totalEntries),
    averageScore: Math.floor(totalScores / totalEntries)
  };

  return { overviews, summary };
};
