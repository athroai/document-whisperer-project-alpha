
import React from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroSelector from '@/components/athro/AthroSelector';
import AthroChat from '@/components/athro/AthroChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';

const AthroPage: React.FC = () => {
  const { activeCharacter } = useAthro();

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Athro AI Study Mentors</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AthroSelector />
          
            {activeCharacter && (
              <Card className="mt-6 p-4">
                <h3 className="font-medium mb-2">Current Progress</h3>
                <Tabs defaultValue="topics">
                  <TabsList className="w-full">
                    <TabsTrigger value="topics" className="flex-1">Topics</TabsTrigger>
                    <TabsTrigger value="confidence" className="flex-1">Confidence</TabsTrigger>
                    <TabsTrigger value="quizzes" className="flex-1">Quizzes</TabsTrigger>
                  </TabsList>
                  <TabsContent value="topics" className="mt-4">
                    <ul className="space-y-2">
                      {activeCharacter.topics.map((topic) => (
                        <li key={topic} className="text-sm">• {topic}</li>
                      ))}
                    </ul>
                  </TabsContent>
                  <TabsContent value="confidence" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Your confidence in {activeCharacter.subject}:</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-xs text-right mt-1">6.5/10</p>
                  </TabsContent>
                  <TabsContent value="quizzes" className="mt-4">
                    <p className="text-sm text-muted-foreground">Recent quiz scores:</p>
                    <ul className="space-y-2 mt-2">
                      <li className="text-sm flex justify-between">Algebra <span>80%</span></li>
                      <li className="text-sm flex justify-between">Geometry <span>65%</span></li>
                      <li className="text-sm flex justify-between">Statistics <span>75%</span></li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </Card>
            )}
          </div>
          
          <div className="lg:col-span-2">
            <AthroChat />
          </div>
        </div>
      </main>
    </>
  );
};

export default AthroPage;
