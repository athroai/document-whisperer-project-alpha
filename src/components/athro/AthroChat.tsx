
import React, { useState } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AthroChat: React.FC = () => {
  const { activeCharacter, messages, sendMessage, isTyping, getSuggestedTopics } = useAthro();
  const [input, setInput] = useState('');
  const [showTopics, setShowTopics] = useState(true);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTopicClick = (topic: string) => {
    sendMessage(`I'd like to work on ${topic}`);
    setShowTopics(false);
  };

  if (!activeCharacter) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please select an Athro character to start chatting.</p>
        </CardContent>
      </Card>
    );
  }

  const suggestedTopics = getSuggestedTopics(activeCharacter.subject);

  return (
    <Card className="w-full flex flex-col h-[600px]">
      <CardHeader className="px-4 py-2 border-b">
        <div className="flex items-center">
          <div className="h-10 w-10 mr-3 rounded-full overflow-hidden">
            <img 
              src={activeCharacter.avatarUrl} 
              alt={activeCharacter.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-lg">{activeCharacter.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{activeCharacter.shortDescription}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {showTopics && suggestedTopics.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm">Suggested topics to explore:</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => setShowTopics(false)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.map((topic) => (
                <Badge 
                  key={topic}
                  variant="outline" 
                  className="cursor-pointer hover:bg-slate-200"
                  onClick={() => handleTopicClick(topic)}
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="font-medium text-lg mb-2">Start your {activeCharacter.subject} session</h3>
              <p className="text-muted-foreground">Ask a question or select a topic to begin</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.senderId === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 max-w-[80%]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 border-t">
        <div className="flex w-full space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${activeCharacter.name} a question...`}
            className="min-h-[60px] flex-grow"
            onKeyDown={handleKeyPress}
          />
          <Button onClick={handleSend} size="icon" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AthroChat;
