
import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async (timeoutMs = 20000) => {
  try {
    console.log('Running comprehensive connection test...');
    
    // Check if we're online first
    if (!navigator.onLine) {
      console.log('Device is offline');
      return { 
        success: false, 
        status: 'offline',
        message: 'Your device is offline'
      };
    }
    
    // Add timeout to prevent hanging
    let timeoutReached = false;
    const timeoutPromise = new Promise(resolve => {
      setTimeout(() => {
        timeoutReached = true;
        resolve({
          success: false,
          status: 'timeout',
          message: `Connection timed out after ${timeoutMs/1000} seconds`
        });
      }, timeoutMs);
    });
    
    // Actual Supabase database query
    console.log(`Testing database query with ${timeoutMs/1000}s timeout...`);
    const startTime = Date.now();
    
    const queryPromise = supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .then(({ data, error }) => {
        const duration = Date.now() - startTime;
        
        if (error) {
          console.error('Supabase database query failed:', error);
          return { 
            success: false, 
            status: 'error',
            error, 
            message: `Database query failed: ${error.message}`,
            duration,
            diagnosticInfo: {
              errorCode: error.code,
              details: error.details,
              hint: error.hint
            }
          };
        }
        
        console.log(`Supabase connection test successful (${duration}ms):`, data);
        return { 
          success: true, 
          status: 'connected',
          data, 
          duration, 
          message: `Connected successfully in ${duration}ms` 
        };
      });
    
    // Race between the query and timeout
    const result = await Promise.race([queryPromise, timeoutPromise]);
    return result;
  } catch (error: any) {
    console.error('Supabase connection test threw an exception:', error);
    return { 
      success: false,
      status: 'error',
      error,
      message: error.message || 'Unknown error during connection test'
    };
  }
};
