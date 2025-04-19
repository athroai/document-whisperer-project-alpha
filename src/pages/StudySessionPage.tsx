
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AthroMessage } from '@/types/athro';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Update the message object to include the required 'role' property
const StudySessionPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState<AthroMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: AthroMessage = {
      id: Date.now().toString(),
      role: 'user',
      senderId: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Mock response from Athro AI
    setTimeout(() => {
      const athroResponse: AthroMessage = {
        id: `athro-${Date.now()}`,
        role: 'assistant',
        senderId: 'athro',
        content: `I'm your Athro mentor. Let's work on your ${id} session together.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, athroResponse]);
    }, 1000);
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Study Session</h1>
      
      <Card className="mb-6">
        <CardContent className="p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 my-12">
              <p>No messages yet. Start a conversation with your Athro mentor!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => (
                <div 
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.senderId === 'user' ? 'bg-purple-100 ml-12' : 'bg-gray-100 mr-12'
                  }`}
                >
                  <p className="text-sm font-medium mb-1">{msg.senderId === 'user' ? 'You' : 'Athro'}</p>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask your Athro mentor a question..."
          className="flex-1 p-2 border border-gray-300 rounded"
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  );
};

export default StudySessionPage;
