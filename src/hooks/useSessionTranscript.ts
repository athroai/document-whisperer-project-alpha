
import { useEffect } from 'react';
import { AthroMessage } from '@/types/athro';
import { supabase } from '@/lib/supabase';

interface UseSessionTranscriptProps {
  sessionId?: string;
  messages: AthroMessage[];
}

export function useSessionTranscript({ sessionId, messages }: UseSessionTranscriptProps) {
  // Record transcript periodically when new messages come in
  useEffect(() => {
    if (!sessionId || messages.length === 0) return;
    
    const saveTranscript = async () => {
      try {
        const transcript = messages.map(msg => ({
          role: msg.senderId === 'user' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: msg.timestamp
        }));

        await supabase
          .from('study_sessions')
          .update({ 
            transcript: JSON.stringify(transcript),
            last_updated: new Date().toISOString()
          })
          .eq('id', sessionId);
      } catch (error) {
        console.error('Error saving transcript:', error);
      }
    };

    // Debounce the save to avoid excessive database calls
    const timeoutId = setTimeout(saveTranscript, 2000);
    return () => clearTimeout(timeoutId);
  }, [sessionId, messages]);
}
