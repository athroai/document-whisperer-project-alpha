import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAthro } from '@/contexts/AthroContext';
import { Citation } from '@/types/citations';
import { renderWithCitations } from '@/utils/citationUtils';
import CitationSidebar from '@/components/citations/CitationSidebar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Upload, X, Info, Book, AlertOctagon } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { UploadMetadata } from '@/types/files';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import KnowledgeIntegration from '@/components/knowledge/KnowledgeIntegration';
import persistentStorage from '@/services/persistentStorage';
import { AthroMessage } from '@/types/athro';

export interface Knowledge {
  enhancedContext: string;
  hasKnowledgeResults: boolean;
  citations: Citation[];
}

export interface AthroChatProps {
  fetchKnowledgeForQuery: (query: string) => Promise<Knowledge>;
  isLoading: boolean;
  isCompactMode?: boolean;
}

const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

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
  const [draftSaved, setDraftSaved] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [tabId] = useState(`tab_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`);
  const [hasMultipleTabs, setHasMultipleTabs] = useState(false);
  const [syncMessage, setSyncMessage] = useState<any>(null);
  
  const sendSyncMessage = useCallback((payload: any) => {
    const message = {
      type: 'CHAT_HISTORY_UPDATE',
      tabId,
      timestamp: Date.now(),
      payload
    };
    localStorage.setItem('CHAT_SYNC', JSON.stringify(message));
    const event = new CustomEvent('storage-sync', { detail: message });
    window.dispatchEvent(event);
  }, [tabId]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'CHAT_SYNC') {
        try {
          const message = JSON.parse(e.newValue || '{}');
          if (message.tabId !== tabId) {
            setSyncMessage(message);
            setHasMultipleTabs(true);
          }
        } catch (error) {
          console.error('Error parsing sync message:', error);
        }
      }
    };
    
    const handleCustomEvent = (e: CustomEvent) => {
      const message = e.detail;
      if (message.tabId !== tabId) {
        setSyncMessage(message);
        setHasMultipleTabs(true);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage-sync', handleCustomEvent as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage-sync', handleCustomEvent as EventListener);
    };
  }, [tabId]);

  const currentSubject = subject ? subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase() : null;
  const theme = currentSubject ? athroThemeForSubject(currentSubject) : {
    primaryHex: '#2563eb',
    secondaryHex: '#22c55e'
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (state.user?.id && currentSubject) {
        setIsRestoringSession(true);
        try {
          const userId = `${state.user.id}_${currentSubject.toLowerCase()}`;
          
          const chatResult = await persistentStorage.getChatHistory<AthroMessage[]>(userId);
          
          if (chatResult.success && chatResult.data && chatResult.data.length > 0) {
            setConversation(chatResult.data);
            toast({
              title: "Session restored",
              description: "Your previous conversation has been loaded.",
            });
          }
          
          const draftResult = await persistentStorage.getDraftResponse(userId);
          
          if (draftResult.success && draftResult.data) {
            setMessage(draftResult.data);
            setDraftSaved(true);
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
        } finally {
          setIsRestoringSession(false);
        }
      }
    };
    
    restoreSession();
  }, [state.user?.id, currentSubject, toast]);
  
  useEffect(() => {
    const saveSession = async () => {
      if (state.user?.id && currentSubject && !isRestoringSession && conversation.length > 0) {
        try {
          const userId = `${state.user.id}_${currentSubject.toLowerCase()}`;
          
          await persistentStorage.saveChatHistory(userId, conversation);
          
          sendSyncMessage({ conversation });
          
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error("Failed to save session:", error);
          setHasUnsavedChanges(true);
        }
      }
    };
    
    saveSession();
  }, [conversation, state.user?.id, currentSubject, isRestoringSession, sendSyncMessage]);
  
  useEffect(() => {
    if (syncMessage && syncMessage.payload) {
      const { conversation: syncedConversation } = syncMessage.payload;
      
      if (syncedConversation && 
          JSON.stringify(syncedConversation) !== JSON.stringify(conversation)) {
        setConversation(syncedConversation);
        toast({
          title: "Conversation updated",
          description: "Chat history has been synchronized from another tab.",
        });
      }
    }
  }, [syncMessage, conversation, toast]);
  
  useEffect(() => {
    const saveDraft = async () => {
      if (state.user?.id && currentSubject && message) {
        try {
          const userId = `${state.user.id}_${currentSubject.toLowerCase()}`;
          await persistentStorage.saveDraftResponse(userId, message);
          setDraftSaved(true);
        } catch (error) {
          console.error("Failed to save draft:", error);
        }
      }
    };
    
    const timeoutId = setTimeout(saveDraft, 1000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [message, state.user?.id, currentSubject]);

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

  const handleMessageSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    const userMessage: AthroMessage = {
      id: generateMessageId(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };
    
    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);
    setMessage('');
    setHasUnsavedChanges(true);
    
    if (state.user?.id && currentSubject) {
      const userId = `${state.user.id}_${currentSubject.toLowerCase()}`;
      await persistentStorage.saveDraftResponse(userId, '');
      setDraftSaved(false);
    }

    try {
      const knowledge = await fetchKnowledgeForQuery(message);
      
      const aiMessage: AthroMessage = {
        id: generateMessageId(),
        content: simulateAiResponse(message, knowledge.enhancedContext),
        role: 'assistant',
        timestamp: new Date(),
        citations: knowledge.hasKnowledgeResults ? knowledge.citations : undefined
      };
      
      const finalConversation = [...newConversation, aiMessage];
      setConversation(finalConversation);
      setHasUnsavedChanges(true);
      
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
  }, [message, isLoading, conversation, state.user?.id, currentSubject, fetchKnowledgeForQuery, toast]);

  function simulateAiResponse(query: string, context?: string): string {
    if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
      return "Hello! I'm Athro, your AI study assistant. How can I help you today?";
    }
    
    if (context) {
      return `Based on your study materials: ${context.substring(0, 200)}... \n\nHere's what I found that might help you with your question about ${query}.`;
    }
    
    return `I'm here to help you study. What specific topic would you like to explore?`;
  };

  function renderMessage(msg: AthroMessage) {
    const bgColor = msg.role === 'user' 
      ? 'bg-gray-100 text-gray-900' 
      : `bg-blue-500 text-white`;
    
    return (
      <div 
        key={msg.id}
        className={`p-4 rounded-lg mb-4 ${bgColor} ${msg.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'}`}
        onClick={() => {
          if (msg.citations?.length) {
            setCurrentMessageId(msg.id);
            setActiveCitations(msg.citations);
            setShowCitations(true);
          }
        }}
      >
        {msg.citations 
          ? renderWithCitations(msg.content, msg.citations, handleCitationClick)
          : <p>{msg.content}</p>
        }
        <div className="text-xs mt-2 opacity-70">
          {msg.timestamp.toLocaleTimeString()}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full`}>
      <div className={`flex-1 flex flex-col h-full ${showCitations ? 'pr-4' : ''}`}>
        <div 
          className="p-4 text-white flex justify-between items-center"
          style={{ backgroundColor: theme.primaryHex }}
        >
          <h2 className="text-xl font-bold">
            {activeCharacter ? `Athro ${activeCharacter.subject}` : 'Athro AI'}
          </h2>
          <div className="flex items-center space-x-2">
            {hasMultipleTabs && (
              <div className="flex items-center mr-2 px-2 py-1 bg-yellow-500 text-white rounded-md text-xs">
                <AlertOctagon size={14} className="mr-1" />
                Multiple tabs open
              </div>
            )}
            
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
        
        {showKnowledgePanel && (
          <div className="p-4 border-b">
            <KnowledgeIntegration 
              subject={currentSubject?.toLowerCase()}
              onClose={() => setShowKnowledgePanel(false)}
            />
          </div>
        )}
        
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
        
        <div className="flex-1 overflow-auto p-4">
          {conversation.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
        
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
          {draftSaved && message && (
            <p className="text-xs text-gray-500 mt-1">Draft saved</p>
          )}
          {hasUnsavedChanges && (
            <p className="text-xs text-yellow-600 mt-1">Saving conversation...</p>
          )}
        </div>
      </div>
      
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
