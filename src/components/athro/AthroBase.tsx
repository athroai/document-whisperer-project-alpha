
import React, { useEffect, useState } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroChat from './AthroChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AthroRouter from './AthroRouter';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreStatus } from '../ui/firestore-status';

interface AthroBaseProps {
  showTopicSelector?: boolean;
}

const AthroBase: React.FC<AthroBaseProps> = ({ showTopicSelector = false }) => {
  const { 
    activeCharacter, 
    messages, 
    sendMessage, 
    clearMessages, 
    currentScienceSubject, 
    setCurrentScienceSubject,
    firestoreStatus
  } = useAthro();
  const { state: authState } = useAuth();
  const [selectedTab, setSelectedTab] = useState('chat');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [showConfidencePrompt, setShowConfidencePrompt] = useState<boolean>(true);
  
  // Effect to check if we should show confidence prompt (only on initial load)
  useEffect(() => {
    // Check if this is a fresh session start (1 message means just the welcome)
    if (activeCharacter && messages.length <= 1 && showConfidencePrompt) {
      // After a delay, send the confidence question
      const timer = setTimeout(() => {
        sendMessage(`On a scale of 1-10, how confident are you with ${activeCharacter.subject} today?`);
        setShowConfidencePrompt(false);
      }, 3000);
      
      // Clear the timer if component unmounts
      return () => clearTimeout(timer);
    }
  }, [activeCharacter, messages, sendMessage, showConfidencePrompt]);
  
  // Handle topic selection
  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    
    // Send a message to Athro about the selected topic
    const message = `Let's study the topic of ${topic}. Can you give me an introduction and some key points to understand?`;
    sendMessage(message);
  };
  
  // Handle Science section selection (Biology, Chemistry, Physics)
  const handleScienceSectionChange = (value: string) => {
    if (setCurrentScienceSubject) {
      setCurrentScienceSubject(value);
    }
  };
  
  // Handle message processing through AthroRouter
  const handleMessageResponse = (response: any) => {
    // The response is already added to the messages array in AthroContext
    console.log("Received response from AthroRouter:", response);
  };
  
  // Render the appropriate subject selector based on active character
  const renderSubjectSelector = () => {
    // Only show if topic selector is enabled
    if (!showTopicSelector || !activeCharacter) return null;
    
    if (activeCharacter.subject === 'Science') {
      return (
        <div className="mb-4">
          <Label htmlFor="science-section" className="mb-2 block">Science Section</Label>
          <Select
            value={currentScienceSubject}
            onValueChange={handleScienceSectionChange}
          >
            <SelectTrigger id="science-section">
              <SelectValue placeholder="Select a science subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="biology">Biology</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }
    else if (activeCharacter.subject === 'Languages') {
      return <LanguageSelector className="mb-4" />;
    }
    
    // For other subjects, show topic selector
    return (
      <div className="mb-4">
        <Label htmlFor="topic-selector" className="mb-2 block">Select Topic</Label>
        <Select value={selectedTopic} onValueChange={handleTopicSelect}>
          <SelectTrigger id="topic-selector">
            <SelectValue placeholder="Select a topic" />
          </SelectTrigger>
          <SelectContent>
            {activeCharacter.topics?.map((topic, index) => (
              <SelectItem key={index} value={topic}>
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };
  
  // Only render AthroRouter when there's a message to process
  const shouldRenderRouter = message !== '';
  
  return (
    <Card className="h-full overflow-hidden border rounded-lg">
      <Tabs defaultValue="chat" value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="chat">Study Session</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chat" className="flex-grow flex flex-col overflow-hidden px-0 m-0">
          {firestoreStatus === 'error' || firestoreStatus === 'offline' ? (
            <div className="px-4">
              <FirestoreStatus status={firestoreStatus} />
            </div>
          ) : null}
          
          <AthroChat />
          
          {shouldRenderRouter && activeCharacter && (
            <AthroRouter
              character={activeCharacter}
              message={message}
              context={{ 
                subjectSection: currentScienceSubject,
                userId: authState.user?.id
              }}
              onResponse={(response) => {
                handleMessageResponse(response);
                setMessage('');
              }}
            />
          )}
        </TabsContent>
        
        <TabsContent value="topics" className="flex-grow overflow-auto p-4 m-0">
          {renderSubjectSelector()}
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg mb-2">Topic Overview</h3>
            <p className="text-muted-foreground">
              Select a topic from the dropdown above to explore it with {activeCharacter?.name || 'your Athro mentor'}.
            </p>
            
            {activeCharacter?.topics && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Available Topics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activeCharacter.topics.map((topic, index) => (
                    <div 
                      key={index}
                      className="p-2 bg-muted rounded border cursor-pointer hover:bg-muted/80"
                      onClick={() => handleTopicSelect(topic)}
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AthroBase;
