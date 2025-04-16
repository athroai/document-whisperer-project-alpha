
import { useState } from 'react';
import { AthroMessage } from '@/types/athro';
import { getOpenAIResponse } from '@/lib/openai';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export type ConfidenceChange = 'much_better' | 'slightly_better' | 'no_change' | 'still_unsure';

interface UseSessionFeedbackProps {
  sessionId?: string;
  subject: string;
  topic?: string;
  messages: AthroMessage[];
  confidenceBefore?: number;
  onSessionEnd: () => void;
}

export function useSessionFeedback({
  sessionId,
  subject,
  topic,
  messages,
  confidenceBefore,
  onSessionEnd
}: UseSessionFeedbackProps) {
  const [isEnding, setIsEnding] = useState(false);
  const [confidenceChange, setConfidenceChange] = useState<ConfidenceChange>("slightly_better");
  const [feedback, setFeedback] = useState('');
  const [sessionSummary, setSessionSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const { toast } = useToast();

  // Map confidence change selection to numeric value
  const getConfidenceAfterValue = (): number => {
    if (!confidenceBefore) return 5; // Default if no prior confidence
    
    switch (confidenceChange) {
      case 'much_better':
        return Math.min(confidenceBefore + 3, 10);
      case 'slightly_better':
        return Math.min(confidenceBefore + 1, 10);
      case 'no_change':
        return confidenceBefore;
      case 'still_unsure':
        return Math.max(confidenceBefore - 1, 1);
      default:
        return confidenceBefore;
    }
  };

  const handleEndSession = async () => {
    setIsEnding(true);
    
    if (messages.length > 0) {
      await generateSessionSummary();
    }
  };

  const generateSessionSummary = async () => {
    if (messages.length === 0) return;
    
    setIsGeneratingSummary(true);
    
    try {
      // Create a transcript from the messages for the AI to summarize
      const chatLogText = messages
        .map(msg => `${msg.senderId === 'user' ? 'Student' : 'Athro'}: ${msg.content}`)
        .join('\n\n');
      
      // Create a prompt for the AI to generate a summary
      const summaryPrompt = `
You are an educational assessment AI. Below is a transcript from a study session about ${subject}${topic ? ` on ${topic}` : ''}.

Summarize this study session in 3 bullet points. Highlight what was covered, what the student struggled with (if apparent), and what they understood well.

Transcript:
${chatLogText}

Format your response as 3 concise bullet points.`;

      // Get summary from OpenAI
      const summary = await getOpenAIResponse({
        systemPrompt: "You are an educational assessment AI that provides short, concise summaries of study sessions.",
        userMessage: summaryPrompt,
      });
      
      setSessionSummary(summary || "Unable to generate summary.");
    } catch (error) {
      console.error('Error generating session summary:', error);
      setSessionSummary("Unable to generate session summary due to an error.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCancelFeedback = () => {
    setIsEnding(false);
  };
  
  return {
    isEnding,
    confidenceChange,
    setConfidenceChange,
    feedback,
    setFeedback,
    sessionSummary, 
    isGeneratingSummary,
    handleEndSession,
    handleCancelFeedback,
    getConfidenceAfterValue
  };
}
