
import React, { useState } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AthroSelector from '@/components/athro/AthroSelector';
import AthroChat from '@/components/athro/AthroChat';
import { AthroSubject } from '@/types/athro';

const AthroPage: React.FC = () => {
  const { activeCharacter, startSession } = useAthro();
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [sessionStarted, setSessionStarted] = useState<boolean>(false);

  const handleStartSession = () => {
    if (!activeCharacter) return;
    
    startSession(
      activeCharacter.id,
      activeCharacter.subject,
      selectedTopic || undefined
    );
    
    setSessionStarted(true);
    setActiveTab('chat');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Character selection sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-full p-4">
            <AthroSelector />
            
            {activeCharacter && !sessionStarted && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Start a Study Session</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select a topic (optional):
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">Any topic</option>
                    {activeCharacter.topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleStartSession}
                  className="w-full rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                >
                  Start Session with {activeCharacter.name}
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-12rem)] overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <div className="border-b px-4">
                <TabsList className="w-fit">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="chat" className="flex-1 overflow-hidden">
                <AthroChat />
              </TabsContent>
              
              <TabsContent value="resources">
                <div className="p-6">
                  <h2 className="text-xl font-bold">Study Resources</h2>
                  <p className="text-muted-foreground">
                    {activeCharacter
                      ? `View and manage your ${activeCharacter.subject} study materials`
                      : 'Select a character to view subject-specific resources'}
                  </p>
                  
                  {/* This would be replaced with actual resource management UI */}
                  <div className="mt-4 rounded-lg border border-dashed p-8 text-center">
                    <p>No resources uploaded yet</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="p-6">
                  <h2 className="text-xl font-bold">Study History</h2>
                  <p className="text-muted-foreground">
                    View your past study sessions and progress
                  </p>
                  
                  {/* This would be replaced with actual history UI */}
                  <div className="mt-4 rounded-lg border border-dashed p-8 text-center">
                    <p>No previous sessions found</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AthroPage;
