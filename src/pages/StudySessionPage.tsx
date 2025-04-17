import React, { useState, useCallback, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, ThumbsUp, Clock, BookOpen, GraduationCap, FileText } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import PomodoroTimer from '@/components/PomodoroTimer';
import { toast } from '@/hooks/use-toast';
import FileReference from '@/components/FileReference';
import { UploadedFile } from '@/types/auth';
import { AthroCharacter, AthroMessage, AthroSubject, ExamBoard } from '@/types/athro';
import { useAthroMessages } from '@/hooks/useAthroMessages';
import StudySessionManager from '@/components/study/StudySessionManager';
import StudySessionRecorder from '@/components/study/StudySessionRecorder';
import StudySessionLauncher from '@/components/calendar/StudySessionLauncher';
import { useSubjects } from '@/hooks/useSubjects';

// Import constants for study subjects
import { athroCharacters, getAthroBySubject } from '@/config/athrosConfig';

const StudySessionPage: React.FC = () => {
  const { messages, isTyping, sendMessage, clearMessages } = useAthroMessages();
  const [searchParams] = useSearchParams();
  const { subjects, isLoading: isSubjectsLoading } = useSubjects();
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPomodoroTimer, setShowPomodoroTimer] = useState(false);
  const [showFileReferences, setShowFileReferences] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  
  // Session state
  const [activeCharacter, setActiveCharacter] = useState<AthroCharacter | null>(null);
  const [currentSubject, setCurrentSubject] = useState<string>('Mathematics');
  const [currentTopic, setCurrentTopic] = useState<string | undefined>(undefined);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [confidenceBefore, setConfidenceBefore] = useState<number | undefined>(undefined);
  const [isFromCalendar, setIsFromCalendar] = useState(false);
  const [sessionWelcomeSent, setSessionWelcomeSent] = useState(false);
  
  const mockUserId = 'user_1';

  // Handle starting a session from URL parameters or calendar event
  const handleSessionStart = useCallback((character: AthroCharacter, sessionData: {
    sessionId?: string;
    subject: string;
    topic?: string;
    confidenceBefore?: number;
  }) => {
    setActiveCharacter(character);
    setCurrentSubject(sessionData.subject);
    setCurrentTopic(sessionData.topic);
    setSessionId(sessionData.sessionId);
    setConfidenceBefore(sessionData.confidenceBefore);
    setIsFromCalendar(!!sessionData.sessionId);
    
    // Clear any existing messages
    clearMessages();
    
    // We'll send the welcome message in the effect below
    setSessionWelcomeSent(false);
  }, [clearMessages]);

  // Send welcome message when a session starts
  useEffect(() => {
    if (activeCharacter && !sessionWelcomeSent) {
      const sendWelcomeMessage = async () => {
        try {
          const topicPhrase = currentTopic ? ` about ${currentTopic}` : '';
          let welcomeMessage = '';
          
          if (isFromCalendar) {
            welcomeMessage = `Hello! I'm ${activeCharacter.name}, your ${currentSubject} study mentor. I see we have a scheduled study session${topicPhrase} today. What would you like to focus on? We could start with:
  
1. A mini-quiz to test your knowledge
2. An explanation of key concepts${topicPhrase}
3. A walkthrough of example problems
  
Or let me know if you have something specific in mind!`;
          } else {
            welcomeMessage = `Hello! I'm ${activeCharacter.name}, your ${currentSubject} study mentor. How can I help you today${topicPhrase}? Would you like:

1. A mini-quiz to test your knowledge
2. An explanation of key concepts${topicPhrase}
3. A walkthrough of example problems

Or let me know if you have something else in mind!`;
          }
          
          // Use a placeholder user message to trigger a response
          await sendMessage("welcome", activeCharacter);
          
          // This is a hack to add our custom welcome message as if it came from the Athro
          const welcomeResponse: AthroMessage = {
            id: Date.now().toString(),
            senderId: activeCharacter.id,
            content: welcomeMessage,
            timestamp: new Date().toISOString()
          };
          
          // Add the welcome message directly to the messages array
          // This would normally be handled by the message hook but we want a custom message
          // In a real application, this should be done through the proper channels
          setTimeout(() => {
            const messageEvent = new CustomEvent('athro-message', { 
              detail: welcomeResponse 
            });
            document.dispatchEvent(messageEvent);
          }, 500);
          
          setSessionWelcomeSent(true);
        } catch (error) {
          console.error('Error sending welcome message:', error);
        }
      };
      
      sendWelcomeMessage();
    }
  }, [activeCharacter, sessionWelcomeSent, currentTopic, currentSubject, isFromCalendar, sendMessage]);

  const handleSendMessage = async () => {
    if (message.trim() && activeCharacter) {
      setIsLoading(true);
      
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
  
  const handleSessionEnd = () => {
    // Reset session state
    setSessionId(undefined);
    setIsFromCalendar(false);
    setSessionWelcomeSent(false);
    
    // Clear messages
    clearMessages();
    
    // Reset character to default
    const defaultCharacter = athroCharacters.find(char => char.subject === 'Mathematics');
    if (defaultCharacter) {
      setActiveCharacter(defaultCharacter as AthroCharacter);
      setCurrentSubject('Mathematics');
    }
    
    toast({
      title: "Session Ended",
      description: "Your study session has been completed.",
    });
  };

  const handleActions = {
    changeSubject: (subject: string) => {
      setCurrentSubject(subject);
      
      const characterForSubject = getAthroBySubject(subject);
      
      if (characterForSubject) {
        // Create the active character
        const activeChar: AthroCharacter = {
          ...characterForSubject,
          id: characterForSubject.id || subject.toLowerCase(),
        };
        
        setActiveCharacter(activeChar);
        
        // Clear messages for new subject
        clearMessages();
        setSessionWelcomeSent(false);
      }
    },
    
    handlePomodoroComplete: () => {
      toast({
        title: "Session Complete",
        description: "Time's up! Take a break and then continue studying.",
      });
    },
    
    handleFileSelect: (file: UploadedFile) => {
      setSelectedFile(file);
      setShowFileReferences(false);
    }
  };
  
  // Get the avatar URL for the current character
  const getAvatarUrl = () => {
    if (activeCharacter?.avatarUrl) {
      return activeCharacter.avatarUrl;
    }
    
    const characterInfo = getAthroBySubject(currentSubject);
    return characterInfo?.avatarUrl || '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png';
  };
  
  // Get the name for the current character
  const getCharacterName = () => {
    if (activeCharacter?.name) {
      return activeCharacter.name;
    }
    
    const characterInfo = getAthroBySubject(currentSubject);
    return characterInfo?.name || 'AthroAI';
  };

  // If we have subject data from useSubjects, use that, otherwise fall back to athroCharacters
  const availableSubjects = subjects.length > 0 
    ? subjects 
    : athroCharacters.map(char => char.subject);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Study Session Launcher - Invisible component that checks for calendar events */}
      <StudySessionLauncher />
      
      {/* Study Session Manager - Handles session initialization from URL parameters */}
      <StudySessionManager onSessionStart={handleSessionStart} />
      
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-4 mb-4">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 mr-3">
                    <img 
                      src={getAvatarUrl()} 
                      alt={getCharacterName()} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium mb-2">Change Subject:</h4>
                    <select 
                      value={currentSubject}
                      onChange={(e) => handleActions.changeSubject(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      disabled={isSubjectsLoading}
                    >
                      {isSubjectsLoading ? (
                        <option value="">Loading subjects...</option>
                      ) : availableSubjects.length > 0 ? (
                        availableSubjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))
                      ) : (
                        <option value="">No subjects available</option>
                      )}
                    </select>
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
                      src={getAvatarUrl()} 
                      alt={getCharacterName()} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{getCharacterName()}</h3>
                    <p className="text-sm text-gray-500">{currentSubject} Mentor</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Session time: {messages.length > 0 ? Math.floor(((new Date()).getTime() - new Date(messages[0].timestamp).getTime()) / 60000) : 0} minutes</span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Current topic:</h4>
                    <p className="text-sm text-gray-700">
                      {currentTopic || currentSubject}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Confidence level:</h4>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div 
                          className="bg-purple-600 h-2.5 rounded-full" 
                          style={{ width: `${(confidenceBefore || 5) * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{confidenceBefore || 5}/10</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    {/* Session Recorder Component */}
                    <StudySessionRecorder 
                      sessionId={sessionId}
                      subject={currentSubject}
                      topic={currentTopic}
                      messages={messages}
                      confidenceBefore={confidenceBefore}
                      onSessionEnd={handleSessionEnd}
                    />
                    
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
                      src={getAvatarUrl()} 
                      alt={getCharacterName()} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Study Session</CardTitle>
                    <p className="text-sm text-gray-500">with {getCharacterName()}</p>
                  </div>
                </div>
              </CardHeader>
              
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
                              src={getAvatarUrl()} 
                              alt="Athro Avatar" 
                              className="w-full h-full object-cover rounded-full" 
                            />
                          </div>
                          <span className="font-medium text-purple-700">{getCharacterName()}</span>
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
                            src={getAvatarUrl()} 
                            alt="Athro Avatar" 
                            className="w-full h-full object-cover rounded-full" 
                          />
                        </div>
                        <span className="font-medium text-purple-700">{getCharacterName()}</span>
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
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySessionPage;
