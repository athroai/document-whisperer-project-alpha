
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button'; 
import { Move, Clock, Edit, Plus, Calendar } from 'lucide-react';
import SlotBasedCalendar from '@/components/calendar/SlotBasedCalendar';
import SimpleStudyScheduler from '@/components/calendar/SimpleStudyScheduler';
import CreateStudySession from '@/components/calendar/CreateStudySession';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

const CalendarPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("simple");
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const { fetchEvents } = useCalendarEvents();
  
  const handleCreateSuccess = () => {
    fetchEvents();
    setShowCreateDialog(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Your Study Calendar</h1>
              <p className="text-gray-500 mt-1">
                View and manage your personalized study schedule
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </div>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Calendar Tips</h3>
                  <div className="mt-1 text-xs text-blue-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <Move className="h-3 w-3" />
                      <span>Drag sessions to reschedule</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Edit className="h-3 w-3" />
                      <span>Click on a session to edit details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plus className="h-3 w-3" />
                      <span>Click an empty slot to add a new session</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs 
            defaultValue="simple"
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="simple">Weekly View</TabsTrigger>
              <TabsTrigger value="detailed">Detailed View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="simple">
              <Card>
                <CardContent className="p-6">
                  <SimpleStudyScheduler />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="detailed">
              <Card>
                <CardContent className="p-6">
                  <SlotBasedCalendar />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <CreateStudySession
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default CalendarPage;
