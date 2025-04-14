
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DatabaseStatus = 'checking' | 'connected' | 'offline' | 'error';

interface DatabaseStatusContextType {
  status: DatabaseStatus;
  lastCheck: Date | null;
  retry: () => Promise<DatabaseStatus>;
}

const DatabaseStatusContext = createContext<DatabaseStatusContextType>({
  status: 'checking',
  lastCheck: null,
  retry: async () => 'checking',
});

export const DatabaseStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<DatabaseStatus>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = useCallback(async (): Promise<DatabaseStatus> => {
    if (!navigator.onLine) {
      return 'offline';
    }

    try {
      // Simple test query to check if we can connect to Supabase
      const timeoutPromise = new Promise<DatabaseStatus>((resolve) => {
        setTimeout(() => resolve('error'), 5000); // 5 second timeout
      });
      
      const connectionPromise = (async () => {
        try {
          const { data, error } = await supabase.from('profiles').select('count').limit(1);
          if (error) throw error;
          return data ? 'connected' : 'error';
        } catch (error) {
          console.error("Database connection check failed:", error);
          return navigator.onLine ? 'error' : 'offline';
        }
      })();
      
      // Race between connection check and timeout
      const result = await Promise.race([connectionPromise, timeoutPromise]);
      setLastCheck(new Date());
      setStatus(result);
      return result;
    } catch (error) {
      console.error("Database connection check unexpected error:", error);
      const newStatus = navigator.onLine ? 'error' : 'offline';
      setStatus(newStatus);
      setLastCheck(new Date());
      return newStatus;
    }
  }, []);

  // Check connection when component mounts or online status changes
  useEffect(() => {
    checkConnection();
    
    const handleOnlineStatusChange = () => {
      if (navigator.onLine) {
        checkConnection();
      } else {
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

  // Periodically check connection status (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine && status !== 'checking') {
        checkConnection();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkConnection, status]);

  return (
    <DatabaseStatusContext.Provider value={{
      status,
      lastCheck,
      retry: checkConnection,
    }}>
      {children}
    </DatabaseStatusContext.Provider>
  );
};

export const useDatabaseStatus = () => useContext(DatabaseStatusContext);
