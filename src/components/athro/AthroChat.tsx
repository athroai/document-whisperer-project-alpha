import React, { useState, useRef, useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle, AlertCircle, FileText, Calendar, BookOpen, Globe, CloudOff, BookMarked, Pin } from 'lucide-react';
import { AthroMessage } from '@/types/athro';
import { ScrollArea } from '@/components/ui/scroll-area';
import AthroMathsRenderer from './AthroMathsRenderer';
import { markAnswer } from '@/services/markingEngine';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { assignmentService } from '@/services/assignmentService';
import { getStudySessionContext } from '@/utils/studySessionManager';

interface AthroChatProps {
  isCompactMode?: boolean;
}

const AthroChat: React.FC<AthroChatProps> = ({ isCompactMode = false }) => {
  const { 
    activeCharacter, 
    messages, 
    sendMessage, 
    isTyping, 
    currentScienceSubject,
    firestoreStatus 
  } = useAthro();
  const { state } = useAuth();
  const { t } = useTranslation();
  const [userMessage, setUserMessage] = useState<string>('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [markedMessageIds, setMarkedMessageIds] = useState<Set<string>>(new Set());
  const [markingInProgress, setMarkingInProgress] = useState<Set<string>>(new Set());
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [expandedCulturalNotes, setExpandedCulturalNotes] = useState<Set<string>>(new Set());
  const [expandedGrammarTips, setExpandedGrammarTips] = useState<Set<string>>(new Set());
  const [sessionContext, setSessionContext] = useState<any>(null);

  useEffect(() => {
    const context = getStudySessionContext();
    if (context) {
      setSessionContext(context);
    }
  }, []);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    if (state.user?.id && activeCharacter?.subject) {
      const fetchPendingAssignments = async () => {
        try {
          const assignments = await assignmentService.getAssignmentsForAthro(
            state.user!.id,
            activeCharacter.subject.toLowerCase()
          );
          setPendingAssignments(assignments);
        } catch (error) {
          console.error('Error fetching pending assignments:', error);
        }
      };
      
      fetchPendingAssignments();
    }
  }, [state.user?.id, activeCharacter?.subject]);

  const renderContextIndicator = () => {
    if (!sessionContext) return null;
    
    return (
      <Badge 
        className={`bg-${sessionContext.entryMode === 'assigned' ? 'amber' : 'blue'}-50 
                  text-${sessionContext.entryMode === 'assigned' ? 'amber' : 'blue'}-800 
                  border-${sessionContext.entryMode === 'assigned' ? 'amber' : 'blue'}-200 
                  flex items-center gap-1 ml-2`}
      >
        {sessionContext.entryMode === 'assigned' ? (
          <>
            <Pin className="h-3 w-3" />
            Assignment: {sessionContext.taskTitle || 'Task'}
          </>
        ) : (
          <>
            <BookMarked className="h-3 w-3" />
            Self-Study
          </>
        )}
      </Badge>
    );
  };

  const handleSendMessage = () => {
    if (!userMessage.trim() || !activeCharacter) return;
    
    console.log('Sending message to Athro:', userMessage);
    
    sendMessage(userMessage);
    setUserMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMarkMessage = async (message: AthroMessage, previousMessage?: AthroMessage) => {
    if (!activeCharacter || !state.user) return;
    
    if (markedMessageIds.has(message.id) || markingInProgress.has(message.id)) return;
    
    setMarkingInProgress(prev => new Set(prev).add(message.id));
    
    try {
      const prompt = previousMessage?.senderId !== 'user' 
        ? previousMessage?.content 
        : "Please respond to this question";
      
      const result = await markAnswer({
        prompt: prompt || "Study question",
        answer: message.content,
        subject: activeCharacter.subject.toLowerCase(),
        userId: state.user.id,
        sourceType: 'athro_chat'
      });
      
      setMarkedMessageIds(prev => new Set(prev).add(message.id));
      
      toast({
        title: "Answer marked",
        description: `Your answer has been marked with a score of ${result.aiMark.score}/${result.aiMark.outOf}.`,
      });
      
      sendMessage(`[Marking feedback: ${result.aiMark.comment}]`);
      
    } catch (error) {
      console.error('Error marking message:', error);
      toast({
        title: "Marking failed",
        description: "There was an error marking your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMarkingInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(message.id);
        return newSet;
      });
    }
  };

  const handleStartAssignment = (assignment: any) => {
    if (!activeCharacter) return;
    
    const message = `I'd like some help with my assignment on ${assignment.topic || assignment.subject}: "${assignment.title}". The instructions say: "${assignment.description}"`;
    
    sendMessage(message);
  };

  const toggleCulturalNote = (messageId: string) => {
    setExpandedCulturalNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const toggleGrammarTip = (messageId: string) => {
    setExpandedGrammarTips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const extractGrammarTip = (content: string) => {
    const grammarMatch = content.match(/Grammar (?:tip|note):\s*(.*?)(?:\n\n|\n$|$)/is);
    return grammarMatch ? grammarMatch[1] : null;
  };

  const extractCulturalNote = (content: string) => {
    const culturalMatch = content.match(/Cultural note:\s*(.*?)(?:\n\n|\n$|$)/is);
    return culturalMatch ? culturalMatch[1] : null;
  };

  const getLanguageLabel = () => {
    if (activeCharacter?.subject === 'Languages' && currentScienceSubject) {
      switch (currentScienceSubject) {
        case 'french':
          return <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">French 🇫🇷</Badge>;
        case 'german':
          return <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">German 🇩🇪</Badge>;
        case 'spanish':
          return <Badge className="ml-2 bg-red-100 text-red-800 border-red-200">Spanish 🇪🇸</Badge>;
        default:
          return null;
      }
    }
    return null;
  };

  if (!activeCharacter && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-4">
          <h3 className="font-medium mb-2">No Active Athro Selected</h3>
          <p className="text-muted-foreground">Choose a subject to begin studying</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 bg-background border-b flex items-center justify-between">
        <div className="flex items-center flex-wrap gap-1">
          <span className="text-sm font-medium">AthroChat</span>
          {getLanguageLabel()}
          {renderContextIndicator()}
        </div>
        {firestoreStatus === 'offline' && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 flex items-center gap-1">
            <CloudOff className="h-3 w-3" /> Offline Mode
          </Badge>
        )}
        {firestoreStatus === 'error' && (
          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Sync Error
          </Badge>
        )}
      </div>
      
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((msg: AthroMessage, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : undefined;
              const grammarTip = extractGrammarTip(msg.content);
              const culturalNote = extractCulturalNote(msg.content);
              
              return (
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
                          <AvatarImage src={activeCharacter?.avatarUrl} alt={activeCharacter?.name} />
                          <AvatarFallback>{activeCharacter?.name?.charAt(0) || 'A'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{activeCharacter?.name || 'Athro AI'}</span>
                      </div>
                    )}
                    
                    {msg.senderId !== 'user' && activeCharacter?.supportsMathNotation ? (
                      <AthroMathsRenderer content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                    
                    {msg.senderId !== 'user' && activeCharacter?.subject === 'Languages' && grammarTip && (
                      <div className="mt-4 pt-2 border-t border-gray-200">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-xs" 
                          onClick={() => toggleGrammarTip(msg.id)}
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          {expandedGrammarTips.has(msg.id) ? t('athro.hideGrammarTip') : t('athro.viewGrammarTip')}
                        </Button>
                        
                        {expandedGrammarTips.has(msg.id) && (
                          <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded text-sm">
                            <h5 className="font-medium mb-1">{t('athro.grammarTip')}</h5>
                            <p>{grammarTip}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {msg.senderId !== 'user' && activeCharacter?.subject === 'Languages' && culturalNote && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center text-xs" 
                          onClick={() => toggleCulturalNote(msg.id)}
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          {expandedCulturalNotes.has(msg.id) ? t('athro.hideCulturalNote') : t('athro.viewCulturalNote')}
                        </Button>
                        
                        {expandedCulturalNotes.has(msg.id) && (
                          <div className="mt-2 p-3 bg-amber-50 text-amber-800 rounded text-sm">
                            <h5 className="font-medium mb-1">{t('athro.culturalNote')}</h5>
                            <p>{culturalNote}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {msg.senderId === 'user' && state.user && !msg.content.startsWith('[') && (
                      <div className="mt-2 flex justify-end">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              disabled={markingInProgress.has(msg.id)}
                            >
                              {markedMessageIds.has(msg.id) ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                  Marked
                                </>
                              ) : markingInProgress.has(msg.id) ? (
                                <>
                                  <div className="h-3 w-3 border-2 border-t-transparent rounded-full animate-spin mr-1" />
                                  Marking...
                                </>
                              ) : (
                                "Send for marking"
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">Mark this answer?</h4>
                              <p className="text-sm text-muted-foreground">
                                This will send your answer for AI marking and feedback. The results will appear in your feedback section.
                              </p>
                              <div className="flex justify-end gap-2 mt-4">
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => handleMarkMessage(msg, previousMessage)}
                                >
                                  Send for marking
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                    
                    {msg.senderId !== 'user' && msg.referencedResources && msg.referencedResources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                          View referenced materials
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : activeCharacter && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                <div className="flex items-center mb-2">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={activeCharacter.avatarUrl} alt={activeCharacter.name} />
                    <AvatarFallback>{activeCharacter.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{activeCharacter.name}</span>
                </div>
                <div className="whitespace-pre-wrap">
                  {t('athro.welcomeMessage', { name: activeCharacter.name, subject: activeCharacter.subject })}
                </div>
              </div>
            </div>
          )}
          
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
      
      {pendingAssignments.length > 0 && (
        <div className="p-3 border-t bg-amber-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-amber-800">
              <FileText className="h-4 w-4 mr-1" />
              <span className="font-medium">Pending Assignments</span>
            </div>
            <Badge variant="outline" className="bg-amber-100 border-amber-200 text-amber-800">
              {pendingAssignments.length}
            </Badge>
          </div>
          <div className="space-y-1">
            {pendingAssignments.slice(0, 2).map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between rounded-md p-1.5 hover:bg-amber-100">
                <span className="text-sm truncate">{assignment.title}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs text-amber-800 hover:text-amber-900 hover:bg-amber-200"
                  onClick={() => handleStartAssignment(assignment)}
                >
                  Get Help
                </Button>
              </div>
            ))}
            {pendingAssignments.length > 2 && (
              <Button variant="link" size="sm" className="text-xs p-0 h-auto text-amber-800">
                View all {pendingAssignments.length} assignments
              </Button>
            )}
          </div>
        </div>
      )}
      
      <div className={`p-4 border-t ${isCompactMode ? 'bg-background' : ''}`}>
        <div className="flex space-x-2">
          <Textarea
            placeholder={t('athro.askQuestion', { name: activeCharacter?.name || 'Athro AI' })}
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px]"
          />
          <Button className="shrink-0" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
            <span className={isCompactMode ? 'sr-only' : 'ml-2'}>{t('common.submit')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AthroChat;
