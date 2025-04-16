
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAthro } from '@/contexts/AthroContext';
import { AthroCharacter, AthroSubject } from '@/types/athro';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { athroCharacters } from '@/config/athrosConfig';

interface StudySessionManagerProps {
  onSessionStart: (character: AthroCharacter, sessionData: {
    sessionId?: string;
    subject: string;
    topic?: string;
    confidenceBefore?: number;
  }) => void;
}

const StudySessionManager: React.FC<StudySessionManagerProps> = ({ onSessionStart }) => {
  const { characters } = useAthro();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [confidenceBefore, setConfidenceBefore] = useState<number | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Get query parameters from URL
  const subjectParam = searchParams.get('subject');
  const topicParam = searchParams.get('topic');
  const sessionIdParam = searchParams.get('sessionId');

  // Format the subject to match AthroSubject type
  const formatSubject = (subject: string | null): AthroSubject => {
    if (!subject) return 'Mathematics';

    // Handle common format issues
    subject = subject.trim();
    
    // First letter uppercase, rest lowercase
    subject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
    
    // Special case for "RE" which could come as "re" or "religious education"
    if (subject.toLowerCase() === 're' || subject.toLowerCase() === 'religious education') {
      return 'Religious Education';
    }

    return subject as AthroSubject;
  };

  // Get the character that matches the subject
  const getCharacterForSubject = (subject: AthroSubject): AthroCharacter | undefined => {
    return characters.find(char => char.subject === subject);
  };

  // Initialize session with parameters from URL
  useEffect(() => {
    if (hasInitialized || !subjectParam) return;
    
    const startSession = async () => {
      try {
        const formattedSubject = formatSubject(subjectParam);
        const character = getCharacterForSubject(formattedSubject);
        
        if (!character) {
          toast({
            title: "Subject Not Found",
            description: `Could not find a mentor for ${subjectParam}. Using Mathematics instead.`,
          });
          
          // Default to Mathematics if subject not found
          const mathsCharacter = getCharacterForSubject('Mathematics');
          if (mathsCharacter) {
            onSessionStart(mathsCharacter, { 
              sessionId: sessionIdParam || undefined,
              subject: 'Mathematics',
              topic: topicParam || undefined 
            });
          }
          return;
        }

        // Get student's confidence level for this subject (if available)
        if (sessionIdParam) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('confidence_scores')
            .single();
            
          if (profileData?.confidence_scores && profileData.confidence_scores[formattedSubject]) {
            setConfidenceBefore(profileData.confidence_scores[formattedSubject]);
          }
        }

        // Start the session with the found character
        onSessionStart(character, {
          sessionId: sessionIdParam || undefined,
          subject: formattedSubject,
          topic: topicParam || undefined,
          confidenceBefore: confidenceBefore || undefined
        });
        
        // Update study session record if this is from a calendar event
        if (sessionIdParam) {
          await supabase
            .from('study_sessions')
            .update({ 
              status: 'in_progress',
              confidence_before: confidenceBefore || null
            })
            .eq('id', sessionIdParam);
        }
        
        setHasInitialized(true);
      } catch (error) {
        console.error('Error starting study session:', error);
        toast({
          title: "Session Error",
          description: "There was an error starting your study session.",
          variant: "destructive",
        });
      }
    };

    startSession();
  }, [subjectParam, topicParam, sessionIdParam, hasInitialized, characters, onSessionStart, toast, confidenceBefore]);

  return null; // This is a logic component, not a UI component
};

export default StudySessionManager;
