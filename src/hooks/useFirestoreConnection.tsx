
import { useState, useEffect, useCallback } from 'react';
import { useFirestoreStatus } from '@/contexts/FirestoreStatusContext';
import { useToast } from '@/hooks/use-toast';

export type FirestoreConnectionStatus = 'loading' | 'connected' | 'offline' | 'error';

interface UseFirestoreConnectionOptions {
  showToasts?: boolean;
  suppressInitialToasts?: boolean;
}

/**
 * @deprecated Use useFirestoreStatus from FirestoreStatusContext instead
 * Kept for backward compatibility
 */
export function useFirestoreConnection(options?: UseFirestoreConnectionOptions) {
  const {
    showToasts = true,
    suppressInitialToasts = true
  } = options || {};
  
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { status, lastCheck, retry } = useFirestoreStatus();
  const { toast } = useToast();
  
  // Show toasts when status changes
  useEffect(() => {
    if (!showToasts) return;
    
    if (status === 'connected' && retryCount > 0) {
      toast({
        title: "Connection Restored",
        description: "Successfully connected to Firestore. Your data is now being synced.",
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
    return retry();
  }, [retry]);
  
  return {
    status: status as FirestoreConnectionStatus,
    lastCheck,
    retryCount,
    checkConnection: retry,
    handleRetry,
    isOnline: navigator.onLine
  };
}

export default useFirestoreConnection;
