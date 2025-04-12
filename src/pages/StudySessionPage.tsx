
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ThumbsUp, Clock, BookOpen, GraduationCap, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const StudySessionPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { 
      text: "Hello there! I'm Athro AI, your comprehensive GCSE study mentor. How can I help you with your studies today?", 
      sender: 'athro',
      avatar: '/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png'
    },
  ]);
  
  const [showOptions, setShowOptions] = useState(true);
  const [activeSession, setActiveSession] = useState<'ai' | 'manual' | 'past-paper' | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedPaper, setSelectedPaper] = useState<string>('');

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add the user message to the chat
      setMessages([...messages, { text: message, sender: 'user', avatar: '' }]);
      
      // Simulate Athro response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "I'm here to help with your mathematics questions! Let me know what specific topic you'd like to explore or what problems you're facing.",
          sender: 'athro',
          avatar: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png'
        }]);
      }, 1000);
      
      setMessage('');
    }
  };

  const startAISession = () => {
    setShowOptions(false);
    setActiveSession('ai');
    setMessages([
      ...messages,
      {
        text: "What would you like help with today? I'm here to answer any questions about your studies.",
        sender: 'athro',
        avatar: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png'
      }
    ]);
  };

  const startManualSession = () => {
    setShowOptions(false);
    setActiveSession('manual');
  };

  const startPastPaperSession = () => {
    setShowOptions(false);
    setActiveSession('past-paper');
  };

  const handleTopicSelection = (topic: string) => {
    setSelectedTopic(topic);
    setMessages([
      ...messages,
      {
        text: `Let's review ${topic}. What specific aspect would you like to focus on?`,
        sender: 'athro',
        avatar: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png'
      }
    ]);
  };

  const handlePaperSelection = (paper: string) => {
    setSelectedPaper(paper);
    setMessages([
      ...messages,
      {
        text: `I've loaded ${paper}. Let's work through it together. Ask me about any question you find challenging.`,
        sender: 'athro',
        avatar: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png'
      }
    ]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setMessages([
        ...messages,
        {
          text: `I've received your file "${fileName}". Let's work through it together. What question would you like to start with?`,
          sender: 'athro',
          avatar: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png'
        }
      ]);
    }
  };

  const mathsTopics = [
    'Algebra', 'Geometry', 'Trigonometry', 'Calculus', 
    'Statistics', 'Probability', 'Number Theory', 'Graphs'
  ];

  const pastPapers = [
    'Maths Unit 1 - Autumn 2022',
    'Maths Unit 2 - Summer 2022',
    'Maths Unit 1 - Summer 2021',
    'Maths Unit 2 - Autumn 2021'
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 mr-3">
                    <img 
                      src="/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png" 
                      alt="Athro AI" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">Athro AI</h3>
                    <p className="text-sm text-gray-500">Study Mentor</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Session time: 12 minutes</span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Current topic:</h4>
                    <p className="text-sm text-gray-700">
                      {activeSession === 'manual' ? selectedTopic : 
                       activeSession === 'past-paper' ? selectedPaper : 
                       'Mathematics'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Confidence level:</h4>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">6.5/10</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Rate this session
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50">
                      <Clock className="mr-2 h-4 w-4" />
                      Start Pomodoro Timer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Chat */}
          <div className="md:col-span-3 flex flex-col h-[calc(100vh-8rem)]">
            <Card className="flex-grow flex flex-col overflow-hidden">
              <CardHeader className="border-b bg-white sticky top-0 z-10">
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3">
                    <img 
                      src="/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png" 
                      alt="Athro AI" 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Study Session</CardTitle>
                    <p className="text-sm text-gray-500">with Athro AI</p>
                  </div>
                </div>
              </CardHeader>
              
              {showOptions ? (
                <CardContent className="flex-grow flex items-center justify-center p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl">
                    <Button
                      onClick={startAISession}
                      className="h-auto py-12 flex flex-col bg-purple-600 hover:bg-purple-700"
                    >
                      <BookOpen className="h-16 w-16 mb-4" />
                      <span className="text-lg font-medium">AI-Powered Study Session</span>
                    </Button>
                    
                    <Button
                      onClick={startManualSession}
                      className="h-auto py-12 flex flex-col bg-blue-600 hover:bg-blue-700"
                    >
                      <GraduationCap className="h-16 w-16 mb-4" />
                      <span className="text-lg font-medium">Manual Topic Review</span>
                    </Button>
                    
                    <Button
                      onClick={startPastPaperSession}
                      className="h-auto py-12 flex flex-col bg-amber-500 hover:bg-amber-600"
                    >
                      <FileText className="h-16 w-16 mb-4" />
                      <span className="text-lg font-medium">Past Paper Practice</span>
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender === 'user' 
                            ? 'bg-purple-600 text-white ml-12' 
                            : 'bg-white border border-gray-200 mr-12'
                        }`}
                      >
                        {msg.sender === 'athro' && (
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 mr-2">
                              <img 
                                src={msg.avatar} 
                                alt="Athro Avatar" 
                                className="w-full h-full object-cover rounded-full" 
                              />
                            </div>
                            <span className="font-medium text-purple-700">Athro AI</span>
                          </div>
                        )}
                        <p className={`text-sm ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
              
              {/* Topic Selection Dialog for Manual Review */}
              {activeSession === 'manual' && !selectedTopic && (
                <Dialog open={true} onOpenChange={() => setShowOptions(true)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select a Topic to Review</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2 py-4">
                      {mathsTopics.map((topic) => (
                        <Button
                          key={topic}
                          variant="outline"
                          className="h-auto py-3 justify-start"
                          onClick={() => handleTopicSelection(topic)}
                        >
                          {topic}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {/* Past Paper Selection Dialog */}
              {activeSession === 'past-paper' && !selectedPaper && (
                <Dialog open={true} onOpenChange={() => setShowOptions(true)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select a Past Paper</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="paperSelect">Choose from available papers:</Label>
                        <Select onValueChange={handlePaperSelection}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a paper" />
                          </SelectTrigger>
                          <SelectContent>
                            {pastPapers.map((paper) => (
                              <SelectItem key={paper} value={paper}>
                                {paper}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fileUpload">Or upload your own:</Label>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label
                            htmlFor="fileUpload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <FileText className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                            </div>
                            <input 
                              id="fileUpload"
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                          </Label>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {/* Message Input (only show when not displaying options) */}
              {!showOptions && (
                <div className="border-t p-4 bg-white">
                  <div className="flex space-x-2">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask a question or start a discussion..."
                      className="flex-grow min-h-[60px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      className="h-auto bg-purple-600 hover:bg-purple-700"
                      onClick={handleSendMessage}
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send. Use Shift+Enter for a new line.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySessionPage;
