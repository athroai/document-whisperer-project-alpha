
import React, { useState, useRef, useEffect } from 'react';
import { Send, PaperclipIcon, BookOpen, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAthro } from '@/contexts/AthroContext';
import { AthroMessage } from '@/types/athro';
import { toast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AthroChatProps {
  showResourcesButton?: boolean;
  showConfidenceCheck?: boolean;
}

const AthroChat: React.FC<AthroChatProps> = ({
  showResourcesButton = true,
  showConfidenceCheck = true
}) => {
  const { 
    activeCharacter, 
    messages, 
    addMessage, 
    isLoading,
    resources,
    studentPerformance
  } = useAthro();
  
  const [inputValue, setInputValue] = useState('');
  const [confidenceValue, setConfidenceValue] = useState<number | null>(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    addMessage({
      senderId: 'user',
      content: inputValue,
    });
    
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConfidenceSubmit = (value: number) => {
    setConfidenceValue(value);
    toast({
      title: "Confidence recorded",
      description: `Your confidence level of ${value}/10 has been saved.`
    });
    
    addMessage({
      senderId: 'user',
      content: `My confidence in this topic is ${value}/10.`,
      confidence: value
    });
  };

  const renderMessageContent = (message: AthroMessage) => {
    // Simple detection of mathematical notation using $ as delimiter
    if (activeCharacter?.supportsMathNotation && message.content.includes('$')) {
      // In a real app, we'd use a proper LaTeX renderer like KaTeX or MathJax
      // For now, we'll just style it differently to simulate math rendering
      const parts = message.content.split(/(\$[^$]+\$)/g);
      return (
        <>
          {parts.map((part, index) => {
            if (part.startsWith('$') && part.endsWith('$')) {
              // This is math notation
              const mathContent = part.slice(1, -1);
              return (
                <span key={index} className="font-mono bg-gray-50 px-1 rounded">
                  {mathContent}
                </span>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </>
      );
    }
    
    return message.content;
  };

  if (!activeCharacter) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h3 className="text-lg font-medium">No Character Selected</h3>
          <p className="text-muted-foreground">Please select an Athro character to start a study session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isAthro={message.senderId !== 'user'}
              athroAvatar={activeCharacter?.avatarUrl}
              renderContent={renderMessageContent}
            />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 opacity-70">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-64 rounded bg-gray-200 animate-pulse"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${activeCharacter.name} a question...`}
            className="min-h-[60px] flex-1 resize-none"
          />
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleSendMessage}
              className="h-12 w-12 rounded-full p-0"
              disabled={isLoading}
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
            
            {showResourcesButton && (
              <Button
                variant="outline"
                className="h-12 w-12 rounded-full p-0"
                disabled={isLoading}
              >
                <PaperclipIcon className="h-5 w-5" />
                <span className="sr-only">Attach resource</span>
              </Button>
            )}
            
            {showConfidenceCheck && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 w-12 rounded-full p-0"
                    disabled={isLoading}
                  >
                    <BarChart className="h-5 w-5" />
                    <span className="sr-only">Confidence check</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">How confident are you with this topic?</h4>
                    <div className="flex justify-between">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                        <Button
                          key={value}
                          variant={confidenceValue === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleConfidenceSubmit(value)}
                          className="w-7 h-7 p-0"
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Not confident</span>
                      <span>Very confident</span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-muted-foreground">
            Press Enter to send. Use Shift+Enter for a new line.
          </p>
          
          {showPerformance ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowPerformance(false)}
              className="text-xs"
            >
              Hide my progress
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowPerformance(true)}
              className="text-xs"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Show my progress
            </Button>
          )}
        </div>
        
        {showPerformance && Object.keys(studentPerformance.confidenceByTopic).length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
            <h4 className="font-medium text-xs mb-2">Your {activeCharacter.subject} Progress</h4>
            <div className="space-y-2">
              {studentPerformance.suggestedTopics.length > 0 && (
                <div>
                  <p className="text-xs font-medium">Suggested focus areas:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {studentPerformance.suggestedTopics.map(topic => (
                      <span key={topic} className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {studentPerformance.recentQuizScores.length > 0 && (
                <div>
                  <p className="text-xs font-medium">Recent quiz scores:</p>
                  <div className="flex items-center mt-1">
                    {studentPerformance.recentQuizScores.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex flex-col items-center mr-3">
                        <div 
                          className="h-16 w-4 bg-gray-200 rounded-t-sm relative overflow-hidden"
                          title={`${item.score}% on ${item.date}`}
                        >
                          <div 
                            className="absolute bottom-0 w-full bg-purple-600" 
                            style={{ height: `${item.score}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] mt-1">{item.date.split('-')[2]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ChatMessageProps {
  message: AthroMessage;
  isAthro: boolean;
  athroAvatar?: string;
  renderContent: (message: AthroMessage) => React.ReactNode;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isAthro, athroAvatar, renderContent }) => {
  return (
    <div className={`flex ${isAthro ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        isAthro 
          ? 'bg-white border border-gray-200 mr-12' 
          : 'bg-purple-600 text-white ml-12'
      }`}>
        {isAthro && (
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 mr-2">
              <img 
                src={athroAvatar} 
                alt="Athro Avatar" 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <span className="font-medium text-purple-700">{message.senderId}</span>
          </div>
        )}
        <p className={`text-sm ${isAthro ? 'text-gray-800' : 'text-white'}`}>
          {renderContent(message)}
        </p>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id} className="border rounded-md p-2 bg-gray-50">
                <div className="flex items-center">
                  <PaperclipIcon className="h-3 w-3 mr-2 text-gray-500" />
                  <span className="text-xs text-gray-600">{attachment.caption || attachment.url}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AthroChat;
