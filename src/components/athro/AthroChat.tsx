
import React, { useState, useRef, useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { AthroMessage } from '@/types/athro';
import { ScrollArea } from '@/components/ui/scroll-area';
import AthroMathsRenderer from './AthroMathsRenderer';
import { markAnswer } from '@/services/markingEngine';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface AthroChatProps {
  isCompactMode?: boolean;
}

const AthroChat: React.FC<AthroChatProps> = ({ isCompactMode = false }) => {
  const { activeCharacter, messages, sendMessage, isTyping } = useAthro();
  const { state } = useAuth();
  const [userMessage, setUserMessage] = useState<string>('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [markedMessageIds, setMarkedMessageIds] = useState<Set<string>>(new Set());
  const [markingInProgress, setMarkingInProgress] = useState<Set<string>>(new Set());
  
  // Auto-scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  const handleMarkMessage = async (message: AthroMessage, previousMessage?: AthroMessage) => {
    if (!activeCharacter || !state.user) return;
    
    // Don't mark if already marked or marking in progress
    if (markedMessageIds.has(message.id) || markingInProgress.has(message.id)) return;
    
    // Set marking in progress
    setMarkingInProgress(prev => new Set(prev).add(message.id));
    
    try {
      // Get the prompt from the previous AI message if available
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
      
      // Mark as complete
      setMarkedMessageIds(prev => new Set(prev).add(message.id));
      
      toast({
        title: "Answer marked",
        description: `Your answer has been marked with a score of ${result.aiMark.score}/${result.aiMark.outOf}.`,
      });
      
      // Send feedback as a new message
      sendMessage(`[Marking feedback: ${result.aiMark.comment}]`, activeCharacter.id);
      
    } catch (error) {
      console.error('Error marking message:', error);
      toast({
        title: "Marking failed",
        description: "There was an error marking your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Remove from in progress
      setMarkingInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(message.id);
        return newSet;
      });
    }
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
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.map((msg: AthroMessage, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            
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
                  
                  {/* Use math renderer for responses if needed */}
                  {msg.senderId !== 'user' && activeCharacter?.supportsMathNotation ? (
                    <AthroMathsRenderer content={msg.content} />
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
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
          })}
          
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
      
      <div className={`p-4 border-t ${isCompactMode ? 'bg-background' : ''}`}>
        <div className="flex space-x-2">
          <Textarea
            placeholder={`Ask ${activeCharacter?.name || 'Athro AI'} a question...`}
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px]"
          />
          <Button className="shrink-0" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
            <span className={isCompactMode ? 'sr-only' : 'ml-2'}>Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AthroChat;
