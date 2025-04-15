
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  
  // Connection timeout in milliseconds (20 seconds)
  const CONNECTION_TIMEOUT = 20000;

  const checkConnection = useCallback(async (): Promise<DatabaseStatus> => {
    console.log('Checking database connection...');
    
    // Check if device is offline first
    if (!navigator.onLine) {
      console.log('Device is offline');
      setError(new Error('You are offline. Please check your internet connection.'));
      return 'offline';
    }

    try {
      // Use the improved testSupabaseConnection function with 20s timeout
      const result = await testSupabaseConnection(CONNECTION_TIMEOUT);
      setLastCheck(new Date());
      
      // Handle different result types
      if (result.success) {
        console.log(`Connection test successful (${result.duration}ms)`);
        setError(null);
        setStatus('connected');
        
        // Show toast only when status changes from error/timeout to connected
        if (status === 'error' || status === 'timeout') {
          toast({
            title: "Connection Restored",
            description: "Successfully connected to database.",
            variant: "success",
          });
        }
        
        return 'connected';
      } else {
        // Handle different error types
        if (result.status === 'offline') {
          console.log('Device is offline');
          setError(new Error('You are offline. Please check your internet connection.'));
          setStatus('offline');
          return 'offline';
        } else if (result.status === 'timeout') {
          console.log(`Connection timed out after ${CONNECTION_TIMEOUT/1000}s`);
          setError(new Error(`Connection timed out after ${CONNECTION_TIMEOUT/1000} seconds. The server might be experiencing high load.`));
          setStatus('timeout');
          return 'timeout';
        } else {
          // General error
          console.error("Connection test error:", result.error);
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

  // Check connection every 2 minutes
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
