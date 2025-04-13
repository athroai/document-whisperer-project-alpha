
import React from 'react';
import { SubjectProgress } from '@/types/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface ProgressDetailsProps {
  data: SubjectProgress;
}

const ProgressDetails: React.FC<ProgressDetailsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      {/* Overall Completion */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Overall Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span>Progress</span>
            <span className="font-medium">{data.completionRate}%</span>
          </div>
          <Progress 
            value={data.completionRate} 
            className="h-2"
            indicatorClassName="bg-purple-500"
          />
          
          {data.studyTimeMinutes && (
            <div className="flex items-center mt-4 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{Math.floor(data.studyTimeMinutes / 60)} hours {data.studyTimeMinutes % 60} minutes spent studying</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Strengths and Weaknesses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Areas of Focus</CardTitle>
        </CardHeader>
        <CardContent>
          {data.strengthAreas && data.strengthAreas.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                <span className="font-medium">Strengths</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.strengthAreas.map((area, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {data.weaknessAreas && data.weaknessAreas.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                <span className="font-medium">Areas to Improve</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.weaknessAreas.map((area, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressDetails;
