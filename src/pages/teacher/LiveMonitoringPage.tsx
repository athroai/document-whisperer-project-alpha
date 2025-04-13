
import React, { useState } from 'react';
import LiveMonitoringTable from '@/components/monitoring/LiveMonitoringTable';
import LiveMonitoringSummary from '@/components/monitoring/LiveMonitoringSummary';
import LiveMonitoringFilters from '@/components/monitoring/LiveMonitoringFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeacherDashboardLayout from '@/components/dashboard/TeacherDashboardLayout';
import { monitoringService } from '@/services/monitoringService';

const LiveMonitoringPage: React.FC = () => {
  const [view, setView] = useState<'table' | 'summary'>('table');
  const [sortBy, setSortBy] = useState<string>('lastName');
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  const [filterActivity, setFilterActivity] = useState<string | null>(null);
  
  return (
    <TeacherDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Student Monitoring</h1>
          <p className="text-gray-500">
            View and interact with students currently using the Athro platform
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Data refreshes automatically every 15 seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Tabs defaultValue="table" onValueChange={(value) => setView(value as 'table' | 'summary')}>
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="table">Detailed View</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>
                  
                  <LiveMonitoringFilters
                    onSubjectFilterChange={setFilterSubject}
                    onActivityFilterChange={setFilterActivity}
                    onSortChange={setSortBy}
                  />
                </div>
                
                <TabsContent value="table" className="mt-4">
                  <LiveMonitoringTable 
                    sortBy={sortBy}
                    filterSubject={filterSubject}
                    filterActivity={filterActivity}
                  />
                </TabsContent>
                
                <TabsContent value="summary" className="mt-4">
                  <LiveMonitoringSummary />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherDashboardLayout>
  );
};

export default LiveMonitoringPage;
