
import { useState, useEffect, useCallback } from 'react';
import { useDatabaseStatus } from '@/contexts/DatabaseStatusContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type DatabaseConnectionStatus = 'checking' | 'connected' | 'offline' | 'error';

interface UseDatabaseConnectionOptions {
  showToasts?: boolean;
  suppressInitialToasts?: boolean;
}

export function useDatabaseConnection(options?: UseDatabaseConnectionOptions) {
  const {
    showToasts = true,
    suppressInitialToasts = true
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
        description: "Successfully connected to the database. Your data is now being synced.",
        variant: "default",
      });
    } else if ((status === 'error' || status === 'offline') && (!suppressInitialToasts || hasShownInitialToast || retryCount > 0)) {
      toast({
        title: status === 'offline' ? "You're Offline" : "Connection Error",
        description: status === 'offline' 
          ? "Working in offline mode. Your changes will sync when you're back online."
          : "Having trouble connecting to the database. Using local data for now.",
        variant: "default",
      });
    }
    
    setHasShownInitialToast(true);
  }, [status, retryCount, showToasts, suppressInitialToasts, hasShownInitialToast, toast]);
  
  const handleRetry = useCallback(async () => {
    setRetryCount(count => count + 1);
    try {
      const { data } = await supabase.from('profiles').select('count').limit(1);
      return data ? 'connected' : 'error';
    } catch (error) {
      return navigator.onLine ? 'error' : 'offline';
    }
  }, []);
  
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

// For backward compatibility
export const useFirestoreConnection = useDatabaseConnection;
