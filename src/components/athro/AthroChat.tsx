import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAthro } from '@/contexts/AthroContext';
import { Citation } from '@/types/citations';
import { renderWithCitations } from '@/utils/citationUtils';
import CitationSidebar from '@/components/citations/CitationSidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Upload, X, Info, Book } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { UploadMetadata } from '@/types/files';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import KnowledgeIntegration from '@/components/knowledge/KnowledgeIntegration';
import { fetchKnowledgeForQuery } from '@/services/fileAwareService';

interface AthroMessage {
  id: string;
  text: string;
  sender: 'user' | 'athro';
  timestamp: Date;
  citations?: Citation[];
}

interface Knowledge {
  enhancedContext: string;
  hasKnowledgeResults: boolean;
  citations: Citation[];
}

export interface AthroChatProps {
  fetchKnowledgeForQuery: (query: string) => Promise<Knowledge>;
  isLoading: boolean;
  isCompactMode?: boolean;
}

const AthroChat: React.FC<AthroChatProps> = ({ 
  fetchKnowledgeForQuery, 
  isLoading, 
  isCompactMode = false 
}) => {
  const { subject } = useParams<{ subject: string }>();
  const { characters, activeCharacter, athroThemeForSubject } = useAthro();
  const { state } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<AthroMessage[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get theme colors based on current subject
  const currentSubject = subject ? subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase() : null;
  const theme = currentSubject ? athroThemeForSubject(currentSubject) : {
    primaryHex: '#2563eb',
    secondaryHex: '#22c55e'
  };

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = (metadata: UploadMetadata) => {
    toast({
      title: 'File Uploaded',
      description: `${metadata.filename} has been uploaded and will be available for AI reference.`,
    });
    setShowFileUpload(false);
  };

  function handleCitationClick(citation: Citation) {
    setActiveCitations([citation]);
    setShowCitations(true);
  };

  function toggleCitationSidebar() {
    setShowCitations(!showCitations);
  };

  function renderMessage(msg: AthroMessage) {
    const bgColor = msg.sender === 'user' 
      ? 'bg-gray-100' 
      : `bg-blue-500 text-white`;
    
    return (
      <div 
        key={msg.id}
        className={`p-4 rounded-lg mb-4 ${bgColor} ${msg.sender === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}
        onClick={() => {
          if (msg.citations?.length) {
            setCurrentMessageId(msg.id);
            setActiveCitations(msg.citations);
            setShowCitations(true);
          }
        }}
      >
        {msg.citations 
          ? renderWithCitations(msg.text, msg.citations, handleCitationClick)
          : <p>{msg.text}</p>
        }
      </div>
    );
  };

  async function handleMessageSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Add user message to conversation
    const userMessage: AthroMessage = {
      id: `user_${Date.now()}`,
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setConversation([...conversation, userMessage]);
    setMessage('');

    try {
      // Fetch knowledge context for the query
      const knowledge = await fetchKnowledgeForQuery(message);
      
      // Create the AI response with citations if knowledge was found
      const aiMessage: AthroMessage = {
        id: `athro_${Date.now()}`,
        text: simulateAiResponse(message, knowledge.enhancedContext),
        sender: 'athro',
        timestamp: new Date(),
        citations: knowledge.hasKnowledgeResults ? knowledge.citations : undefined
      };
      
      setConversation(prev => [...prev, aiMessage]);
      
      // Show citations if any were found
      if (knowledge.citations?.length) {
        setActiveCitations(knowledge.citations);
        setCurrentMessageId(aiMessage.id);
        setShowCitations(true);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate a response. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // This is a placeholder to simulate AI responses
  // In a real implementation, this would call an actual AI service
  function simulateAiResponse(query: string, context?: string): string {
    // Simple response based on query
    if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
      return "Hello! I'm Athro, your AI study assistant. How can I help you today?";
    }
    
    if (context) {
      return `Based on your study materials: ${context.substring(0, 200)}... \n\nHere's what I found that might help you with your question about ${query}.`;
    }
    
    return `I'm here to help you study. What specific topic would you like to explore?`;
  };

  return (
    <div className={`flex h-full`}>
      <div className={`flex-1 flex flex-col h-full ${showCitations ? 'pr-4' : ''}`}>
        {/* Chat header */}
        <div 
          className="p-4 text-white flex justify-between items-center"
          style={{ backgroundColor: theme.primaryHex }}
        >
          <h2 className="text-xl font-bold">
            {activeCharacter ? `Athro ${activeCharacter.subject}` : 'Athro AI'}
          </h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white"
              onClick={() => {
                setShowFileUpload(false);
                setShowKnowledgePanel(!showKnowledgePanel);
              }}
            >
              <Book size={18} />
              <span className="ml-1">Knowledge</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white"
              onClick={() => {
                setShowKnowledgePanel(false);
                setShowFileUpload(!showFileUpload);
              }}
            >
              <Upload size={18} />
              <span className="ml-1">Upload Files</span>
            </Button>
            
            {conversation.some(msg => msg.citations?.length) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white"
                onClick={toggleCitationSidebar}
              >
                <Info size={18} />
                <span className="ml-1">
                  {showCitations ? 'Hide Citations' : 'Show Citations'}
                </span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Knowledge panel */}
        {showKnowledgePanel && (
          <div className="p-4 border-b">
            <KnowledgeIntegration 
              subject={currentSubject?.toLowerCase()}
              onClose={() => setShowKnowledgePanel(false)}
            />
          </div>
        )}
        
        {/* File upload area */}
        {showFileUpload && (
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Upload Study Materials</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowFileUpload(false)}
              >
                <X size={16} />
              </Button>
            </div>
            <FileUpload
              userId={state.user?.id}
              userRole={state.user?.role}
              onFileUploaded={handleFileUpload}
            />
          </div>
        )}
        
        {/* Chat messages */}
        <div className="flex-1 overflow-auto p-4">
          {conversation.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <div className="p-4 border-t">
          <form onSubmit={handleMessageSubmit} className="flex space-x-2">
            <Textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 min-h-[50px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleMessageSubmit(e);
                }
              }}
            />
            <Button 
              type="submit"
              disabled={!message.trim() || isLoading}
              style={{ backgroundColor: theme.secondaryHex }}
            >
              <Send size={18} />
            </Button>
          </form>
        </div>
      </div>
      
      {/* Citation sidebar */}
      {showCitations && (
        <CitationSidebar 
          citations={activeCitations} 
          onCitationClick={handleCitationClick}
          currentMessageId={currentMessageId || undefined}
        />
      )}
    </div>
  );
}

export default AthroChat;
