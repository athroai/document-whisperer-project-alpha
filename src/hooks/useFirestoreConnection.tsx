
import { useState, useEffect, useCallback } from 'react';
import { checkFirestoreConnection } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';

export type FirestoreConnectionStatus = 'loading' | 'connected' | 'offline' | 'error';

interface UseFirestoreConnectionOptions {
  autoRetryOnNetworkChange?: boolean;
  retryInterval?: number;
  showToasts?: boolean;
  suppressInitialToasts?: boolean;
}

/**
 * Hook for managing Firestore connection status with automatic retries
 */
export function useFirestoreConnection(options?: UseFirestoreConnectionOptions) {
  const {
    autoRetryOnNetworkChange = true,
    retryInterval = 30000, // 30 seconds
    showToasts = true,
    suppressInitialToasts = true
  } = options || {};
  
  const [status, setStatus] = useState<FirestoreConnectionStatus>('loading');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);
  const { toast } = useToast();
  
  const checkConnection = useCallback(async () => {
    try {
      setStatus('loading');
      const connectionStatus = await checkFirestoreConnection();
      setStatus(connectionStatus as FirestoreConnectionStatus);
      setLastCheck(new Date());
      
      // Only show toast if it's a retry or initial toasts aren't suppressed
      if (showToasts && (!suppressInitialToasts || hasShownInitialToast || retryCount > 0)) {
        if (connectionStatus === 'connected' && retryCount > 0) {
          toast({
            title: "Connection Restored",
            description: "Successfully connected to Firestore. Your data is now being synced.",
            variant: "default",
          });
        } else if ((connectionStatus === 'error' || connectionStatus === 'offline')) {
          toast({
            title: connectionStatus === 'offline' ? "You're Offline" : "Connection Error",
            description: connectionStatus === 'offline' 
              ? "Working in offline mode. Your changes will sync when you're back online."
              : "Having trouble connecting to the database. Using local data for now.",
            variant: "default",
          });
        }
      }
      
      // Mark that we've shown at least one toast
      setHasShownInitialToast(true);
      
      // Reset retry count on success
      if (connectionStatus === 'connected') {
        setRetryCount(0);
      }
      
      return connectionStatus;
    } catch (error) {
      console.error("Error checking Firestore connection:", error);
      const newStatus = navigator.onLine ? 'error' : 'offline';
      setStatus(newStatus);
      setLastCheck(new Date());
      return newStatus;
    }
  }, [retryCount, showToasts, suppressInitialToasts, hasShownInitialToast, toast]);
  
  // Handle retry
  const handleRetry = useCallback(async () => {
    setRetryCount(count => count + 1);
    return checkConnection();
  }, [checkConnection]);
  
  // Check connection on mount and network status changes
  useEffect(() => {
    let timeoutId: number | undefined;
    
    const handleOnline = () => {
      if (autoRetryOnNetworkChange) {
        console.log('[Network] Browser reports online status, checking connection');
        checkConnection();
      }
    };
    
    const handleOffline = () => {
      console.log('[Network] Browser reports offline status');
      setStatus('offline');
      setLastCheck(new Date());
    };
    
    // Initial check
    checkConnection();
    
    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set up periodic retry if in error state
    if (retryInterval > 0) {
      timeoutId = window.setInterval(() => {
        if (status === 'error' && navigator.onLine) {
          console.log(`[Firestore] Auto-retrying connection after ${retryInterval/1000}s`);
          checkConnection();
        }
      }, retryInterval);
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeoutId) {
        clearInterval(timeoutId);
      }
    };
  }, [autoRetryOnNetworkChange, checkConnection, retryInterval, status]);
  
  return {
    status,
    lastCheck,
    retryCount,
    checkConnection,
    handleRetry,
    isOnline: navigator.onLine
  };
}

export default useFirestoreConnection;
