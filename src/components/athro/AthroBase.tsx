
import React, { useState, useRef, useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, RefreshCcw, Save, Share2, X } from 'lucide-react';
import { AthroMessage } from '@/types/athro';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';

interface AthroBaseProps {
  showTopicSelector?: boolean;
}

const AthroBase: React.FC<AthroBaseProps> = ({ showTopicSelector = true }) => {
  const { activeCharacter, messages, sendMessage, isTyping, studentProgress, getSuggestedTopics } = useAthro();
  const [userMessage, setUserMessage] = useState<string>('');
  const [showMarkScheme, setShowMarkScheme] = useState<boolean>(false);
  const [hasWelcomed, setHasWelcomed] = useState<boolean>(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>('chat');
  
  // Auto-scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send welcome message when component mounts and character is active
  useEffect(() => {
    const sendWelcomeMessage = async () => {
      if (!activeCharacter || hasWelcomed || messages.length > 0) {
        return;
      }
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'student';
        
        sendMessage(`Welcome ${userName}! I'm ${activeCharacter.name}. What would you like to study in ${activeCharacter.subject} today?`);
        setHasWelcomed(true);
      } catch (error) {
        console.error('Error generating welcome message:', error);
      }
    };
    
    sendWelcomeMessage();
  }, [activeCharacter, messages.length, sendMessage, hasWelcomed]);

  // Reset welcome state when character changes
  useEffect(() => {
    setHasWelcomed(false);
  }, [activeCharacter]);

  const handleSendMessage = () => {
    if (!userMessage.trim() || !activeCharacter) return;
    
    sendMessage(userMessage);
    setUserMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearSession = () => {
    // This will be implemented when we have session management
    toast({
      title: "Session cleared",
      description: "Your conversation has been reset.",
    });
  };

  const handleSaveProgress = () => {
    // This will be implemented when we have progress tracking
    toast({
      title: "Progress saved",
      description: "Your study progress has been saved.",
    });
  };

  const handleSendToTeacher = () => {
    // This will be implemented when we have teacher integration
    toast({
      title: "Sent to teacher",
      description: "Your conversation has been shared with your teacher.",
    });
  };

  if (!activeCharacter) {
    return <div>No Athro character selected. Please select a subject.</div>;
  }

  const suggestedTopics = activeCharacter ? getSuggestedTopics(activeCharacter.subject) : [];

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-grow flex flex-col h-full">
        <CardHeader className="border-b bg-white">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-2">
              <AvatarImage src={activeCharacter.avatarUrl} alt={activeCharacter.name} />
              <AvatarFallback>{activeCharacter.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{activeCharacter.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{activeCharacter.shortDescription}</p>
            </div>
          </div>
        </CardHeader>

        <Tabs defaultValue="chat" className="flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" onClick={() => setActiveTab('chat')}>Chat</TabsTrigger>
            <TabsTrigger value="resources" onClick={() => setActiveTab('resources')}>Resources</TabsTrigger>
            <TabsTrigger value="progress" onClick={() => setActiveTab('progress')}>Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-grow flex flex-col p-0">
            {showTopicSelector && suggestedTopics.length > 0 && (
              <div className="p-4 bg-slate-50 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Suggested Topics</h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedTopics.map((topic) => (
                    <Button 
                      key={topic} 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        sendMessage(`I'd like to study ${topic}`);
                      }}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <ScrollArea className="flex-grow p-4">
              <div className="space-y-4">
                {messages.map((msg: AthroMessage) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.senderId === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      {msg.senderId !== 'user' && (
                        <div className="flex items-center mb-2">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={activeCharacter.avatarUrl} alt={activeCharacter.name} />
                            <AvatarFallback>{activeCharacter.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{activeCharacter.name}</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      
                      {/* Mark scheme toggle will be implemented in the future */}
                      {msg.senderId !== 'user' && msg.referencedResources && msg.referencedResources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowMarkScheme(!showMarkScheme)}
                          >
                            {showMarkScheme ? 'Hide' : 'Show'} Mark Scheme
                          </Button>
                          {showMarkScheme && (
                            <div className="mt-2 p-2 bg-background rounded text-sm">
                              <p className="font-medium">Mark Scheme:</p>
                              <p>Example mark scheme content would appear here.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Textarea
                  placeholder={`Ask ${activeCharacter.name} a question...`}
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px]"
                />
                <Button className="shrink-0" onClick={handleSendMessage}>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="flex-grow p-4">
            <h3 className="font-medium mb-4">Study Resources</h3>
            <p className="text-muted-foreground">Your {activeCharacter.subject} resources will appear here.</p>
            
            <div className="mt-4 space-y-2">
              <Card className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Past Paper - Summer 2022</h4>
                    <p className="text-sm text-muted-foreground">{activeCharacter.examBoards[0]?.toUpperCase()}</p>
                  </div>
                  <Button variant="outline" size="sm">Open</Button>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Topic Notes - Algebra</h4>
                    <p className="text-sm text-muted-foreground">Last updated: 2 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">Open</Button>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="flex-grow p-4">
            <h3 className="font-medium mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Topic Confidence</h4>
                <div className="space-y-2">
                  {activeCharacter.topics.slice(0, 4).map((topic) => {
                    const confidenceScore = studentProgress[activeCharacter.subject]?.confidenceScores[topic] || 5;
                    return (
                      <div key={topic} className="flex items-center">
                        <span className="w-24 text-sm">{topic}</span>
                        <div className="flex-grow mx-2 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${confidenceScore * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{confidenceScore}/10</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Quizzes</h4>
                <div className="space-y-2">
                  {studentProgress[activeCharacter.subject]?.quizScores.map((quiz) => (
                    <div key={quiz.topic + quiz.date} className="flex items-center justify-between">
                      <span className="text-sm">{quiz.topic}</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${quiz.score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{quiz.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
      
      {activeTab === 'chat' && (
        <div className="flex justify-between mt-4">
          <Button variant="outline" size="sm" onClick={handleClearSession}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Clear Session
          </Button>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={handleSaveProgress}>
              <Save className="mr-2 h-4 w-4" />
              Save Progress
            </Button>
            <Button variant="outline" size="sm" onClick={handleSendToTeacher}>
              <Share2 className="mr-2 h-4 w-4" />
              Send to Teacher
            </Button>
            <Button variant="default" size="sm">
              Exit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthroBase;
