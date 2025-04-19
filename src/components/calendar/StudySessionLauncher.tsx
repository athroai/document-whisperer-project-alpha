
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const StudySessionLauncher = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state: authState } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    const checkForScheduledSessions = async () => {
      if (!authState.user?.id) {
        console.log('No authenticated user found, skipping session check');
        return;
      }
      
      // Get current user ID from context
      const userId = authState.user.id;
      console.log('Checking scheduled sessions for user ID:', userId);
      
      // Check Supabase auth status to ensure we're properly authenticated
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Error checking Supabase auth status:', authError);
          return;
        }
        
        if (!user) {
          console.log('No authenticated Supabase user found');
          return;
        }
        
        console.log('Supabase auth confirmed, user ID:', user.id);
        
        // Get current date
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
        const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);
        
        // Query with explicit user ID and RLS will handle permissions
        const { data, error } = await supabase
          .from('calendar_events')
          .select('id, title, description, start_time, end_time, event_type')
          .or(`student_id.eq.${userId},user_id.eq.${userId}`)
          .eq('event_type', 'study_session')
          .gte('start_time', fiveMinutesAgo.toISOString())
          .lte('start_time', fifteenMinutesFromNow.toISOString())
          .order('start_time', { ascending: true });
        
        if (error) {
          console.error('Error fetching calendar events:', error);
          return;
        }
        
        if (data && data.length > 0) {
          console.log('Found upcoming events:', data.length);
          for (const upcomingSession of data) {
            let description: any = {};
            
            try {
              if (upcomingSession.description) {
                description = JSON.parse(upcomingSession.description);
              }
            } catch (e) {
              console.error('Error parsing session description:', e);
            }
            
            // Check if within notification window and haven't shown for this session
            const sessionNotified = localStorage.getItem(`notified_session_${upcomingSession.id}`);
            if (!sessionNotified) {
              const startTime = new Date(upcomingSession.start_time);
              
              toast({
                title: "Scheduled Study Session",
                description: `You have a ${description.subject || ''} session starting at ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                action: (
                  <Button
                    onClick={() => {
                      navigate(`/study?sessionId=${upcomingSession.id}&subject=${description.subject || ''}&topic=${description.topic || ''}`);
                    }}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Start Now
                  </Button>
                ),
                duration: 10000,
              });
              
              // Mark this session as notified
              localStorage.setItem(`notified_session_${upcomingSession.id}`, 'true');
            }
          }
        } else {
          console.log('No upcoming events found for user');
        }
        
        setHasChecked(true);
      } catch (error) {
        console.error('Error checking for scheduled sessions:', error);
        setHasChecked(true);
      }
    };
    
    // Check for sessions if user is logged in
    if (authState.user?.id) {
      checkForScheduledSessions();
      
      // Set up interval using a ref to track it
      checkTimeoutRef.current = setInterval(checkForScheduledSessions, 5 * 60000);
    }
    
    // Clean up interval when component unmounts or user logs out
    return () => {
      if (checkTimeoutRef.current) {
        clearInterval(checkTimeoutRef.current);
        checkTimeoutRef.current = null;
      }
    };
  }, [navigate, toast, authState.user?.id]);
  
  return null; // This is a utility component, not rendering anything
};

export default StudySessionLauncher;
