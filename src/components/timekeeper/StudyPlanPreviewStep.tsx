
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Calendar, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { useStudyPlanGeneration } from '@/hooks/timekeeper/useStudyPlanGeneration';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const StudyPlanPreviewStep: React.FC = () => {
  const { updateOnboardingStep } = useOnboarding();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    isGenerating, 
    generationProgress, 
    sessions, 
    error, 
    generateStudyPlan 
  } = useStudyPlanGeneration();
  
  const [isProcessComplete, setIsProcessComplete] = useState(false);
  
  useEffect(() => {
    // Generate the study plan when the component mounts
    const initGeneration = async () => {
      const success = await generateStudyPlan();
      if (success) {
        setIsProcessComplete(true);
        toast({
          title: "Study Plan Generated",
          description: "Your personalized study schedule has been created!",
        });
      }
    };
    
    initGeneration();
  }, []);
  
  const handleBack = () => {
    updateOnboardingStep('availability');
  };
  
  const handleContinue = () => {
    // Mark onboarding as complete and redirect to calendar
    updateOnboardingStep('calendar');
    navigate('/calendar');
  };
  
  // Group sessions by date for calendar view
  const sessionsByDate = sessions.reduce((acc: {[key: string]: typeof sessions}, session) => {
    const dateKey = format(new Date(session.startTime), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {});
  
  const dates = Object.keys(sessionsByDate).sort();
  
  if (isGenerating) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Creating Your Study Plan</h2>
          <p className="text-muted-foreground mt-1">
            Just a moment while we craft a personalized schedule based on your subjects and availability.
          </p>
        </div>
        
        <div className="space-y-4 py-6">
          <Progress value={generationProgress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">
            {generationProgress < 30 && "Analyzing your subject preferences..."}
            {generationProgress >= 30 && generationProgress < 60 && "Calculating optimal study times..."}
            {generationProgress >= 60 && generationProgress < 90 && "Creating your calendar events..."}
            {generationProgress >= 90 && "Almost done..."}
          </p>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error generating study plan</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Availability
          </Button>
          <Button onClick={() => generateStudyPlan()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Your Personalized Study Plan</h2>
        <p className="text-muted-foreground mt-1">
          Here's your weekly schedule based on your subjects and availability. Review it before continuing.
        </p>
      </div>
      
      <div className="bg-green-50 p-4 rounded-md border border-green-200 flex items-start gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
        <div>
          <p className="text-green-800 font-medium">Your study plan is ready!</p>
          <p className="text-green-700 text-sm mt-1">
            We've created {sessions.length} study sessions across {dates.length} days, optimized for your subject confidence and availability.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4 mt-4">
          {dates.map(dateKey => {
            const sessionsForDate = sessionsByDate[dateKey];
            const dateObject = new Date(dateKey);
            const isToday = isSameDay(dateObject, new Date());
            
            return (
              <div key={dateKey} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">
                    {format(dateObject, 'EEEE, MMMM d')}
                  </h3>
                  {isToday && <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Today</Badge>}
                </div>
                
                <div className="grid gap-2">
                  {sessionsForDate.map(session => (
                    <Card key={session.id} className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{session.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            {session.formattedStartTime} - {session.formattedEndTime}
                          </div>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          {Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)} min
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-4">
          <div className="border rounded-md p-2 h-[400px] overflow-y-auto">
            <div className="grid gap-4">
              {dates.map(dateKey => {
                const dateObject = new Date(dateKey);
                return (
                  <div key={dateKey} className="border-b pb-2 last:border-b-0 last:pb-0">
                    <h3 className="font-medium text-sm mb-2 sticky top-0 bg-white p-2 border-b">
                      {format(dateObject, 'EEEE, MMMM d')}
                    </h3>
                    <div className="pl-2">
                      {sessionsByDate[dateKey].map(session => (
                        <div key={session.id} className="mb-2 relative pl-6 border-l-2 border-purple-300 py-1">
                          <div className="absolute left-[-5px] top-2 w-2 h-2 rounded-full bg-purple-500"></div>
                          <div className="text-xs text-gray-500">{session.formattedStartTime}</div>
                          <div className="font-medium">{session.subject}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-2">
            You'll see a full interactive calendar after you continue.
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Button onClick={handleContinue} disabled={!isProcessComplete} className="bg-purple-600 hover:bg-purple-700">
          <Calendar className="mr-2 h-4 w-4" /> Go to Calendar
        </Button>
      </div>
    </div>
  );
};
