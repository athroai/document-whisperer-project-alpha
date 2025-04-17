
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const StudySessionLauncher = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state: authState } = useAuth();
  
  useEffect(() => {
    const checkForScheduledSessions = async () => {
      if (!authState.user || !authState.user.id) return;
      
      // Get current date
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);
      
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('id, title, description, start_time, event_type')
          .eq('student_id', authState.user.id)
          .eq('event_type', 'study_session')
          .gte('start_time', fiveMinutesAgo.toISOString())
          .lte('start_time', fifteenMinutesFromNow.toISOString())
          .order('start_time', { ascending: true });
        
        if (error) throw error;
        
        // If there's a session starting soon or just started
        if (data && data.length > 0) {
          const upcomingSession = data[0];
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
                <button
                  onClick={() => {
                    navigate(`/study?sessionId=${upcomingSession.id}&subject=${description.subject || ''}&topic=${description.topic || ''}`);
                  }}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-xs"
                >
                  Start Now
                </button>
              ),
              duration: 10000,
            });
            
            // Mark this session as notified
            localStorage.setItem(`notified_session_${upcomingSession.id}`, 'true');
          }
        }
      } catch (error) {
        console.error('Error checking for scheduled sessions:', error);
      }
    };
    
    // Check immediately and then every 5 minutes
    checkForScheduledSessions();
    const interval = setInterval(checkForScheduledSessions, 5 * 60000);
    
    return () => clearInterval(interval);
  }, [navigate, toast, authState.user]);
  
  return null; // This is a utility component, not rendering anything
};

export default StudySessionLauncher;
