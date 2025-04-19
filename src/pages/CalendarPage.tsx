
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button'; 
import { Move, Clock, Edit, Plus, Calendar, Info } from 'lucide-react';
import SimpleStudyScheduler from '@/components/calendar/SimpleStudyScheduler';
import CreateStudySession from '@/components/calendar/CreateStudySession';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useToast } from '@/hooks/use-toast';

const CalendarPage: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const { fetchEvents } = useCalendarEvents();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if we're coming from a completed study schedule setup
    const urlParams = new URLSearchParams(window.location.search);
    const fromSetup = urlParams.get('fromSetup');
    
    if (fromSetup === 'true') {
      toast({
        title: "Study Schedule Created",
        description: "Your personalized study schedule has been created and is ready to use.",
      });
      
      // Clean up the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);
  
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
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Calendar Info</h3>
                  <p className="mt-1 text-xs text-blue-700">
                    Your calendar events will be stored locally in your browser if database access is unavailable.
                    This ensures your study schedule is always accessible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <SimpleStudyScheduler />
            </CardContent>
          </Card>
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
