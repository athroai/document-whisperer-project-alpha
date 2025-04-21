
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { useAthro } from "@/contexts/AthroContext";
import { useAuth } from "@/contexts/AuthContext";

export const useFileUpload = (
  { currentSessionId, activeCharacter, userId, setMessages, chatContainerRef }: any
) => {
  const { toast } = useToast();

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

    setMessages((prev: any) => [...prev, newMessage]);
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

      if (!uploadData?.path) throw new Error('File upload failed');

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
          session_id: currentSessionId,
          character_id: activeCharacter.id
        })
        .select()
        .single();

      if (documentInsertError) throw documentInsertError;
      if (!document) throw new Error('Failed to create document record');

      await supabase
        .from('message_documents')
        .insert({
          message_id: messageId,
          document_id: document.id
        })
        .select()
        .single();

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
      toast({
        title: "Error",
        description: `Failed to upload ${file.name}.`,
        variant: "destructive"
      });
      setMessages((prev: any) => prev.filter((msg: any) => msg.id !== messageId));
    }
  };

  return { handleFileUpload };
};
