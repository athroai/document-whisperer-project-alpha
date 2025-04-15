
import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  try {
    console.log('Running comprehensive connection test...');
    
    // Test 1: Check if we're online
    if (!navigator.onLine) {
      console.log('Device is offline');
      return { success: false, error: new Error('Your device is offline'), networkStatus: 'offline' };
    }
    
    // Test 2: Basic CORS preflight check
    let corsStatus = null;
    try {
      console.log('Testing CORS preflight...');
      const preflightResponse = await fetch(
        'https://oqpwgxrqwbgchirnnejj.supabase.co/rest/v1/', 
        { method: 'OPTIONS' }
      );
      corsStatus = preflightResponse.status;
      console.log('CORS preflight response:', corsStatus);
    } catch (error) {
      console.error('CORS preflight check failed:', error);
      return {
        success: false,
        error,
        message: 'CORS preflight check failed - your browser may be blocking requests',
        diagnosticInfo: {
          corsError: true,
          error: String(error)
        }
      };
    }
    
    // Test 3: Test auth status (without relying on database query)
    console.log('Testing auth endpoints...');
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Auth endpoint test failed:', sessionError);
      } else {
        console.log('Auth endpoint test succeeded');
      }
    } catch (authError) {
      console.error('Auth API test threw exception:', authError);
    }
    
    // Test 4: Actual Supabase database query
    console.log('Testing database query...');
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    const duration = Date.now() - startTime;
    
    if (error) {
      console.error('Supabase database query failed:', error);
      return { 
        success: false, 
        error, 
        message: `Database query failed: ${error.message}`,
        duration,
        corsStatus,
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
      data, 
      duration, 
      corsStatus,
      message: `Connected successfully in ${duration}ms` 
    };
  } catch (error: any) {
    console.error('Supabase connection test threw an exception:', error);
    return { 
      success: false, 
      error,
      message: error.message || 'Unknown error during connection test'
    };
  }
};
