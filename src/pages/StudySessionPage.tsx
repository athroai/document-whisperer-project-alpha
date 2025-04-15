import React, { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Send, ThumbsUp, Clock, BookOpen, GraduationCap, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import PomodoroTimer from '@/components/PomodoroTimer';
import { toast } from '@/hooks/use-toast';
import FileReference from '@/components/FileReference';
import { UploadedFile } from '@/types/auth';
import { getOpenAIResponse } from '@/lib/openai';
import { buildSystemPrompt } from '@/utils/athroPrompts';
import { AthroCharacter, AthroSubject, ExamBoard } from '@/types/athro';

// Character data - moved outside component to avoid recreation on re-renders
const athroCharacters = {
  Mathematics: { 
    name: 'AthroMaths', 
    avatar: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png',
    topics: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Probability', 'Number Theory', 'Graphs'],
    fullDescription: 'AthroMaths helps you tackle all aspects of GCSE Mathematics, from algebra to statistics, with step-by-step explanations and practice problems.',
    tone: 'logical, precise, encouraging, and patient'
  },
  Science: { 
    name: 'AthroScience', 
    avatar: '/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png',
    topics: ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Ecology', 'Astronomy', 'Genetics', 'Laboratory Skills'],
    fullDescription: 'AthroScience guides you through Biology, Chemistry, and Physics concepts with clear explanations and practical examples.',
    tone: 'curious, analytical, enthusiastic about discovery'
  },
  History: { 
    name: 'AthroHistory', 
    avatar: '/lovable-uploads/8b64684a-b978-4763-8cfb-a80b2ce305d4.png',
    topics: ['World Wars', 'Ancient Civilizations', 'Medieval History', 'Industrial Revolution', 'Cold War', 'Political History', 'Cultural History', 'Economic History'],
    fullDescription: 'AthroHistory helps you understand key historical events, figures, and their impact, while developing analytical skills for GCSE History.',
    tone: 'informative, contextual, balanced in perspective'
  },
  English: { 
    name: 'AthroEnglish', 
    avatar: '/lovable-uploads/66f5e352-aee3-488f-bcdf-d8a5ab685360.png',
    topics: ['Literature', 'Poetry', 'Creative Writing', 'Grammar', 'Essay Writing', 'Text Analysis', 'Shakespeare', 'Modern Fiction'],
    fullDescription: 'AthroEnglish helps you analyze texts, improve your writing, and develop critical thinking skills for GCSE English.',
    tone: 'articulate, expressive, encouraging of creative and critical thinking'
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [activeSession, setActiveSession] = useState<'ai' | 'manual' | 'past-paper' | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedPaper, setSelectedPaper] = useState<string>('');
  const [currentSubject, setCurrentSubject] = useState<string>('Mathematics');
  const [currentAthro, setCurrentAthro] = useState(athroCharacters.Mathematics);
  const [showPomodoroTimer, setShowPomodoroTimer] = useState(false);
  const [showFileReferences, setShowFileReferences] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [hasShownFallback, setHasShownFallback] = useState(false);

  const mockUserId = 'user_1';

  const handleActions = {
    changeSubject: (subject: string) => {
      setCurrentSubject(subject);
      setCurrentAthro(athroCharacters[subject as keyof typeof athroCharacters]);
      
      setMessages([
        { 
          text: `Hello! I'm ${athroCharacters[subject as keyof typeof athroCharacters].name}, your ${subject} mentor. How can I help you today?`, 
          sender: 'athro',
          avatar: athroCharacters[subject as keyof typeof athroCharacters].avatar
        },
      ]);
      
      setShowOptions(true);
      setActiveSession(null);
      setSelectedTopic('');
      setSelectedPaper('');
      setHasShownFallback(false);
    },

    startAISession: () => {
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
    },

    startManualSession: () => {
      setShowOptions(false);
      setActiveSession('manual');
    },

    startPastPaperSession: () => {
      setShowOptions(false);
      setActiveSession('past-paper');
    },

    handleTopicSelection: (topic: string) => {
      setSelectedTopic(topic);
      setMessages([
        ...messages,
        {
          text: `Let's review ${topic}. What specific aspect would you like to focus on?`,
          sender: 'athro',
          avatar: currentAthro.avatar
        }
      ]);
    },

    continueWithoutTopic: () => {
      setMessages([
        ...messages,
        {
          text: `What would you like to learn about in ${currentSubject} today? I'm here to help with any questions you might have.`,
          sender: 'athro',
          avatar: currentAthro.avatar
        }
      ]);
    },

    handleModalClose: () => {
      setActiveSession(null);
      handleActions.continueWithoutTopic();
    },

    handlePaperSelection: (paper: string) => {
      setSelectedPaper(paper);
      setMessages([
        ...messages,
        {
          text: `I've loaded ${paper}. Let's work through it together. Ask me about any question you find challenging.`,
          sender: 'athro',
          avatar: currentAthro.avatar
        }
      ]);
    },

    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },

    handleFileSelect: (file: UploadedFile) => {
      setSelectedFile(file);
      setShowFileReferences(false);
      
      const fileReference = file.label 
        ? `your ${file.label}` 
        : `the ${file.subject} ${file.fileType === 'paper' ? 'past paper' : file.fileType}`;
      
      setMessages(prev => [...prev, {
        text: `Let's take a look at ${fileReference}. What specific part would you like to focus on?`,
        sender: 'athro',
        avatar: currentAthro.avatar
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      // Add user message to the chat
      setMessages([...messages, { text: message, sender: 'user', avatar: '' }]);
      
      // Start loading state
      setIsLoading(true);
      
      try {
        // Create a complete character object
        const character: AthroCharacter = {
          id: currentSubject.toLowerCase(),
          name: currentAthro.name,
          subject: currentSubject as AthroSubject,
          topics: currentAthro.topics,
          examBoards: ['wjec', 'aqa', 'ocr'],
          supportsMathNotation: currentSubject === 'Mathematics' || currentSubject === 'Science',
          avatarUrl: currentAthro.avatar,
          shortDescription: `Your ${currentSubject} study mentor`,
          fullDescription: currentAthro.fullDescription,
          tone: currentAthro.tone
        };

        // Build system prompt for the current character
        const systemPrompt = buildSystemPrompt(character);
        console.log('🔍 Using system prompt for:', character.name);
        
        let response;
        
        // Use a demo key for development/testing
        const openAIApiKey = "sk-demo-12345678901234567890";
        
        // Check if we're in development or using a demo key
        if (process.env.NODE_ENV === 'development' || openAIApiKey.includes('demo')) {
          console.log('🧪 Using mock response for main chat interface');
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate a subject-specific response
          response = generateSubjectResponse(message, currentSubject);
        } else {
          // Make a real API call if we have a proper key
          response = await getOpenAIResponse({
            systemPrompt,
            userMessage: message,
            apiKey: openAIApiKey
          });
        }
        
        // Add AI response to the chat
        setMessages(prev => [...prev, {
          text: response,
          sender: 'athro',
          avatar: currentAthro.avatar
        }]);
        
        // Show file references randomly (for demo)
        if (Math.random() > 0.5) {
          setShowFileReferences(true);
        }
        
      } catch (error) {
        console.error('Error getting response:', error);
        
        // Show error message
        toast({
          title: "Connection Error",
          description: "Failed to get a response. Please try again.",
          variant: "destructive",
        });
        
        // Add error message to chat
        setMessages(prev => [...prev, {
          text: "I'm having trouble connecting right now. Could you try again in a moment?",
          sender: 'athro',
          avatar: currentAthro.avatar
        }]);
      } finally {
        // Stop loading state
        setIsLoading(false);
        // Clear input field
        setMessage('');
      }
    }
  };

  const generateSubjectResponse = (userMessage: string, subject: string) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (subject === 'Science' && lowerCaseMessage.includes('atom')) {
      return "An atom is the basic unit of a chemical element. It's made up of a nucleus containing protons and neutrons, with electrons orbiting around it. Would you like me to explain more about atomic structure?";
    } 
    else if (subject === 'Mathematics' && (lowerCaseMessage.includes('equation') || lowerCaseMessage.includes('solve'))) {
      return "I'd be happy to help you solve that equation. Let's work through it step by step. First, we need to identify the variables and constants...";
    }
    else if (subject === 'History' && lowerCaseMessage.includes('war')) {
      return "Wars have shaped much of human history. Which specific conflict are you interested in learning about? I can help with World Wars, Cold War, or many other historical conflicts.";
    }
    else if (subject === 'English' && (lowerCaseMessage.includes('essay') || lowerCaseMessage.includes('write'))) {
      return "For essay writing, it's important to start with a clear structure: introduction, body paragraphs, and conclusion. Would you like some specific tips on how to improve your essay writing?";
    }
    
    return `That's an interesting question about ${subject}. To help you better, could you tell me a bit more about what specific aspect of this topic you're studying? I'll do my best to provide a useful explanation.`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-4 mb-4">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 mr-3">
                    <img 
                      src={currentAthro.avatar} 
                      alt={currentAthro.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium mb-2">Change Subject:</h4>
                    <Select onValueChange={handleActions.changeSubject} value={currentSubject}>
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
                    <Button
                      variant="outline"
                      className="w-full justify-start text-purple-600 border-purple-200 hover:bg-purple-50"
                      onClick={() => setShowFileReferences(!showFileReferences)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {showFileReferences ? "Hide Study Materials" : "View Study Materials"}
                    </Button>
                  </div>

                  {showPomodoroTimer && (
                    <div className="pt-2">
                      <PomodoroTimer onComplete={handleActions.handlePomodoroComplete} />
                    </div>
                  )}

                  {showFileReferences && (
                    <FileReference 
                      userId={mockUserId} 
                      subject={currentSubject.toLowerCase()} 
                      onFileSelect={handleActions.handleFileSelect} 
                    />
                  )}

                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Change Subject:</h4>
                    <Select onValueChange={handleActions.changeSubject} value={currentSubject}>
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
                      onClick={handleActions.startAISession}
                      className="h-auto py-12 flex flex-col bg-purple-600 hover:bg-purple-700"
                    >
                      <BookOpen className="h-16 w-16 mb-4" />
                      <span className="text-lg font-medium">AI-Powered Study Session</span>
                    </Button>
                    
                    <Button
                      onClick={handleActions.startManualSession}
                      className="h-auto py-12 flex flex-col bg-blue-600 hover:bg-blue-700"
                    >
                      <GraduationCap className="h-16 w-16 mb-4" />
                      <span className="text-lg font-medium">Manual Topic Review</span>
                    </Button>
                    
                    <Button
                      onClick={handleActions.startPastPaperSession}
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
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-white border border-gray-200 mr-12">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 mr-2">
                            <img 
                              src={currentAthro.avatar} 
                              alt="Athro Avatar" 
                              className="w-full h-full object-cover rounded-full" 
                            />
                          </div>
                          <span className="font-medium text-purple-700">{currentAthro.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
              
              {activeSession === 'manual' && !selectedTopic && (
                <Dialog open={true} onOpenChange={() => handleActions.handleModalClose()}>
                  <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                      <DialogTitle>Select a Topic in {currentSubject}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2 py-4">
                      {currentTopics.map((topic) => (
                        <Button
                          key={topic}
                          variant="outline"
                          className="h-auto py-3 justify-start"
                          onClick={() => {
                            handleActions.handleTopicSelection(topic);
                            setActiveSession(null);
                          }}
                        >
                          {topic}
                        </Button>
                      ))}
                    </div>
                    <div className="flex justify-center mt-4">
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          setActiveSession(null);
                          handleActions.continueWithoutTopic();
                        }}
                      >
                        Skip topic selection
                      </Button>
                    </div>
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none" 
                      onClick={handleActions.handleModalClose}
                    />
                  </DialogContent>
                </Dialog>
              )}
              
              {activeSession === 'past-paper' && !selectedPaper && (
                <Dialog open={true} onOpenChange={() => handleActions.handleModalClose()}>
                  <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                      <DialogTitle>Select a Past Paper</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="paperSelect">Choose from available papers:</Label>
                        <Select onValueChange={(paper) => {
                          handleActions.handlePaperSelection(paper);
                          setActiveSession(null);
                        }}>
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
                              onChange={(e) => {
                                handleActions.handleFileUpload(e);
                                setActiveSession(null);
                              }}
                            />
                          </Label>
                        </div>
                      </div>
                      
                      <div className="flex justify-center mt-4">
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            setActiveSession(null);
                            handleActions.continueWithoutTopic();
                          }}
                        >
                          Skip paper selection
                        </Button>
                      </div>
                    </div>
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none" 
                      onClick={handleActions.handleModalClose}
                    />
                  </DialogContent>
                </Dialog>
              )}
              
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
                      disabled={isLoading}
                    />
                    <Button 
                      className="h-auto bg-purple-600 hover:bg-purple-700"
                      onClick={handleSendMessage}
                      disabled={isLoading || !message.trim()}
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
