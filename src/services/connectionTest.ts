
import { supabase } from '@/integrations/supabase/client';

export interface ConnectionTestResult {
  success: boolean;
  status?: 'connected' | 'offline' | 'error' | 'timeout';
  error?: Error;
  message?: string;
  data?: any;
  duration?: number;
  corsStatus?: number;
  isNetworkError?: boolean;
  diagnosticInfo?: Record<string, any>;
}

export const testSupabaseConnection = async (timeoutMs = 20000): Promise<ConnectionTestResult> => {
  try {
    console.log('Running comprehensive connection test...');
    
    // Check if we're online first
    if (!navigator.onLine) {
      return { 
        success: false, 
        status: 'offline',
        message: 'Your device is offline'
      };
    }
    
    const startTime = Date.now();
    
    // Timeout promise
    const timeoutPromise = new Promise<ConnectionTestResult>((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          status: 'timeout',
          message: `Connection timed out after ${timeoutMs/1000} seconds`
        });
      }, timeoutMs);
    });
    
    // Actual Supabase database query
    const queryPromise = supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .then(({ data, error }) => {
        const duration = Date.now() - startTime;
        
        if (error) {
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
        
        return { 
          success: true, 
          status: 'connected',
          data, 
          duration, 
          message: `Connected successfully in ${duration}ms` 
        };
      });
    
    // Race between the query and timeout
    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (error: any) {
    return { 
      success: false,
      status: 'error',
      error,
      message: error.message || 'Unknown error during connection test'
    };
  }
};
