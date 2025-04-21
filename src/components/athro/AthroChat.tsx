
import React, { useState, useEffect, useRef } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useSessionCreation } from '@/hooks/calendar/useSessionCreation';

const AthroChat = () => {
  const { activeCharacter } = useAthro();
  const { state: authState } = useAuth();
  const userId = authState.user?.id;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { createEvent } = useCalendarEvents();
  const { createCalendarSession } = useSessionCreation();

  useEffect(() => {
    if (!userId || !activeCharacter) return;

    const fetchSession = async () => {
      try {
        const { data: session, error } = await supabase
          .from('sessions')
          .select('id')
          .eq('student_id', userId)
          .eq('character_id', activeCharacter.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        if (session) {
          setCurrentSessionId(session.id);
          fetchMessages(session.id);
        } else {
          // Create a new session if none exists
          const newSessionId = uuidv4();
          await createNewSession(newSessionId);
        }
      } catch (error: any) {
        console.error("Error fetching or creating session:", error);
        toast({
          title: "Error",
          description: "Failed to load or create session."
        });
      }
    };

    fetchSession();
  }, [userId, activeCharacter]);

  const createNewSession = async (sessionId: string) => {
    if (!userId || !activeCharacter) return;
    try {
      const { error } = await supabase
        .from('sessions')
        .insert({
          id: sessionId,
          student_id: userId,
          character_id: activeCharacter.id,
          start_time: new Date().toISOString()
        });

      if (error) throw error;
      setCurrentSessionId(sessionId);
    } catch (error: any) {
      console.error("Error creating new session:", error);
      toast({
        title: "Error",
        description: "Failed to create new session."
      });
    }
  };

  const fetchMessages = async (sessionId: string) => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages."
      });
    } finally {
      setIsLoading(false);
      // Scroll to bottom after messages are loaded
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId || !activeCharacter || !currentSessionId) return;

    const messageId = uuidv4();
    const newMessage = {
      id: messageId,
      session_id: currentSessionId,
      sender_id: userId,
      content: input,
      created_at: new Date().toISOString(),
      character_id: activeCharacter.id,
      is_student: true
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInput('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          session_id: currentSessionId,
          sender_id: userId,
          content: input,
          character_id: activeCharacter.id,
          is_student: true
        });

      if (error) throw error;

      // Optimistically scroll to bottom
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);

    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message."
      });
      // Revert the message on failure
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !userId || !activeCharacter || !currentSessionId) return;

    const messageId = uuidv4();
    const newMessage = {
      id: messageId,
      session_id: currentSessionId,
      sender_id: userId,
      content: `Uploaded file: ${file.name}`,
      created_at: new Date().toISOString(),
      character_id: activeCharacter.id,
      is_student: true,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);

    const storagePath = `documents/${userId}/${currentSessionId}/${file.name}`;

    try {
      const { data: uploadData, error: uploadStorageError } = await supabase
        .storage
        .from('documents')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadStorageError) throw uploadStorageError;

      if (!uploadData?.path) {
        throw new Error('File upload failed');
      }
      
      const { data: document, error: documentInsertError } = await supabase
        .from('documents')
        .insert({
          filename: file.name,
          original_name: file.name,
          mime_type: file.type,
          size: file.size,
          file_type: file.type.split('/')[1] || 'unknown',
          storage_path: storagePath,
          user_id: userId,
          session_id: currentSessionId || 'temp-session',
          character_id: activeCharacter?.id || 'default',
        })
        .select()
        .single();

      if (documentInsertError) throw documentInsertError;
      
      if (!document) {
        throw new Error('Failed to create document record');
      }
      
      // Now document.id exists because we got it from the database
      const messageDoc = await supabase
        .from('message_documents')
        .insert({
          message_id: messageId,
          document_id: document.id
        })
        .select()
        .single();

      // Scroll to bottom after file is uploaded
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully!`
      });
    } catch (error: any) {
      console.error("File upload error:", error);
      toast({
        title: "Error",
        description: `Failed to upload ${file.name}.`,
        variant: "destructive"
      });
      // Revert the message on failure
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    } finally {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      handleFileUpload(selectedFile);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={chatContainerRef} className="flex-grow p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.is_student ? 'justify-start' : 'justify-end'}`}>
              <div className="flex flex-col">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/images/characters/${activeCharacter?.avatarUrl}`} alt={activeCharacter?.name} />
                  <AvatarFallback>{activeCharacter?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-xs text-gray-500">{message.is_student ? 'You' : activeCharacter?.name}</div>
              </div>
              <div className={`ml-2 p-3 rounded-lg ${message.is_student ? 'bg-gray-100 text-gray-800' : 'bg-purple-200 text-purple-800'}`}>
                {message.content}
                {message.file_name && (
                  <p className="text-xs mt-1">
                    File: {message.file_name} ({message.file_size} bytes, {message.file_type})
                  </p>
                )}
              </div>
            </div>
          ))}
          {isLoading && <div className="text-center">Loading messages...</div>}
        </div>
      </ScrollArea>

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
