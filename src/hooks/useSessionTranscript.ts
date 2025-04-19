
import { useEffect } from 'react';
import { AthroMessage } from '@/types/athro';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UseSessionTranscriptProps {
  sessionId?: string;
  messages: AthroMessage[];
}

export function useSessionTranscript({
  sessionId,
  messages
}: UseSessionTranscriptProps) {
  const { state } = useAuth();

  // Save messages to the session transcript periodically
  useEffect(() => {
    if (!sessionId || !state.user || messages.length === 0) return;
    
    const saveTranscript = async () => {
      try {
        const transcript = messages.map(msg => ({
          role: msg.role || (msg.senderId === 'user' ? 'user' : 'assistant'),
          content: msg.content,
          timestamp: msg.timestamp
        }));
        
        const { error } = await supabase
          .from('study_sessions')
          .update({
            transcript: JSON.stringify(transcript)
          })
          .eq('id', sessionId);
          
        if (error) {
          console.error('Error saving transcript:', error);
        }
      } catch (error) {
        console.error('Error in transcript save:', error);
      }
    };
    
    // Save transcript when messages change, but not too frequently
    const handler = setTimeout(saveTranscript, 2000);
    
    return () => {
      clearTimeout(handler);
    };
  }, [sessionId, messages, state.user]);

  return null;
}
