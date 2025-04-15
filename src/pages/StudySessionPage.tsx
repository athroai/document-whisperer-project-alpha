
import React, { useState, useCallback, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Send, ThumbsUp, Clock, BookOpen, GraduationCap, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLocation, useSearchParams } from 'react-router-dom';
import PomodoroTimer from '@/components/PomodoroTimer';
import { toast } from '@/hooks/use-toast';
import FileReference from '@/components/FileReference';
import { UploadedFile } from '@/types/auth';
import { getOpenAIResponse } from '@/lib/openai';
import { buildSystemPrompt } from '@/utils/athroPrompts';
import { AthroCharacter, AthroSubject, ExamBoard } from '@/types/athro';
import { pastPapers, PastPaper } from '@/data/athro-maths/past-papers';
import { useAthroMessages } from '@/hooks/useAthroMessages';

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
  },
  Geography: {
    name: 'AthroGeography',
    avatar: '/lovable-uploads/8b64684a-b978-4763-8cfb-a80b2ce305d4.png',
    topics: ['Physical Geography', 'Human Geography', 'Environmental Challenges', 'Map Skills', 'Fieldwork', 'Ecosystems', 'Settlements', 'Development'],
    fullDescription: 'AthroGeography helps you understand physical and human geography concepts, supporting you with case studies and geographical skills.',
    tone: 'exploratory, analytical, environmentally conscious'
  },
  Welsh: {
    name: 'AthroWelsh',
    avatar: '/lovable-uploads/66f5e352-aee3-488f-bcdf-d8a5ab685360.png',
    topics: ['Reading', 'Writing', 'Speaking', 'Listening', 'Grammar', 'Literature', 'Cultural Context', 'Vocabulary'],
    fullDescription: 'AthroWelsh helps you develop reading, writing and speaking skills in Welsh, covering both first and second language curricula.',
    tone: 'friendly, patient, encouraging of language exploration'
  },
  Languages: {
    name: 'AthroLanguages',
    avatar: '/lovable-uploads/66f5e352-aee3-488f-bcdf-d8a5ab685360.png',
    topics: ['French', 'Spanish', 'German', 'Grammar', 'Vocabulary', 'Reading', 'Writing', 'Speaking', 'Listening'],
    fullDescription: 'AthroLanguages helps you develop your skills in French, Spanish, and German for GCSE exams.',
    tone: 'encouraging, pronunciation-focused, culturally aware'
  },
  'Religious Education': {
    name: 'AthroRE',
    avatar: '/lovable-uploads/8b64684a-b978-4763-8cfb-a80b2ce305d4.png',
    topics: ['Christianity', 'Islam', 'Judaism', 'Hinduism', 'Buddhism', 'Ethics', 'Philosophy', 'Religious Texts'],
    fullDescription: 'AthroRE helps you explore religious beliefs, teachings and practices, ethical themes, and philosophical questions.',
    tone: 'respectful, balanced, thoughtful, encouraging of critical thinking'
  },
  AthroAI: {
    name: 'AthroAI',
    avatar: '/lovable-uploads/e4274c9e-f66c-4933-9c0b-79f6c222c31b.png',
    topics: ['Study Skills', 'Exam Preparation', 'Memory Techniques', 'Note-taking', 'Critical Thinking', 'Research', 'Time Management', 'Academic Writing'],
    fullDescription: 'AthroAI is your all-purpose study companion who can help with any subject and general study skills.',
    tone: 'helpful, knowledgeable, encouraging'
  },
  Timekeeper: {
    name: 'Timekeeper',
    avatar: '/lovable-uploads/a2640d0a-113f-4f37-9120-5533af965b5d.png',
    topics: ['Time Management', 'Pomodoro Technique', 'Study Scheduling', 'Habit Formation', 'Task Prioritization', 'Deadline Management', 'Break Planning', 'Focus Techniques'],
    fullDescription: 'Timekeeper helps you plan your revision timetable, manage Pomodoro study sessions, and track your study progress.',
    tone: 'organized, motivating, disciplined'
  },
  System: {
    name: 'SystemBrain',
    avatar: '/lovable-uploads/e4274c9e-f66c-4933-9c0b-79f6c222c31b.png',
    topics: ['Settings', 'Notifications', 'Feedback', 'Account Management', 'System Updates', 'Data Management', 'Privacy', 'Help & Support'],
    fullDescription: 'SystemBrain manages your app settings, notification preferences, and helps you provide feedback on your study experience.',
    tone: 'professional, efficient, helpful'
  }
};

