
// Supabase Edge Function to clear calendar events while preserving completed study sessions
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClearCalendarRequest {
  user_id: string;
  preserve_completed: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      // @ts-ignore: Deno specific environment variable access
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore: Deno specific environment variable access
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request data
    const requestData: ClearCalendarRequest = await req.json();
    const { user_id, preserve_completed = true } = requestData;
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Step 1: Get all calendar event IDs for this user
    const { data: calendarEvents, error: calendarError } = await supabaseClient
      .from('calendar_events')
      .select('id')
      .eq('user_id', user_id);
      
    if (calendarError) {
      throw calendarError;
    }

    const eventIds = calendarEvents?.map(event => event.id) || [];
    
    console.log(`Found ${eventIds.length} calendar events for user ${user_id}`);
    
    let deletedCount = 0;
    let preservedCount = 0;
    
    if (eventIds.length > 0) {
      // Step 2: If preserving completed study sessions, get sessions to exclude
      let excludeEventIds: string[] = [];
      
      if (preserve_completed) {
        // Find any calendar events that have associated completed study sessions
        const { data: completedSessions, error: sessionsError } = await supabaseClient
          .from('study_sessions')
          .select('id')
          .eq('student_id', user_id)
          .eq('status', 'completed');
          
        if (sessionsError) {
          console.warn('Error checking for completed sessions:', sessionsError);
        } else if (completedSessions && completedSessions.length > 0) {
          // Get calendar events linked to these sessions
          const completedSessionIds = completedSessions.map(session => session.id);
          
          console.log(`Found ${completedSessionIds.length} completed study sessions`);
          
          // Find calendar events linked to completed study sessions
          // This assumes there's a source_session_id column in calendar_events that links to study_sessions
          const { data: linkedEvents, error: linkedError } = await supabaseClient
            .from('calendar_events')
            .select('id')
            .in('source_session_id', completedSessionIds);
            
          if (linkedError) {
            console.warn('Error finding linked calendar events:', linkedError);
          } else if (linkedEvents) {
            excludeEventIds = linkedEvents.map(event => event.id);
            console.log(`Will preserve ${excludeEventIds.length} calendar events linked to completed sessions`);
            preservedCount = excludeEventIds.length;
          }
        }
      }
      
      // Filter out events to preserve
      const eventIdsToDelete = eventIds.filter(id => !excludeEventIds.includes(id));
      console.log(`Will delete ${eventIdsToDelete.length} calendar events`);
      
      if (eventIdsToDelete.length > 0) {
        // Step 3: Delete study plan sessions that reference these calendar events
        const { error: deleteStudyPlanError } = await supabaseClient
          .from('study_plan_sessions')
          .delete()
          .in('calendar_event_id', eventIdsToDelete);
          
        if (deleteStudyPlanError) {
          console.warn('Error deleting study plan sessions:', deleteStudyPlanError);
          // Continue anyway - some sessions might not have study plan entries
        }
        
        // Step 4: Delete the calendar events
        const { data: deletedEvents, error: deleteError } = await supabaseClient
          .from('calendar_events')
          .delete()
          .in('id', eventIdsToDelete)
          .select();
          
        if (deleteError) {
          throw deleteError;
        }
        
        deletedCount = deletedEvents?.length || 0;
        console.log(`Successfully deleted ${deletedCount} calendar events`);
      } else {
        console.log('No calendar events to delete after applying preservation rules');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        deleted_count: deletedCount,
        preserved_count: preservedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
