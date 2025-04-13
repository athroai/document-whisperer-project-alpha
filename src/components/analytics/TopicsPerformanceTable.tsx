
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface TopicData {
  topic: string;
  avgScore: number;
}

interface TopicsPerformanceTableProps {
  data: TopicData[];
  isLoading?: boolean;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
};

const TopicsPerformanceTable: React.FC<TopicsPerformanceTableProps> = ({ data, isLoading = false }) => {
  const sortedData = [...data].sort((a, b) => b.avgScore - a.avgScore);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Topic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center bg-gray-50 animate-pulse">
            Loading topic data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Topic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center bg-gray-50">
            No topic data available for the selected filters.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Topic</TableHead>
              <TableHead>Average Score</TableHead>
              <TableHead className="w-[30%]">Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.topic}>
                <TableCell className="font-medium">{item.topic}</TableCell>
                <TableCell>{item.avgScore}%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={item.avgScore} 
                      max={100} 
                      className={getScoreColor(item.avgScore)} 
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopicsPerformanceTable;
