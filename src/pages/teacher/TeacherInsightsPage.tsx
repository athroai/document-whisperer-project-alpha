
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Class } from '@/types/teacher';
import { InsightsFilter, TimeRange } from '@/types/insights';
import insightsService from '@/services/insightsService';
import { toast } from '@/components/ui/use-toast';

// Import the individual tab components
import OverviewTab from '@/components/insights/OverviewTab';
import PerformanceTab from '@/components/insights/PerformanceTab';
import ConfidenceTab from '@/components/insights/ConfidenceTab';
import TopicsTab from '@/components/insights/TopicsTab';
import FeedbackTab from '@/components/insights/FeedbackTab';
import ExportsTab from '@/components/insights/ExportsTab';

const TeacherInsightsPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filter state
  const [filter, setFilter] = useState<InsightsFilter>({
    classId: 'all',
    subject: null,
    timeRange: '30days'
  });

  // Available subjects based on teacher's classes
  const [subjects, setSubjects] = useState<string[]>([]);
  
  // Time range options
  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '90days', label: 'Last 90 days' },
    { value: 'year', label: 'This year' },
    { value: 'all', label: 'All time' }
  ];

  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (user && user.id) {
        try {
          setLoading(true);
          const teacherClasses = await insightsService.getTeacherClasses(user.id);
          setClasses(teacherClasses);
          
          // Extract unique subjects from classes
          const uniqueSubjects = [...new Set(teacherClasses.map(c => c.subject))];
          setSubjects(uniqueSubjects);
          
          // Set default class if available
          if (teacherClasses.length > 0) {
            setFilter(prev => ({
              ...prev,
              classId: teacherClasses[0].id
            }));
          }
          
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch teacher classes:", error);
          toast({
            title: "Error loading data",
            description: "There was a problem loading your classes. Please try again.",
            variant: "destructive"
          });
          setLoading(false);
        }
      }
    };
    
    fetchTeacherClasses();
  }, [user]);

  // Handle filter changes
  const handleClassChange = (classId: string) => {
    setFilter(prev => ({ ...prev, classId }));
  };
  
  const handleSubjectChange = (subject: string | null) => {
    setFilter(prev => ({ ...prev, subject }));
  };
  
  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setFilter(prev => ({ ...prev, timeRange }));
  };
  
  // No access if not a teacher
  if (user?.role !== 'teacher') {
    return (
      <TeacherDashboardLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold">Access Restricted</h1>
          <p className="mt-2">You do not have permission to view the insights dashboard.</p>
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insights Dashboard</h1>
          <p className="text-gray-500">Analyze student performance and identify areas for improvement</p>
        </div>
        
        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Dashboard Filters</CardTitle>
            <CardDescription>Customize your view of the data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/3">
                <label htmlFor="class-filter" className="text-sm font-medium text-gray-700 block mb-1">
                  Class
                </label>
                <Select
                  value={filter.classId}
                  onValueChange={handleClassChange}
                >
                  <SelectTrigger id="class-filter" className="w-full">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-1/3">
                <label htmlFor="subject-filter" className="text-sm font-medium text-gray-700 block mb-1">
                  Subject
                </label>
                <Select
                  value={filter.subject || ""}
                  onValueChange={(val) => handleSubjectChange(val === "" ? null : val)}
                >
                  <SelectTrigger id="subject-filter" className="w-full">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-1/3">
                <label htmlFor="time-filter" className="text-sm font-medium text-gray-700 block mb-1">
                  Time Period
                </label>
                <Select
                  value={filter.timeRange}
                  onValueChange={(val) => handleTimeRangeChange(val as TimeRange)}
                >
                  <SelectTrigger id="time-filter" className="w-full">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="confidence">Confidence</TabsTrigger>
            <TabsTrigger value="topics">Topic Mastery</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Trends</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab 
              teacherId={user?.id || ''} 
              filter={filter} 
              loading={loading} 
            />
          </TabsContent>
          
          <TabsContent value="performance">
            <PerformanceTab 
              teacherId={user?.id || ''} 
              filter={filter} 
              loading={loading} 
            />
          </TabsContent>
          
          <TabsContent value="confidence">
            <ConfidenceTab 
              teacherId={user?.id || ''} 
              filter={filter} 
              loading={loading} 
            />
          </TabsContent>
          
          <TabsContent value="topics">
            <TopicsTab 
              teacherId={user?.id || ''} 
              filter={filter} 
              loading={loading} 
            />
          </TabsContent>
          
          <TabsContent value="feedback">
            <FeedbackTab 
              teacherId={user?.id || ''} 
              filter={filter} 
              loading={loading} 
            />
          </TabsContent>
          
          <TabsContent value="exports">
            <ExportsTab 
              teacherId={user?.id || ''} 
              filter={filter} 
              loading={loading} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </TeacherDashboardLayout>
  );
};

export default TeacherInsightsPage;
