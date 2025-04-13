
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIAlert } from '@/types/insights';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AIAlertFeedProps {
  alerts: AIAlert[];
  loading: boolean;
}

const AIAlertFeed: React.FC<AIAlertFeedProps> = ({ alerts, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>Loading intelligence data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 p-3 animate-pulse rounded-lg bg-muted"
              >
                <div className="w-8 h-8 rounded-full bg-muted-foreground/20"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-2/3 rounded bg-muted-foreground/20"></div>
                  <div className="h-3 w-full rounded bg-muted-foreground/20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alerts.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>No alerts or insights available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
            <Info className="h-10 w-10 mb-2" />
            <p>No notable patterns detected in student data at this time.</p>
            <p className="text-sm mt-2">Alerts will appear here when AI detects significant changes in student performance or engagement.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityIcon = (severity: AIAlert['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="text-red-500" />;
      case 'medium':
        return <AlertTriangle className="text-amber-500" />;
      case 'low':
      default:
        return <Info className="text-blue-500" />;
    }
  };

  const getSeverityClass = (severity: AIAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>
          Intelligence feed based on student performance and engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityClass(alert.severity)}`}
            >
              <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{alert.studentName}</p>
                  {alert.subject && (
                    <Badge variant="outline">{alert.subject}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(alert.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAlertFeed;
