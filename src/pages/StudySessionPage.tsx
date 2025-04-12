import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ThumbsUp, Clock } from 'lucide-react';

const StudySessionPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { 
      text: "Hello there! I'm Athro AI, your comprehensive GCSE study mentor. How can I help you with your studies today?", 
      sender: 'athro',
      avatar: '/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png'
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add the user message to the chat
      setMessages([...messages, { text: message, sender: 'user', avatar: '' }]);
      
      // Simulate Athro response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "I'm here to help with your mathematics questions! Let me know what specific topic you'd like to explore or what problems you're facing.",
          sender: 'athro',
          avatar: '/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png'
        }]);
      }, 1000);
      
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 mr-3">
                    <img 
                      src="/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png" 
                      alt="Athro AI" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">Athro AI</h3>
                    <p className="text-sm text-gray-500">Study Mentor</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Session time: 12 minutes</span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Current topic:</h4>
                    <p className="text-sm text-gray-700">Mathematics</p>
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
                    <Button variant="outline" className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50">
                      <Clock className="mr-2 h-4 w-4" />
                      Start Pomodoro Timer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Chat */}
          <div className="md:col-span-3 flex flex-col h-[calc(100vh-8rem)]">
            <Card className="flex-grow flex flex-col overflow-hidden">
              <CardHeader className="border-b bg-white sticky top-0 z-10">
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3">
                    <img 
                      src="/lovable-uploads/bf9bb93f-92c0-473b-97e2-d4ff035e3065.png" 
                      alt="Athro AI" 
                      className="w-full h-full object-cover rounded-full" 
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Study Session</CardTitle>
                    <p className="text-sm text-gray-500">with Athro AI</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender === 'user' 
                          ? 'bg-purple-600 text-white ml-12' 
                          : 'bg-white border border-gray-200 mr-12'
                      }`}
                    >
                      {msg.sender === 'athro' && (
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 mr-2">
                            <img 
                              src={msg.avatar} 
                              alt="Athro Avatar" 
                              className="w-full h-full object-cover rounded-full" 
                            />
                          </div>
                          <span className="font-medium text-purple-700">Athro AI</span>
                        </div>
                      )}
                      <p className={`text-sm ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))}
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
                  />
                  <Button 
                    className="h-auto bg-purple-600 hover:bg-purple-700"
                    onClick={handleSendMessage}
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
