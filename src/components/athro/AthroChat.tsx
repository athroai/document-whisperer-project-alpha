
import React, { useState, useRef, useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, AlertTriangle, Wifi, WifiOff, Bug } from 'lucide-react';
import { AthroMessage } from '@/types/athro';
import { ScrollArea } from '@/components/ui/scroll-area';
import AthroMathsRenderer from './AthroMathsRenderer';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AthroChatProps {
  isCompactMode?: boolean;
}

const AthroChat: React.FC<AthroChatProps> = ({ isCompactMode = false }) => {
  const { activeCharacter, messages, sendMessage, isTyping } = useAthro();
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network status: Online');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('🌐 Network status: Offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Debug initial network status
    console.log('🌐 Initial network status:', navigator.onLine ? 'Online' : 'Offline');
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Debug mount/unmount cycles
  useEffect(() => {
    console.log('🎭 AthroChat component mounted with', messages.length, 'messages');
    return () => {
      console.log('🎭 AthroChat component unmounted');
    };
  }, [messages.length]);
  
  // Scroll to latest message
  useEffect(() => {
    console.log('📜 Messages in AthroChat:', messages.length, 'messages');
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Add a debug message button for testing
  const sendDebugMessage = () => {
    console.log('🐛 Sending debug test message');
    if (!activeCharacter) {
      console.log('❌ No active character for debug message');
      toast({
        title: "No Character Selected",
        description: "Please select a subject mentor first.",
        variant: "destructive",
      });
      return;
    }
    
    // Send a simple test message that should trigger a response
    sendMessage("2+2=?", activeCharacter);
  };

  const handleSend = () => {
    if (!inputMessage.trim() || !activeCharacter) {
      if (!activeCharacter) {
        console.log('❌ Send attempted with no active character');
        toast({
          title: "No Subject Selected",
          description: "Please select a subject mentor first.",
          variant: "default",
        });
      }
      return;
    }
    
    console.log('💬 AthroChat - Sending message:', inputMessage);
    sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {!isOnline && (
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You appear to be offline. Some features may not work correctly.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between px-4 py-1 text-xs text-muted-foreground">
        <div className="flex items-center">
          {isOnline ? (
            <Wifi className="h-3 w-3 mr-1" />
          ) : (
            <WifiOff className="h-3 w-3 mr-1" />
          )}
          <span>Status: {isOnline ? 'Connected' : 'Offline'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-xs" 
            onClick={sendDebugMessage}
          >
            <Bug className="h-3 w-3 mr-1" />
            Test Chat
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs" 
            onClick={() => setShowDebugInfo(!showDebugInfo)}
          >
            {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
          </Button>
        </div>
      </div>
      
      {showDebugInfo && (
        <div className="bg-muted text-xs p-2 mb-2 overflow-auto max-h-24">
          <p>Active Character: {activeCharacter?.name || 'None'}</p>
          <p>Messages: {messages.length}</p>
          <p>Is Typing: {isTyping ? 'Yes' : 'No'}</p>
          <p>Network: {isOnline ? 'Online' : 'Offline'}</p>
          <p>Last Updated: {new Date().toLocaleTimeString()}</p>
        </div>
      )}
      
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {messages.length === 0 && activeCharacter && (
            <div className="text-center p-4 text-muted-foreground">
              Start a conversation with {activeCharacter.name}
            </div>
          )}
          
          {messages.length === 0 && !activeCharacter && (
            <div className="text-center p-4 text-muted-foreground">
              Please select a subject mentor to begin chatting
            </div>
          )}
          
          {messages.map((msg: AthroMessage) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
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
            disabled={!activeCharacter || !isOnline}
          />
          <Button 
            onClick={handleSend}
            className="shrink-0"
            disabled={!inputMessage.trim() || isTyping || !activeCharacter || !isOnline}
          >
            <Send className="h-4 w-4" />
            <span className={isCompactMode ? 'sr-only' : 'ml-2'}>Send</span>
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send. Use Shift+Enter for a new line.
        </p>
      </div>
    </div>
  );
};

export default AthroChat;
