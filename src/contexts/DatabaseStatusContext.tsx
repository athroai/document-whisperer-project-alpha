
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { testSupabaseConnection } from '@/services/connectionTest';

export type DatabaseStatus = 'checking' | 'connected' | 'offline' | 'error' | 'timeout';

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
  
  const CONNECTION_TIMEOUT = 20000;

  const checkConnection = useCallback(async (): Promise<DatabaseStatus> => {
    console.log('Checking database connection...');
    
    // Check if device is offline first
    if (!navigator.onLine) {
      setError(new Error('You are offline. Please check your internet connection.'));
      setStatus('offline');
      setLastCheck(new Date());
      return 'offline';
    }

    try {
      const result = await testSupabaseConnection(CONNECTION_TIMEOUT);
      setLastCheck(new Date());
      
      if (result.success) {
        console.log(`Connection test successful (${result.duration}ms)`);
        setError(null);
        setStatus('connected');
        
        if (status === 'error' || status === 'timeout') {
          toast({
            title: "Connection Restored",
            description: "Successfully connected to database.",
            variant: "success",
          });
        }
        
        return 'connected';
      } else {
        if (result.status === 'offline') {
          setError(new Error('You are offline. Please check your internet connection.'));
          setStatus('offline');
          return 'offline';
        } else if (result.status === 'timeout') {
          setError(new Error(`Connection timed out after ${CONNECTION_TIMEOUT/1000} seconds.`));
          setStatus('timeout');
          return 'timeout';
        } else {
          setError(new Error(result.message || 'Database connection error'));
          setStatus('error');
          return 'error';
        }
      }
    } catch (error: any) {
      console.error("Connection check unexpected error:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      setStatus('error');
      setLastCheck(new Date());
      return 'error';
    }
  }, [status, toast, CONNECTION_TIMEOUT]);

  // Initial connection check
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

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [checkConnection]);

  // Check connection periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine && status !== 'checking') {
        checkConnection();
      }
    }, 2 * 60 * 1000); // Every 2 minutes

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
