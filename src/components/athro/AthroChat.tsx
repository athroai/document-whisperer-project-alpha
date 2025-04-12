
import React, { useState, useRef, useEffect } from 'react';
import { Send, PaperclipIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAthro } from '@/contexts/AthroContext';
import { AthroMessage } from '@/types/athro';

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
    isLoading 
  } = useAthro();
  
  const [inputValue, setInputValue] = useState('');
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
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Press Enter to send. Use Shift+Enter for a new line.
        </p>
      </div>
    </div>
  );
};

interface ChatMessageProps {
  message: AthroMessage;
  isAthro: boolean;
  athroAvatar?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isAthro, athroAvatar }) => {
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
          {message.content}
        </p>
      </div>
    </div>
  );
};

export default AthroChat;
