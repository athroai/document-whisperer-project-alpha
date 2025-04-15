import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

export type DatabaseStatus = 'connected' | 'offline' | 'error' | 'timeout';

export interface ConnectionTestResult {
  success: boolean;
  status: DatabaseStatus;
  message?: string;
  error?: Error | PostgrestError;
  data?: any;
  duration?: number;
  corsStatus?: number;
  isNetworkError?: boolean;
  diagnosticInfo?: Record<string, any>;
}

export const testSupabaseConnection = async (timeoutMs = 10000): Promise<ConnectionTestResult> => {
  try {
    // Step 1: Check local network state
    if (!navigator.onLine) {
      console.log('🚫 Device is offline');
      return {
        success: false,
        status: 'offline',
        message: 'You are offline. Please check your internet connection.'
      };
    }

    const startTime = Date.now();

    // Step 2: Check Supabase session
    console.log('🔍 Checking Supabase session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('⚠️ Supabase session error:', sessionError);
    }
    if (!sessionData || !sessionData.session) {
      console.warn('🛑 No active Supabase session. Are you logged in?');
    } else {
      console.log('✅ Supabase session exists:', sessionData.session.user);
    }

    // Step 3: Create timeout fallback
    const timeoutPromise = new Promise<ConnectionTestResult>((resolve) => {
      setTimeout(() => {
        console.log(`⏱️ Connection timed out after ${timeoutMs}ms`);
        resolve({
          success: false,
          status: 'timeout',
          message: `Connection timed out after ${timeoutMs / 1000} seconds`
        });
      }, timeoutMs);
    });

    // Step 4: Execute actual Supabase query
    const queryPromise = supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .then(({ data, error }) => {
        const duration = Date.now() - startTime;

        if (error) {
          console.error('🔥 Supabase query error:', error);
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

        console.log(`🎉 Supabase query successful in ${duration}ms`, data);
        return {
          success: true,
          status: 'connected',
          message: `Connected successfully in ${duration}ms`,
          duration,
          data
        };
      });

    // Step 5: Race timeout vs query
    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (error: any) {
    console.error('❌ Unexpected error during connection test:', error);
    return {
      success: false,
      status: 'error',
      error,
      message: error.message || 'Unknown connection test error'
    };
  }
};
