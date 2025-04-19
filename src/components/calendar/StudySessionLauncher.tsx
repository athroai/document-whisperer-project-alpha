import { useEffect, useState } from 'react';
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
      
      try {
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
          throw error;
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
            
            // Only prompt for sessions in the next 15 minutes or that started in the last 5
            const startTime = new Date(upcomingSession.start_time);
            
            // Check if within notification window and haven't shown for this session
            const sessionNotified = localStorage.getItem(`notified_session_${upcomingSession.id}`);
            if (!sessionNotified) {
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
    
    // Check immediately on route change to /calendar
    const handleRouteChange = () => {
      if (window.location.pathname === '/calendar' && authState.user?.id) {
        checkForScheduledSessions();
      }
    };
    
    // Add event listener for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Only check for sessions if a user is logged in
    if (authState.user?.id) {
      // Initial check
      checkForScheduledSessions();
      
      // Set up interval - only if user is logged in
      const interval = setInterval(checkForScheduledSessions, 5 * 60000);
      
      // Clean up interval when component unmounts or user logs out
      return () => {
        clearInterval(interval);
        window.removeEventListener('popstate', handleRouteChange);
      };
    } else {
      // Just clean up event listener when component unmounts
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [navigate, toast, authState.user]);
  
  return null; // This is a utility component, not rendering anything
};

export default StudySessionLauncher;
