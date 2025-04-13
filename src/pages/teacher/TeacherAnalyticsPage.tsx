
import React, { useState, useEffect } from 'react';
import { 
  AnalyticsFilter, 
  AnalyticsSummary,
  SetPerformance,
  SubjectPerformance
} from '@/types/analytics';
import { teacherAnalyticsService } from '@/services/teacherAnalyticsService';
import SummaryCards from '@/components/analytics/SummaryCards';
import AnalyticsFilters from '@/components/analytics/AnalyticsFilters';
import PerformanceChart from '@/components/analytics/PerformanceChart';
import SubmissionTrendChart from '@/components/analytics/SubmissionTrendChart';
import TopicsPerformanceTable from '@/components/analytics/TopicsPerformanceTable';
import NoAnalyticsData from '@/components/analytics/NoAnalyticsData';

const TeacherAnalyticsPage: React.FC = () => {
  // State
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalStudents: 0,
    totalAssignments: 0,
    averageCompletionRate: 0,
    averageScore: 0
  });
  const [filter, setFilter] = useState<AnalyticsFilter>({
    subject: null,
    set: null,
    dateRange: 'month'
  });
  const [filterOptions, setFilterOptions] = useState<{ subjects: string[], sets: string[] }>({
    subjects: [],
    sets: []
  });
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [setPerformance, setSetPerformance] = useState<SetPerformance[]>([]);
  const [submissionTrend, setSubmissionTrend] = useState<{ date: string, submitted: number }[]>([]);
  const [topicPerformance, setTopicPerformance] = useState<{ topic: string, avgScore: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Format data for charts
  const formattedSubjectData = subjectPerformance.map(item => ({
    name: item.subject,
    avgScore: item.avgScore,
    completionRate: item.completionRate,
    students: item.students
  }));

  const formattedSetData = setPerformance.map(item => ({
    name: item.set,
    avgScore: item.avgScore,
    completionRate: item.completionRate,
    students: item.students
  }));

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        
        // Load filter options
        const options = await teacherAnalyticsService.getFilterOptions();
        setFilterOptions(options);
        
        // Load summary data
        const summaryData = await teacherAnalyticsService.getAnalyticsSummary();
        setSummary(summaryData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading initial analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        setLoading(false);
      }
    }
    
    loadInitialData();
  }, []);

  // Load data based on filters
  useEffect(() => {
    async function loadFilteredData() {
      try {
        setLoading(true);
        
        // Load subject performance
        const subjectData = await teacherAnalyticsService.getSubjectPerformance(filter);
        setSubjectPerformance(subjectData);
        
        // Load set performance
        const setData = await teacherAnalyticsService.getSetPerformance(filter);
        setSetPerformance(setData);
        
        // Load submission trend
        const trendData = await teacherAnalyticsService.getSubmissionsOverTime(filter);
        setSubmissionTrend(trendData);
        
        // Load topic performance
        const topicData = await teacherAnalyticsService.getTopicPerformance(filter);
        setTopicPerformance(topicData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading filtered analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        setLoading(false);
      }
    }
    
    loadFilteredData();
  }, [filter]);

  // Handle filter changes
  const handleFilterChange = (newFilter: AnalyticsFilter) => {
    setFilter(newFilter);
  };

  // Check if there's any data to display
  const hasData = !loading && !error && (subjectPerformance.length > 0 || setPerformance.length > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      
      {/* Summary Cards */}
      <SummaryCards summary={summary} isLoading={loading} />
      
      {/* Filters */}
      <AnalyticsFilters 
        filter={filter} 
        onFilterChange={handleFilterChange} 
        subjects={filterOptions.subjects} 
        sets={filterOptions.sets}
        isLoading={loading}
      />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      {!hasData && !loading && !error && <NoAnalyticsData />}
      
      {hasData && (
        <>
          {/* Performance Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PerformanceChart 
              data={formattedSubjectData} 
              title="Performance by Subject" 
              isLoading={loading} 
            />
            <PerformanceChart 
              data={formattedSetData} 
              title="Performance by Set" 
              isLoading={loading} 
            />
          </div>
          
          {/* Submission Trend and Topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SubmissionTrendChart 
              data={submissionTrend} 
              isLoading={loading}
            />
            <TopicsPerformanceTable 
              data={topicPerformance} 
              isLoading={loading}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherAnalyticsPage;
