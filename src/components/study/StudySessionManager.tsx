
import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { AthroCharacter } from '@/types/athro';
import { athroCharacters, getAthroBySubject } from '@/config/athrosConfig';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { verifyAuth } from '@/lib/supabase';

// Ensure these imports are valid based on your project structure
import { useAuth } from '@/contexts/AuthContext';

interface StudySessionManagerProps {
  onSessionStart: (character: AthroCharacter, sessionData: {
    sessionId?: string;
    subject: string;
    topic?: string;
    confidenceBefore?: number;
  }) => void;
}

const StudySessionManager: React.FC<StudySessionManagerProps> = ({
  onSessionStart
}) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { state: authState } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const initializeSessionFromParams = async () => {
      const sessionId = searchParams.get('sessionId');
      const subject = searchParams.get('subject') || 'Mathematics';
      const topic = searchParams.get('topic') || undefined;
      const confidenceParam = searchParams.get('confidence');
      const confidenceBefore = confidenceParam ? parseInt(confidenceParam, 10) : undefined;
      
      console.log('Session parameters:', { sessionId, subject, topic, confidenceBefore });
      
      // Verify authentication first before proceeding
      const authUser = await verifyAuth();
      if (!authUser && !authState.user) {
        toast({
          title: "Authentication Required",
          description: "You need to be signed in to start a study session",
          variant: "destructive",
        });
        return;
      }
      
      // Find the right character for this subject using getAthroBySubject helper
      const character = getAthroBySubject(subject);
      
      if (!character) {
        console.error('No character found for subject:', subject);
        toast({
          title: "Subject Not Found",
          description: `No mentor found for ${subject}. Using Mathematics instead.`,
          variant: "destructive",
        });
        
        // Fall back to Mathematics
        const fallbackChar = getAthroBySubject('Mathematics');
        
        if (fallbackChar) {
          onSessionStart(fallbackChar, { 
            subject: 'Mathematics',
            sessionId,
            topic,
            confidenceBefore: confidenceBefore || 5
          });
        }
        return;
      }
      
      // If this is a saved session, load the confidence value
      let loadedConfidence = confidenceBefore;
      if (sessionId && authState.user && !confidenceBefore) {
        try {
          // Check if this session already exists
          const { data, error } = await supabase
            .from('study_sessions')
            .select('confidence_before')
            .eq('id', sessionId)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Error loading session data:', error);
          } else if (data) {
            loadedConfidence = data.confidence_before;
          }
        } catch (error) {
          console.error('Error checking session:', error);
        }
      }
      
      // If no saved session exists but we have a sessionId, create one
      if (sessionId && authState.user && location.pathname.includes('/study')) {
        try {
          const sessionData = {
            id: sessionId,
            subject,
            topic,
            start_time: new Date().toISOString(),
            student_id: authState.user.id,
            status: 'in_progress',
            confidence_before: loadedConfidence || 5
          };
          
          // Use upsert to update if exists or create if not
          const { error } = await supabase
            .from('study_sessions')
            .upsert(sessionData, {
              onConflict: 'id'
            });
          
          if (error) {
            console.error('Error creating session record:', error);
          }
        } catch (error) {
          console.error('Error creating session:', error);
        }
      }
      
      // Initialize the session with derived confidence value
      onSessionStart(character, {
        sessionId: sessionId || undefined,
        subject,
        topic: topic || undefined,
        confidenceBefore: loadedConfidence || 5
      });
    };
    
    // Only run this when on the study page or when parameters change
    if (location.pathname.includes('/study')) {
      initializeSessionFromParams();
    }
  }, [searchParams, location, onSessionStart, authState.user, toast]);

  return null; // This is a logic component with no visible UI
};

export default StudySessionManager;
