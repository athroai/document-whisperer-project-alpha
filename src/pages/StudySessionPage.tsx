
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentFeedbackPanel from '@/components/dashboard/StudentFeedbackPanel';

const StudySessionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('session');

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Study Dashboard</h1>

      <Tabs defaultValue="session" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="session">Active Session</TabsTrigger>
          <TabsTrigger value="feedback">My Feedback</TabsTrigger>
          <TabsTrigger value="history">Study History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="session" className="mt-0">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Start a Study Session</h2>
            <p className="mb-6">Choose a subject and topic to begin studying with an Athro character.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Subject cards would go here */}
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors">
                <h3 className="font-medium text-lg mb-2">Mathematics</h3>
                <p className="text-sm text-gray-600">Study with AthroMaths</p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-100 cursor-pointer hover:bg-green-100 transition-colors">
                <h3 className="font-medium text-lg mb-2">Science</h3>
                <p className="text-sm text-gray-600">Study with AthroScience</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                <h3 className="font-medium text-lg mb-2">English</h3>
                <p className="text-sm text-gray-600">Study with AthroEnglish</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="feedback" className="mt-0">
          <StudentFeedbackPanel />
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Your Study History</h2>
            <p>Track your progress and review past study sessions.</p>
            
            {/* Study history content would go here */}
            <div className="mt-4 text-gray-500">
              Study history will be shown here.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudySessionPage;
