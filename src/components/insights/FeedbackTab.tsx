
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InsightsFilter, FeedbackTrend } from '@/types/insights';
import insightsService from '@/services/insightsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FeedbackTabProps {
  teacherId: string;
  filter: InsightsFilter;
  loading: boolean;
}

const FeedbackTab: React.FC<FeedbackTabProps> = ({ teacherId, filter, loading }) => {
  const [feedbackTrends, setFeedbackTrends] = useState<FeedbackTrend[]>([]);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (teacherId && !loading) {
        setIsLoading(true);
        try {
          // Fetch feedback trends data
          const trendsData = await insightsService.getFeedbackTrends(teacherId, filter);
          setFeedbackTrends(trendsData);
          
        } catch (error) {
          console.error("Failed to fetch feedback data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchFeedbackData();
  }, [teacherId, filter, loading]);

  const toggleExpand = (id: string) => {
    if (expandedFeedback === id) {
      setExpandedFeedback(null);
    } else {
      setExpandedFeedback(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Common Feedback Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full aspect-[3/2] bg-muted/10 flex items-center justify-center rounded-lg">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feedbackTrends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Occurrences" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Feedback Trends Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Feedback Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feedback Type</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? 
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )) : 
                feedbackTrends.map(feedback => (
                  <React.Fragment key={feedback.id}>
                    <TableRow>
                      <TableCell className="font-medium">{feedback.type}</TableCell>
                      <TableCell>{feedback.count}</TableCell>
                      <TableCell>{feedback.subject}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {feedback.topics.slice(0, 2).map(topic => (
                            <Badge key={topic} variant="outline">{topic}</Badge>
                          ))}
                          {feedback.topics.length > 2 && 
                            <Badge variant="outline">+{feedback.topics.length - 2}</Badge>
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleExpand(feedback.id)}
                        >
                          {expandedFeedback === feedback.id ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedFeedback === feedback.id && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/20">
                          <div className="py-2">
                            <h5 className="font-medium mb-2">Example Feedback:</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {feedback.examples.map((example, i) => (
                                <li key={i} className="text-sm text-muted-foreground">{example}</li>
                              ))}
                            </ul>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackTab;
