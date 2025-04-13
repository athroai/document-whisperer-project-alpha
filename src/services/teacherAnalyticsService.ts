
import { AnalyticsFilter, AnalyticsOverview, AnalyticsSummary, SetPerformance, SubjectPerformance } from '@/types/analytics';
import { generateMockAnalytics } from '@/data/teacher-analytics-mock';

class TeacherAnalyticsService {
  private cachedData: {
    overviews: AnalyticsOverview[],
    summary: AnalyticsSummary
  } | null = null;

  /**
   * Get analytics data
   * This is currently using mock data but can be changed to use Firestore
   */
  private async getData(): Promise<{
    overviews: AnalyticsOverview[],
    summary: AnalyticsSummary
  }> {
    // Cache the data to ensure consistency during development
    if (!this.cachedData) {
      // Simulate a network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      this.cachedData = generateMockAnalytics();
    }
    return this.cachedData;
  }

  /**
   * Get summary analytics for the teacher dashboard
   */
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const { summary } = await this.getData();
    return summary;
  }

  /**
   * Get filtered analytics overviews
   */
  async getAnalyticsOverviews(filter: AnalyticsFilter): Promise<AnalyticsOverview[]> {
    const { overviews } = await this.getData();
    
    return overviews.filter(item => {
      // Apply subject filter
      if (filter.subject && item.subject !== filter.subject) {
        return false;
      }
      
      // Apply set filter
      if (filter.set && item.set !== filter.set) {
        return false;
      }
      
      // Date range filtering would happen here for real data
      
      return true;
    });
  }

  /**
   * Get performance metrics by subject
   */
  async getSubjectPerformance(filter: AnalyticsFilter): Promise<SubjectPerformance[]> {
    const overviews = await this.getAnalyticsOverviews(filter);
    
    // Group by subject and calculate averages
    const subjectMap = new Map<string, {
      totalScore: number,
      totalCompletion: number,
      totalStudents: number,
      count: number
    }>();
    
    overviews.forEach(item => {
      if (!subjectMap.has(item.subject)) {
        subjectMap.set(item.subject, {
          totalScore: 0,
          totalCompletion: 0,
          totalStudents: 0,
          count: 0
        });
      }
      
      const data = subjectMap.get(item.subject)!;
      data.totalScore += item.avgScore;
      data.totalCompletion += item.completionRate;
      data.totalStudents += item.students;
      data.count += 1;
    });
    
    // Convert to array and calculate averages
    return Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      avgScore: Math.round(data.totalScore / data.count),
      completionRate: Math.round(data.totalCompletion / data.count),
      students: data.totalStudents
    }));
  }

  /**
   * Get performance metrics by set
   */
  async getSetPerformance(filter: AnalyticsFilter): Promise<SetPerformance[]> {
    const overviews = await this.getAnalyticsOverviews(filter);
    
    // Group by set and calculate averages
    const setMap = new Map<string, {
      totalScore: number,
      totalCompletion: number,
      totalStudents: number,
      count: number
    }>();
    
    overviews.forEach(item => {
      if (!setMap.has(item.set)) {
        setMap.set(item.set, {
          totalScore: 0,
          totalCompletion: 0,
          totalStudents: 0,
          count: 0
        });
      }
      
      const data = setMap.get(item.set)!;
      data.totalScore += item.avgScore;
      data.totalCompletion += item.completionRate;
      data.totalStudents += item.students;
      data.count += 1;
    });
    
    // Convert to array and calculate averages
    return Array.from(setMap.entries()).map(([set, data]) => ({
      set,
      avgScore: Math.round(data.totalScore / data.count),
      completionRate: Math.round(data.totalCompletion / data.count),
      students: data.totalStudents
    }));
  }

  /**
   * Get aggregated submissions over time
   */
  async getSubmissionsOverTime(filter: AnalyticsFilter): Promise<{date: string, submitted: number}[]> {
    const overviews = await this.getAnalyticsOverviews(filter);
    
    // Create a map of dates to total submissions
    const submissionMap = new Map<string, number>();
    
    overviews.forEach(item => {
      item.submissionsOverTime.forEach(submission => {
        const currentValue = submissionMap.get(submission.date) || 0;
        submissionMap.set(submission.date, currentValue + submission.submitted);
      });
    });
    
    // Convert to array and sort by date
    return Array.from(submissionMap.entries())
      .map(([date, submitted]) => ({ date, submitted }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get topic performance aggregated across selected sets/subjects
   */
  async getTopicPerformance(filter: AnalyticsFilter): Promise<{topic: string, avgScore: number}[]> {
    const overviews = await this.getAnalyticsOverviews(filter);
    
    // Create a map of topics to total scores
    const topicMap = new Map<string, {total: number, count: number}>();
    
    overviews.forEach(item => {
      item.topicScores.forEach(topicScore => {
        if (!topicMap.has(topicScore.topic)) {
          topicMap.set(topicScore.topic, {total: 0, count: 0});
        }
        
        const data = topicMap.get(topicScore.topic)!;
        data.total += topicScore.avgScore;
        data.count += 1;
      });
    });
    
    // Convert to array and calculate averages
    return Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        avgScore: Math.round(data.total / data.count)
      }))
      .sort((a, b) => b.avgScore - a.avgScore); // Sort from highest to lowest
  }

  /**
   * Get available subjects and sets for filtering
   */
  async getFilterOptions(): Promise<{subjects: string[], sets: string[]}> {
    const { overviews } = await this.getData();
    
    const subjects = Array.from(new Set(overviews.map(item => item.subject)));
    const sets = Array.from(new Set(overviews.map(item => item.set)));
    
    return { subjects, sets };
  }
}

export const teacherAnalyticsService = new TeacherAnalyticsService();
