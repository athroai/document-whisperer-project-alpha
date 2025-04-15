
import React, { useState, useRef, useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { AthroMessage } from '@/types/athro';
import { ScrollArea } from '@/components/ui/scroll-area';
import AthroMathsRenderer from './AthroMathsRenderer';

interface AthroChatProps {
  isCompactMode?: boolean;
}

const AthroChat: React.FC<AthroChatProps> = ({ isCompactMode = false }) => {
  const { activeCharacter, messages, sendMessage, isTyping } = useAthro();
  const [inputMessage, setInputMessage] = useState<string>('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim() || !activeCharacter) return;
    
    console.log('Sending message:', inputMessage);
    sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
                
                {msg.senderId !== 'user' && msg.referencedResources && msg.referencedResources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                      View referenced materials
                    </Button>
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
      
      <div className={`p-4 border-t ${isCompactMode ? 'bg-background' : ''}`}>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder={`Ask ${activeCharacter?.name || 'Athro AI'} a question...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-purple-200"
          />
          <Button 
            onClick={handleSend}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className={isCompactMode ? 'sr-only' : 'ml-2'}>Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AthroChat;
