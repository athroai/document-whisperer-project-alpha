
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InsightsFilter, TopicPerformance } from '@/types/insights';
import insightsService from '@/services/insightsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TopicsTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading: boolean;
}

const TopicsTab: React.FC<TopicsTabProps> = ({ teacherId, filter, loading }) => {
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopicData = async () => {
      if (teacherId && !loading) {
        setIsLoading(true);
        try {
          // Fetch topic performance data
          const topicsData = await insightsService.getTopicPerformance(teacherId, filter);
          setTopicPerformance(topicsData);
          
        } catch (error) {
          console.error("Failed to fetch topic data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchTopicData();
  }, [teacherId, filter, loading]);

  // Filter topics based on search term
  const filteredTopics = searchTerm 
    ? topicPerformance.filter(topic => 
        topic.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
        topic.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : topicPerformance;

  return (
    <div className="space-y-6">
      {/* Topics Table with Search */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Topic Mastery Analysis</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                className="w-[200px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
                <TableHead className="text-right">Assignments</TableHead>
                <TableHead className="text-right">Quizzes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? 
                Array(10).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                  </TableRow>
                )) : 
                filteredTopics.map(topic => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium">{topic.topic}</TableCell>
                    <TableCell>{topic.subject}</TableCell>
                    <TableCell className="text-right">{topic.averageScore}%</TableCell>
                    <TableCell className="text-right">{topic.averageConfidence}/10</TableCell>
                    <TableCell className="text-right">{topic.assignmentsCount}</TableCell>
                    <TableCell className="text-right">{topic.quizzesCount}</TableCell>
                  </TableRow>
                ))
              }
              {!isLoading && filteredTopics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No topics found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicsTab;
