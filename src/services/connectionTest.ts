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

export const testSupabaseConnection = async (timeoutMs = 20000): Promise<ConnectionTestResult> => {
  try {
    if (!navigator.onLine) {
      return { 
        success: false, 
        status: 'offline',
        message: 'Your device is offline'
      };
    }

    const startTime = Date.now();

    const timeoutPromise: Promise<ConnectionTestResult> = new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          status: 'timeout',
          message: `Connection timed out after ${timeoutMs / 1000} seconds`
        });
      }, timeoutMs);
    });

    const queryPromise: Promise<ConnectionTestResult> = supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .then(({ data, error }) => {
        const duration = Date.now() - startTime;

        if (error) {
          return {
            success: false,
            status: 'error', // ✅ Must match DatabaseStatus
            error,
            message: `Database query failed: ${error.message}`,
            duration,
            diagnosticInfo: {
              errorCode: error.code,
              details: error.details,
              hint: error.hint
            }
          } as ConnectionTestResult;
        }

        return {
          success: true,
          status: 'connected', // ✅ Must match DatabaseStatus
          data,
          duration,
          message: `Connected successfully in ${duration}ms`
        } as ConnectionTestResult;
      });

    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (error: any) {
    return {
      success: false,
      status: 'error', // ✅ Must match DatabaseStatus
      error,
      message: error.message || 'Unknown error during connection test'
    };
  }
};
