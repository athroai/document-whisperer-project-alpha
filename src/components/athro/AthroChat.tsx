
import React, { useState, useRef, useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, AlertTriangle, Wifi, WifiOff, Bug, Info, Upload, FileText, FileImage } from 'lucide-react';
import { AthroMessage, AthroCharacter } from '@/types/athro';
import { ScrollArea } from '@/components/ui/scroll-area';
import AthroMathsRenderer from './AthroMathsRenderer';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { DocumentMetadata, uploadDocumentForChat, getDocumentsForCharacter, linkDocumentToMessage } from '@/services/documentService';
import { extractTextFromImageWithMathpix } from '@/lib/mathpixService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AthroChatProps {
  isCompactMode?: boolean;
  character?: AthroCharacter;
}

const AthroChat: React.FC<AthroChatProps> = ({ 
  isCompactMode = false, 
  character 
}) => {
  const { activeCharacter, messages, sendMessage, isTyping } = useAthro();
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showOcrDialog, setShowOcrDialog] = useState(false);
  const [ocrResult, setOcrResult] = useState<{text: string, latex: string, latexConfidence: number}|null>(null);
  const [processingOcr, setProcessingOcr] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrFileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSent = useRef(false);
  
  const currentCharacter = character || activeCharacter;
  
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
    
    console.log('🌐 Initial network status:', navigator.onLine ? 'Online' : 'Offline');
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    if (currentCharacter && messages.length === 0 && !initialMessageSent.current && !isTyping) {
      console.log('👋 Sending initial welcome message');
      initialMessageSent.current = true;
      
      setTimeout(() => {
        sendMessage('welcome', currentCharacter);
      }, 200);
    }
  }, [currentCharacter, messages.length, sendMessage, isTyping]);
  
  useEffect(() => {
    console.log('🎭 AthroChat component mounted with', messages.length, 'messages');
    return () => {
      console.log('🎭 AthroChat component unmounted');
      initialMessageSent.current = false;
    };
  }, [messages.length]);
  
  useEffect(() => {
    console.log('📜 Messages in AthroChat:', messages.length, 'messages');
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const loadDocumentsForCharacter = async () => {
      if (currentCharacter) {
        try {
          const docs = await getDocumentsForCharacter(currentCharacter.id);
          setDocuments(docs);
        } catch (error) {
          console.error('Error loading documents:', error);
        }
      }
    };

    loadDocumentsForCharacter();
  }, [currentCharacter]);
  
  const handleSend = () => {
    if (!inputMessage.trim() || !currentCharacter) {
      if (!currentCharacter) {
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
    sendMessage(inputMessage, currentCharacter);
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentCharacter) {
      return;
    }
    
    const file = e.target.files[0];
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'jpg', 'jpeg', 'png'];
    
    if (!allowedTypes.includes(fileType)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only PDF, DOC, XLS, CSV, DOCX, JPG, or PNG files.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size should be less than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // Check if user is authenticated
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        toast({
          title: "Authentication Required",
          description: "You need to be logged in to upload files.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      // Upload file to Supabase storage
      const uploadResult = await uploadDocumentForChat(
        file, 
        currentCharacter.id
      );

      if (!uploadResult) {
        throw new Error('Upload failed');
      }

      // Create a message about the upload
      const userMessage = `I've uploaded a document: ${file.name}`;
      const messageResult = await sendMessage(userMessage, currentCharacter);
      
      if (messageResult && uploadResult.id) {
        // Link document to message only if both exist
        await linkDocumentToMessage(uploadResult.id, messageResult.id);
        console.log('Document linked to message:', uploadResult.id, messageResult.id);
      }

      // Refresh document list
      const updatedDocs = await getDocumentsForCharacter(currentCharacter.id);
      setDocuments(updatedDocs);
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOcrClick = () => {
    if (ocrFileInputRef.current) {
      ocrFileInputRef.current.click();
    }
  };

  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentCharacter) {
      return;
    }
    
    const file = e.target.files[0];
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedTypes = ['jpg', 'jpeg', 'png', 'pdf'];
    
    if (!allowedTypes.includes(fileType)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only JPG, PNG, or PDF files for OCR.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size should be less than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setProcessingOcr(true);
    setShowOcrDialog(true);
    
    try {
      // Process the image with Mathpix OCR
      const result = await extractTextFromImageWithMathpix(file);
      setOcrResult(result);

      // Upload the original file to Supabase as well
      const uploadResult = await uploadDocumentForChat(
        file, 
        currentCharacter.id
      );

      if (uploadResult) {
        // Refresh document list
        const updatedDocs = await getDocumentsForCharacter(currentCharacter.id);
        setDocuments(updatedDocs);
      }
      
    } catch (error) {
      console.error('Error processing OCR:', error);
      toast({
        title: "OCR Processing Failed",
        description: "There was an error processing your file with OCR.",
        variant: "destructive",
      });
      setShowOcrDialog(false);
    } finally {
      setProcessingOcr(false);
      if (ocrFileInputRef.current) {
        ocrFileInputRef.current.value = '';
      }
    }
  };

  const sendOcrToChat = () => {
    if (!ocrResult || !currentCharacter) return;
    
    const message = `I've scanned this document using OCR: \n\n${ocrResult.text}${ocrResult.latex ? `\n\nLaTeX formatted content:\n${ocrResult.latex}` : ''}`;
    sendMessage(message, currentCharacter);
    setShowOcrDialog(false);
    setOcrResult(null);
  };

  const openDocument = (doc: DocumentMetadata) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      toast({
        title: "Document Unavailable",
        description: "Unable to access this document at the moment.",
        variant: "destructive",
      });
    }
  };

  const sendDebugMessage = () => {
    console.log('🐛 Sending debug test message');
    if (!currentCharacter) {
      console.log('❌ No active character for debug message');
      toast({
        title: "No Character Selected",
        description: "Please select a subject mentor first.",
        variant: "destructive",
      });
      return;
    }
    
    sendMessage("2+2=?", currentCharacter);
  };

  const sendMathTest = () => {
    console.log('🧮 Testing math response');
    if (!currentCharacter) {
      console.log('❌ No active character for math test');
      toast({
        title: "No Character Selected",
        description: "Please select a subject mentor first.",
        variant: "destructive",
      });
      return;
    }
    
    sendMessage("2-1", currentCharacter);
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
            onClick={() => {
              if (currentCharacter) {
                sendMessage("2-1", currentCharacter);
              }
            }}
          >
            <Info className="h-3 w-3 mr-1" />
            Test 2-1
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-xs" 
            onClick={() => {
              if (currentCharacter) {
                sendMessage("2+2=?", currentCharacter);
              }
            }}
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
          <p>Active Character: {currentCharacter?.name || 'None'}</p>
          <p>Messages: {messages.length}</p>
          <p>Is Typing: {isTyping ? 'Yes' : 'No'}</p>
          <p>Network: {isOnline ? 'Online' : 'Offline'}</p>
          <p>Last Updated: {new Date().toLocaleTimeString()}</p>
        </div>
      )}
      
      <div className="flex flex-1">
        <div className="w-56 border-r p-4 flex flex-col">
          <div className="space-y-2 mb-4">
            <Button 
              onClick={handleUploadClick} 
              className="w-full"
              disabled={uploading || !currentCharacter}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Study Materials"}
            </Button>

            <Button 
              onClick={handleOcrClick}
              className="w-full"
              disabled={processingOcr || !currentCharacter}
              variant="secondary"
            >
              <FileImage className="h-4 w-4 mr-2" />
              {processingOcr ? "Processing..." : "Scan with OCR"}
            </Button>
          </div>
          
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
          />

          <input 
            type="file"
            ref={ocrFileInputRef}
            className="hidden"
            onChange={handleOcrFileChange}
            accept=".jpg,.jpeg,.png,.pdf"
          />
          
          <h3 className="text-sm font-medium mb-2">Documents</h3>
          
          <div className="overflow-y-auto flex-1">
            {documents.length === 0 ? (
              <p className="text-xs text-muted-foreground">No documents uploaded</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="p-2 border rounded text-xs cursor-pointer hover:bg-muted flex items-center"
                    onClick={() => openDocument(doc)}
                  >
                    <FileText className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{doc.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {messages.length === 0 && currentCharacter && (
                <div className="text-center p-4 text-muted-foreground">
                  {isTyping ? "Loading..." : "Start a conversation with " + currentCharacter.name}
                </div>
              )}
              
              {messages.length === 0 && !currentCharacter && (
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
                          <AvatarImage src={currentCharacter?.avatarUrl} alt={currentCharacter?.name} />
                          <AvatarFallback>{currentCharacter?.name?.charAt(0) || 'A'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{currentCharacter?.name || 'Athro AI'}</span>
                      </div>
                    )}
                    
                    {msg.senderId !== 'user' && currentCharacter?.supportsMathNotation ? (
                      <AthroMathsRenderer content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                    
                    {msg.referencedResources && msg.referencedResources.length > 0 && (
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
                placeholder={`Ask ${currentCharacter?.name || 'Athro AI'} a question...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-purple-200"
                disabled={!currentCharacter || !isOnline}
              />
              <Button 
                onClick={handleSend}
                className="shrink-0"
                disabled={!inputMessage.trim() || isTyping || !currentCharacter || !isOnline}
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
      </div>
      
      {/* OCR Result Dialog */}
      <Dialog open={showOcrDialog} onOpenChange={setShowOcrDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>OCR Scan Results</DialogTitle>
          </DialogHeader>
          
          {processingOcr ? (
            <div className="py-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p>Processing your document with Mathpix OCR...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ocrResult && (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Extracted Text</h3>
                    <div className="p-4 bg-muted rounded border max-h-40 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap">{ocrResult.text}</pre>
                    </div>
                  </div>
                  
                  {ocrResult.latex && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">
                        LaTeX Formatted Content
                        {ocrResult.latexConfidence > 0 && (
                          <span className="text-xs ml-2 text-muted-foreground">
                            (Confidence: {Math.round(ocrResult.latexConfidence * 100)}%)
                          </span>
                        )}
                      </h3>
                      <div className="p-4 bg-muted rounded border max-h-40 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono">{ocrResult.latex}</pre>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowOcrDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={sendOcrToChat}>
                      Send to Chat
                    </Button>
                  </div>
                </>
              )}
              
              {!ocrResult && !processingOcr && (
                <div className="py-8 text-center">
                  <p>Unable to process the document. Please try again.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => setShowOcrDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AthroChat;
