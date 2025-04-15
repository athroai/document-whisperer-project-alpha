
import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  try {
    console.log('Running manual connection test...');
    
    // First test: Basic CORS preflight check
    try {
      const preflightResponse = await fetch(
        'https://oqpwgxrqwbgchirnnejj.supabase.co/rest/v1/profiles?select=count', 
        { method: 'OPTIONS' }
      );
      console.log('CORS preflight response:', preflightResponse.status);
    } catch (error) {
      console.error('CORS preflight check failed:', error);
    }
    
    // Second test: Actual Supabase query
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    const duration = Date.now() - startTime;
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, error, duration };
    }
    
    console.log(`Supabase connection test successful (${duration}ms):`, data);
    return { success: true, data, duration };
  } catch (error) {
    console.error('Supabase connection test threw an exception:', error);
    return { success: false, error };
  }
};
