
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
  // Check if user is offline
  if (!navigator.onLine) {
    return {
      success: false,
      status: 'offline',
      message: 'Your device is offline',
    };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Run a simple Supabase query
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    clearTimeout(timeout);
    const duration = Date.now() - startTime;

    if (error) {
      return {
        success: false,
        status: 'error' as DatabaseStatus,
        error,
        duration,
        message: `Database query failed: ${error.message}`,
        diagnosticInfo: {
          errorCode: error.code,
          details: error.details,
          hint: error.hint,
        },
      };
    }

    return {
      success: true,
      status: 'connected',
      data,
      duration,
      message: `Connected successfully in ${duration}ms`,
    };
  } catch (error: any) {
    clearTimeout(timeout);
    const duration = Date.now() - startTime;
    const isAbort = error.name === 'AbortError';

    return {
      success: false,
      status: isAbort ? 'timeout' : 'error',
      error,
      duration,
      message: isAbort ? `Connection timed out after ${timeoutMs / 1000}s` : error.message,
      isNetworkError: error.name === 'TypeError',
    };
  }
};
