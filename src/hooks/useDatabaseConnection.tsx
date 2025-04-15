
import { useState, useEffect, useCallback } from 'react';
import { useDatabaseStatus } from '@/contexts/DatabaseStatusContext';
import { useToast } from '@/hooks/use-toast';
import { testSupabaseConnection } from '@/services/connectionTest';

export type DatabaseConnectionStatus = 'checking' | 'connected' | 'offline' | 'error' | 'timeout';

interface UseDatabaseConnectionOptions {
  showToasts?: boolean;
  suppressInitialToasts?: boolean;
  timeoutMs?: number;
}

export function useDatabaseConnection(options?: UseDatabaseConnectionOptions) {
  const {
    showToasts = true,
    suppressInitialToasts = true,
    timeoutMs = 20000
  } = options || {};
  
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { status, lastCheck, retry } = useDatabaseStatus();
  const { toast } = useToast();
  
  // Show toasts when status changes
  useEffect(() => {
    if (!showToasts) return;
    
    if (status === 'connected' && retryCount > 0) {
      toast({
        title: "Connection Restored",
        description: "Successfully connected to Supabase. Your data is now being synced.",
        variant: "success",
      });
    } else if ((status === 'error' || status === 'offline' || status === 'timeout') && 
               (!suppressInitialToasts || hasShownInitialToast || retryCount > 0)) {
      
      const statusMessages = {
        'offline': {
          title: "You're Offline",
          description: "Working in offline mode. Your changes will sync when you're back online."
        },
        'error': {
          title: "Supabase Unreachable",
          description: "Having trouble connecting to Supabase. Using local data for now."
        },
        'timeout': {
          title: "Connection Timed Out",
          description: "Connection to Supabase timed out. Using local data for now."
        }
      };
      
      const message = statusMessages[status as keyof typeof statusMessages];
      
      toast({
        title: message.title,
        description: message.description,
        variant: "default",
      });
    }
    
    setHasShownInitialToast(true);
  }, [status, retryCount, showToasts, suppressInitialToasts, hasShownInitialToast, toast]);
  
  const handleRetry = useCallback(async () => {
    setRetryCount(count => count + 1);
    try {
      const result = await testSupabaseConnection(timeoutMs);
      return result.status as DatabaseConnectionStatus;
    } catch (error) {
      return navigator.onLine ? 'error' : 'offline';
    }
  }, [timeoutMs]);
  
  return {
    status,
    lastCheck,
    retryCount,
    checkConnection: handleRetry,
    handleRetry,
    isOnline: navigator.onLine
  };
}

export default useDatabaseConnection;
