
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type DatabaseStatus = 'checking' | 'connected' | 'offline' | 'error';

interface DatabaseStatusContextType {
  status: DatabaseStatus;
  lastCheck: Date | null;
  retry: () => Promise<DatabaseStatus>;
  error: Error | null;
}

const DatabaseStatusContext = createContext<DatabaseStatusContextType>({
  status: 'checking',
  lastCheck: null,
  retry: async () => 'checking',
  error: null,
});

export const DatabaseStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<DatabaseStatus>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const checkConnection = useCallback(async (): Promise<DatabaseStatus> => {
    if (!navigator.onLine) {
      setError(new Error('You are offline. Please check your internet connection.'));
      return 'offline';
    }

    try {
      // Use shorter timeout to prevent long waiting
      const timeoutPromise = new Promise<DatabaseStatus>((resolve) => {
        setTimeout(() => resolve('error'), 3000); // 3 second timeout
      });
      
      const connectionPromise = (async () => {
        try {
          console.log('Testing connection to Supabase...');
          const { data, error } = await supabase.from('profiles').select('count').limit(1);
          
          if (error) {
            console.error("Connection test error:", error);
            setError(new Error(`Database error: ${error.message}`));
            return 'error';
          }
          
          console.log('Connection test successful:', data);
          setError(null);
          return 'connected';
        } catch (error: any) {
          console.error("Connection test exception:", error);
          setError(error instanceof Error ? error : new Error(String(error)));
          return navigator.onLine ? 'error' : 'offline';
        }
      })();
      
      // Race between connection check and timeout
      const result = await Promise.race([connectionPromise, timeoutPromise]);
      setLastCheck(new Date());
      setStatus(result);
      
      // Show toast only when status changes from error to connected
      if (status === 'error' && result === 'connected') {
        toast({
          title: "Connection Restored",
          description: "Successfully connected to database.",
          variant: "success",
        });
      }
      
      return result;
    } catch (error: any) {
      console.error("Connection check unexpected error:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      const newStatus = navigator.onLine ? 'error' : 'offline';
      setStatus(newStatus);
      setLastCheck(new Date());
      return newStatus;
    }
  }, [status, toast]);

  // Check connection when component mounts
  useEffect(() => {
    console.log('Initial database connection check...');
    checkConnection();
    
    const handleOnlineStatusChange = () => {
      if (navigator.onLine) {
        console.log('Device came online, checking connection...');
        checkConnection();
      } else {
        console.log('Device went offline');
        setStatus('offline');
        setLastCheck(new Date());
      }
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [checkConnection]);

  // Check connection every 2 minutes instead of 5
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine && status !== 'checking') {
        console.log('Periodic connection check...');
        checkConnection();
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkConnection, status]);

  return (
    <DatabaseStatusContext.Provider value={{
      status,
      lastCheck,
      retry: checkConnection,
      error,
    }}>
      {children}
    </DatabaseStatusContext.Provider>
  );
};

export const useDatabaseStatus = () => useContext(DatabaseStatusContext);
