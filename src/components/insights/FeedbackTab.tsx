
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { InsightsFilter, FeedbackTrend } from '@/types/insights';
import insightsService from '@/services/insightsService';
import { MessageCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FeedbackTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading: boolean;
}

const FeedbackTab: React.FC<FeedbackTabProps> = ({ teacherId, filter, loading }) => {
  const [feedbackTrends, setFeedbackTrends] = useState<FeedbackTrend[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [openFeedback, setOpenFeedback] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        setLoadingData(true);
        const feedbackData = await insightsService.getFeedbackTrends(teacherId, filter);
        setFeedbackTrends(feedbackData);
        setLoadingData(false);
      } catch (error) {
        console.error("Failed to fetch feedback data:", error);
        setLoadingData(false);
      }
    };
    
    if (teacherId && !loading) {
      fetchFeedbackData();
    }
  }, [teacherId, filter, loading]);
  
  const isLoading = loading || loadingData;
  
  // Prepare data for the pie chart
  const pieChartData = feedbackTrends.map(feedback => ({
    name: feedback.type,
    value: feedback.count
  }));
  
  // Colors for the pie chart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];
  
  const toggleFeedback = (id: string) => {
    if (openFeedback === id) {
      setOpenFeedback(null);
    } else {
      setOpenFeedback(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : feedbackTrends.length > 0 ? (
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value} instances`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle size={40} className="mx-auto mb-2 opacity-30" />
              <p>No feedback trends available</p>
              <p className="text-sm">Try selecting a different class or time period</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Common Feedback Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Common Feedback Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : feedbackTrends.length > 0 ? (
            <div className="space-y-4">
              {feedbackTrends.map((feedback) => (
                <Collapsible
                  key={feedback.id}
                  open={openFeedback === feedback.id}
                  onOpenChange={() => toggleFeedback(feedback.id)}
                  className="border rounded-md p-4"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <MessageCircle size={20} className="text-purple-700" />
                        </div>
                        <div>
                          <h3 className="font-medium">{feedback.type}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{feedback.count} instances</span>
                            <span>•</span>
                            <span>Subject: {feedback.subject}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {openFeedback === feedback.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Related Topics:</p>
                        <div className="flex flex-wrap gap-2">
                          {feedback.topics.map((topic, i) => (
                            <Badge key={i} variant="outline">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Example Feedback:</p>
                        <div className="space-y-2">
                          {feedback.examples.map((example, i) => (
                            <p key={i} className="text-sm bg-gray-50 p-2 rounded">{example}</p>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2 border-t mt-3">
                        <div className="flex items-start gap-2 text-sm bg-amber-50 p-2 rounded">
                          <AlertCircle size={16} className="text-amber-500 mt-0.5" />
                          <p>
                            <span className="font-medium">Action recommendation:</span> {' '}
                            {feedback.count > 20 
                              ? "Consider dedicated revision sessions focused on this topic."
                              : feedback.count > 10
                                ? "Include focused practice on this area in upcoming lessons."
                                : "Monitor this feedback pattern for potential growth."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle size={40} className="mx-auto mb-2 opacity-30" />
              <p>No feedback patterns available</p>
              <p className="text-sm">Try selecting a different class or time period</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Teacher Tips */}
      {!isLoading && feedbackTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Teaching Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                <AlertCircle size={20} className="text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Common misconceptions identified</p>
                  <p className="text-gray-600">
                    The most frequent feedback types suggest students may be struggling with fundamental concepts.
                    Consider revisiting these core ideas before moving to more advanced topics.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-md">
                <AlertCircle size={20} className="text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Cross-subject connections</p>
                  <p className="text-gray-600">
                    Some feedback patterns appear across multiple subjects, suggesting broader learning gaps that might
                    benefit from interdisciplinary approaches.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                <AlertCircle size={20} className="text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Suggested interventions</p>
                  <p className="text-gray-600">
                    Based on feedback patterns, consider implementing:
                  </p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Focused review sessions on the top 2-3 feedback topics</li>
                    <li>Worked examples that address common misconceptions</li>
                    <li>Peer teaching opportunities for stronger students</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeedbackTab;