const StudySessionPage: React.FC = () => {
  const { messages, isTyping, sendMessage, clearMessages, hasApiKey } = useAthroMessages();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [message, setMessage] = useState('');
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

  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    if (subjectParam) {
      const formattedSubject = subjectParam.charAt(0).toUpperCase() + subjectParam.slice(1).replace(/-/g, ' ');
      
      for (const [subject, details] of Object.entries(athroCharacters)) {
        if (subject.toLowerCase() === formattedSubject.toLowerCase() || 
            details.name.toLowerCase() === formattedSubject.toLowerCase()) {
          handleActions.changeSubject(subject);
          console.log(`Subject set from URL parameter: ${subject}`);
          break;
        }
      }
    }
  }, [searchParams]);

  const currentTopics = currentAthro?.topics || [];
  const paperList = pastPapers.map(paper => paper.title);
  const mockUserId = 'user_1';

  const handleActions = {
    changeSubject: (subject: string) => {
      setCurrentSubject(subject);
      setCurrentAthro(athroCharacters[subject as keyof typeof athroCharacters]);
      
      clearMessages();
      
      const activeCharacter: AthroCharacter = {
        id: subject.toLowerCase(),
        name: athroCharacters[subject as keyof typeof athroCharacters].name,
        subject: subject as AthroSubject,
        topics: athroCharacters[subject as keyof typeof athroCharacters].topics,
        examBoards: ['wjec', 'aqa', 'ocr'],
        supportsMathNotation: subject === 'Mathematics' || subject === 'Science',
        avatarUrl: athroCharacters[subject as keyof typeof athroCharacters].avatar,
        shortDescription: `Your ${subject} study mentor`,
        fullDescription: athroCharacters[subject as keyof typeof athroCharacters].fullDescription,
        tone: athroCharacters[subject as keyof typeof athroCharacters].tone
      };
      
      setShowOptions(true);
      setActiveSession(null);
      setSelectedTopic('');
      setSelectedPaper('');
    },

    startAISession: () => {
      setShowOptions(false);
      setActiveSession('ai');
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
    },

    continueWithoutTopic: () => {
    },

    handleModalClose: () => {
      setActiveSession(null);
    },

    handlePaperSelection: (paper: string) => {
      setSelectedPaper(paper);
    },

    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const fileName = e.target.files[0].name;
      }
    },

    handleFileSelect: (file: UploadedFile) => {
      setSelectedFile(file);
      setShowFileReferences(false);
    },
    
    handlePomodoroComplete: () => {
      toast({
        title: "Session Complete",
        description: "Time's up! Take a break and then continue studying.",
      });
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      setIsLoading(true);
      
      const activeCharacter: AthroCharacter = {
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
      
      try {
        await sendMessage(message, activeCharacter);
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsLoading(false);
        setMessage('');
      }
    }
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
                      className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.senderId === 'user' 
                            ? 'bg-purple-600 text-white ml-12' 
                            : 'bg-white border border-gray-200 mr-12'
                        }`}
                      >
                        {msg.senderId !== 'user' && (
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
                        )}
                        <p className={`text-sm ${msg.senderId === 'user' ? 'text-white' : 'text-gray-800'}`}>
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
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
                            {paperList.map((paper) => (
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
