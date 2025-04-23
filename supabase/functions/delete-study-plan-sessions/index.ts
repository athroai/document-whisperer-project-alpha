
// Supabase Edge Function to delete study plan sessions for a user
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteSessionsRequest {
  user_id: string;
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
    const requestData: DeleteSessionsRequest = await req.json();
    const { user_id } = requestData;
    
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
    
    if (eventIds.length > 0) {
      // Step 2: Delete study plan sessions that reference these calendar events
      const { error: deleteError } = await supabaseClient
        .from('study_plan_sessions')
        .delete()
        .in('calendar_event_id', eventIds);
        
      if (deleteError) {
        throw deleteError;
      }
      
      console.log(`Successfully deleted study plan sessions for ${eventIds.length} events`);
    }

    return new Response(
      JSON.stringify({ success: true }),
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
