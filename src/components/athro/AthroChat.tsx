
import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAthroChatSession } from './hooks/useAthroChatSession';
import { useFileUpload } from './hooks/useFileUpload';
import { AthroMessageList } from './components/AthroMessageList';

const AthroChat = () => {
  const {
    input,
    setInput,
    messages,
    setMessages,
    isLoading,
    currentSessionId,
    sendMessage,
    activeCharacter,
    userId
  } = useAthroChatSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { handleFileUpload } = useFileUpload({
    currentSessionId,
    activeCharacter,
    userId,
    setMessages,
    chatContainerRef
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      handleFileUpload(selectedFile);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AthroMessageList
        messages={messages}
        isLoading={isLoading}
        chatContainerRef={chatContainerRef}
      />
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-grow"
          />
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
            ref={fileInputRef}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Upload
          </Button>
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default AthroChat;

