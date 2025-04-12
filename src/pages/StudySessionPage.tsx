
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ThumbsUp, Clock, BookOpen, GraduationCap, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import PomodoroTimer from '@/components/PomodoroTimer';
import { toast } from '@/components/ui/use-toast';

// Define Athro characters with their correct subjects and avatars
const athroCharacters = {
  Mathematics: { 
    name: 'AthroMaths', 
    avatar: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png',
    topics: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Probability', 'Number Theory', 'Graphs']
  },
  Science: { 
    name: 'AthroScience', 
    avatar: '/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png',
    topics: ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Ecology', 'Astronomy', 'Genetics', 'Laboratory Skills']
  },
  History: { 
    name: 'AthroHistory', 
    avatar: '/lovable-uploads/8b64684a-b978-4763-8cfb-a80b2ce305d4.png',
    topics: ['World Wars', 'Ancient Civilizations', 'Medieval History', 'Industrial Revolution', 'Cold War', 'Political History', 'Cultural History', 'Economic History']
  },
  English: { 
    name: 'AthroEnglish', 
    avatar: '/lovable-uploads/66f5e352-aee3-488f-bcdf-d8a5ab685360.png',
    topics: ['Literature', 'Poetry', 'Creative Writing', 'Grammar', 'Essay Writing', 'Text Analysis', 'Shakespeare', 'Modern Fiction']
  }
};

const StudySessionPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { 
      text: "Hello there! I'm your comprehensive GCSE study mentor. How can I help you with your studies today?", 
      sender: 'athro',
      avatar: '/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png'
    },
  ]);
  
  const [showOptions, setShowOptions] = useState(true);
  const [activeSession, setActiveSession] = useState<'ai' | 'manual' | 'past-paper' | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedPaper, setSelectedPaper] = useState<string>('');
  const [currentSubject, setCurrentSubject] = useState<string>('Mathematics');
  const [currentAthro, setCurrentAthro] = useState(athroCharacters.Mathematics);
  const [showPomodoroTimer, setShowPomodoroTimer] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add the user message to the chat
      setMessages([...messages, { text: message, sender: 'user', avatar: '' }]);
      
      // Simulate Athro response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: `I'm here to help with your ${currentSubject} questions! Let me know what specific topic you'd like to explore or what problems you're facing.`,
          sender: 'athro',
          avatar: currentAthro.avatar
        }]);
      }, 1000);
      
      setMessage('');
    }
  };

  const changeSubject = (subject: string) => {
    setCurrentSubject(subject);
    setCurrentAthro(athroCharacters[subject as keyof typeof athroCharacters]);
    
    // Update the messages to reflect the new Athro
    setMessages([
      { 
        text: `Hello! I'm ${athroCharacters[subject as keyof typeof athroCharacters].name}, your ${subject} mentor. How can I help you today?`, 
        sender: 'athro',
        avatar: athroCharacters[subject as keyof typeof athroCharacters].avatar
      },
    ]);
    
    // Reset session state
    setShowOptions(true);
    setActiveSession(null);
    setSelectedTopic('');
    setSelectedPaper('');
  };

  const startAISession = () => {
    setShowOptions(false);
    setActiveSession('ai');
    setMessages([
      ...messages,
      {
        text: `What would you like help with in ${currentSubject} today? I'm here to answer any questions about your studies.`,
        sender: 'athro',
        avatar: currentAthro.avatar
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
        avatar: currentAthro.avatar
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
        avatar: currentAthro.avatar
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
          avatar: currentAthro.avatar
        }
      ]);
    }
  };

  const handlePomodoroComplete = () => {
    toast({
      title: "Pomodoro Session Complete",
      description: "Great job! Time for a break.",
      duration: 5000,
    });
  };

  // Get the current Athro's topics
  const currentTopics = currentAthro.topics;

  // Generate past paper names based on the current subject
  const pastPapers = [
    `${currentSubject} Unit 1 - Autumn 2022`,
    `${currentSubject} Unit 2 - Summer 2022`,
    `${currentSubject} Unit 1 - Summer 2021`,
    `${currentSubject} Unit 2 - Autumn 2021`
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
                      src={currentAthro.avatar} 
                      alt={currentAthro.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{currentAthro.name}</h3>
                    <p className="text-sm text-gray-500">{currentSubject} Mentor</p>
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
                       currentSubject}
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
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50"
                      onClick={() => setShowPomodoroTimer(!showPomodoroTimer)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {showPomodoroTimer ? "Hide Pomodoro Timer" : "Start Pomodoro Timer"}
                    </Button>
                  </div>

                  {showPomodoroTimer && (
                    <div className="pt-2">
                      <PomodoroTimer onComplete={handlePomodoroComplete} />
                    </div>
                  )}

                  {/* Subject Selector */}
                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Change Subject:</h4>
                    <Select onValueChange={changeSubject} value={currentSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(athroCharacters).map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      src={currentAthro.avatar} 
                      alt={currentAthro.name} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Study Session</CardTitle>
                    <p className="text-sm text-gray-500">with {currentAthro.name}</p>
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
                            <span className="font-medium text-purple-700">{currentAthro.name}</span>
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
                      {currentTopics.map((topic) => (
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
