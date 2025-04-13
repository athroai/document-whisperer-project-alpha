
import React, { useState, useEffect } from 'react';
import { monitoringService } from '@/services/monitoringService';
import { ActivitySummary } from '@/types/monitoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LiveMonitoringSummary: React.FC = () => {
  const [summaryData, setSummaryData] = useState<ActivitySummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSummaryData = async () => {
    try {
      const data = await monitoringService.getActivitySummary();
      setSummaryData(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
    
    // Set up interval for refreshing data every 15 seconds
    const intervalId = setInterval(fetchSummaryData, 15000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format session time for display
  const formatSessionTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summaryData.reduce((sum, item) => sum + item.activeStudents, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total across all subjects</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summaryData.length > 0
                    ? Math.round(
                        summaryData.reduce(
                          (sum, item) => sum + item.averageConfidence * item.activeStudents,
                          0
                        ) / summaryData.reduce((sum, item) => sum + item.activeStudents, 0)
                      )
                    : 0}
                  /10
                </div>
                <p className="text-sm text-muted-foreground">Across all sessions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Session Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summaryData.length > 0
                    ? formatSessionTime(
                        Math.round(
                          summaryData.reduce(
                            (sum, item) => sum + item.averageSessionTime * item.activeStudents,
                            0
                          ) / summaryData.reduce((sum, item) => sum + item.activeStudents, 0)
                        )
                      )
                    : "0 min"}
                </div>
                <p className="text-sm text-muted-foreground">Across all sessions</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Active Sessions by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summaryData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="Active Students" dataKey="activeStudents" fill="#8884d8" />
                    <Bar name="Average Confidence" dataKey="averageConfidence" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveMonitoringSummary;
