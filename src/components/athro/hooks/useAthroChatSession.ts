
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useAthro } from "@/contexts/AthroContext";
import { useAuth } from "@/contexts/AuthContext";

export const useAthroChatSession = () => {
  const { activeCharacter } = useAthro();
  const { state: authState } = useAuth();
  const userId = authState.user?.id;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch or create session on mount
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
          const newSessionId = uuidv4();
          await createNewSession(newSessionId);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load or create session."
        });
      }
    };

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
        toast({
          title: "Error",
          description: "Failed to load messages."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
    // eslint-disable-next-line
  }, [userId, activeCharacter?.id]);

  // Send a message
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message."
      });
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    }
  };

  return {
    input,
    setInput,
    messages,
    setMessages,
    isLoading,
    currentSessionId,
    sendMessage,
    activeCharacter,
    userId,
  };
};
