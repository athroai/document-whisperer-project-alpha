
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InsightsFilter, TopicPerformance } from '@/types/insights';
import insightsService from '@/services/insightsService';
import { ArrowUpDown, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TopicsTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading: boolean;
}

const TopicsTab: React.FC<TopicsTabProps> = ({ teacherId, filter, loading }) => {
  const [topicData, setTopicData] = useState<TopicPerformance[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof TopicPerformance>('averageScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchTopicsData = async () => {
      try {
        setLoadingData(true);
        const topics = await insightsService.getTopicPerformance(teacherId, filter);
        setTopicData(topics);
        setLoadingData(false);
      } catch (error) {
        console.error("Failed to fetch topics data:", error);
        setLoadingData(false);
      }
    };
    
    if (teacherId && !loading) {
      fetchTopicsData();
    }
  }, [teacherId, filter, loading]);
  
  const isLoading = loading || loadingData;
  
  // Sort the topic data
  const sortedTopics = [...topicData].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortColumn] > b[sortColumn] ? 1 : -1;
    } else {
      return a[sortColumn] < b[sortColumn] ? 1 : -1;
    }
  });
  
  // Filter by search term
  const filteredTopics = sortedTopics.filter(topic => {
    const searchLower = searchTerm.toLowerCase();
    return (
      topic.topic.toLowerCase().includes(searchLower) ||
      topic.subject.toLowerCase().includes(searchLower)
    );
  });
  
  // Toggle sort direction
  const handleSort = (column: keyof TopicPerformance) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Helper to get topic status badge
  const getTopicStatus = (score: number) => {
    if (score >= 75) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Strong</Badge>;
    } else if (score >= 60) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Good</Badge>;
    } else if (score >= 45) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Needs Work</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Critical</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Topic Mastery Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[500px] w-full" />
          ) : (
            <>
              <div className="flex items-center mb-4">
                <Search className="mr-2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search topics or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="w-[200px] cursor-pointer"
                        onClick={() => handleSort('topic')}
                      >
                        <div className="flex items-center">
                          Topic
                          {sortColumn === 'topic' && <ArrowUpDown size={16} className="ml-1" />}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('subject')}
                      >
                        <div className="flex items-center">
                          Subject
                          {sortColumn === 'subject' && <ArrowUpDown size={16} className="ml-1" />}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('averageScore')}
                      >
                        <div className="flex items-center">
                          Average Score
                          {sortColumn === 'averageScore' && <ArrowUpDown size={16} className="ml-1" />}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('averageConfidence')}
                      >
                        <div className="flex items-center">
                          Confidence
                          {sortColumn === 'averageConfidence' && <ArrowUpDown size={16} className="ml-1" />}
                        </div>
                      </TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTopics.length > 0 ? (
                      filteredTopics.map((topic) => (
                        <TableRow key={topic.id}>
                          <TableCell className="font-medium">{topic.topic}</TableCell>
                          <TableCell>{topic.subject}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={topic.averageScore} className="h-2 w-24" />
                              <span className="text-sm font-medium">{topic.averageScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {topic.averageConfidence}/10
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">{topic.quizzesCount} quizzes</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{topic.assignmentsCount} assignments</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTopicStatus(topic.averageScore)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <AlertCircle size={40} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500">No topics found</p>
                          <p className="text-sm text-gray-400">Try a different search term or filter</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center mt-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Strong (75%+)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Good (60-74%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-sm">Needs Work (45-59%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">Critical (< 45%)</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {!isLoading && topicData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-500" />
              <span>Action Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Find topics with low scores */}
              {filteredTopics
                .filter(topic => topic.averageScore < 45)
                .slice(0, 3)
                .map(topic => (
                  <div key={topic.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-md">
                    <AlertCircle size={20} className="text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{topic.topic} needs attention</p>
                      <p className="text-sm text-gray-600">
                        Students are scoring an average of {topic.averageScore}% with confidence of {topic.averageConfidence}/10.
                        Consider focused review sessions on this topic.
                      </p>
                    </div>
                  </div>
                ))}
              
              {/* Find topics with good scores to celebrate */}
              {filteredTopics
                .filter(topic => topic.averageScore > 80)
                .slice(0, 1)
                .map(topic => (
                  <div key={topic.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                    <CheckCircle2 size={20} className="text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Great progress on {topic.topic}</p>
                      <p className="text-sm text-gray-600">
                        Students are excelling with an average of {topic.averageScore}% and confidence of {topic.averageConfidence}/10.
                        Consider challenging extension work.
                      </p>
                    </div>
                  </div>
                ))}
                
              {/* Gap between confidence and performance */}
              {filteredTopics
                .filter(topic => Math.abs(topic.averageScore - (topic.averageConfidence * 10)) > 20)
                .slice(0, 1)
                .map(topic => {
                  const isOverconfident = topic.averageConfidence * 10 > topic.averageScore;
                  return (
                    <div key={topic.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                      <AlertCircle size={20} className="text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {isOverconfident ? "Overconfidence" : "Underconfidence"} in {topic.topic}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isOverconfident 
                            ? `Students report ${topic.averageConfidence}/10 confidence but score only ${topic.averageScore}%. Consider more practice tests.` 
                            : `Students score ${topic.averageScore}% but report only ${topic.averageConfidence}/10 confidence. Consider confidence-building exercises.`}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TopicsTab;
