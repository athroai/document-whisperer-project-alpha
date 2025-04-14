
import React, { createContext, useContext, useEffect, useState } from 'react';
import { checkFirestoreConnection } from '../config/firebase';

export type FirestoreStatus = 'connected' | 'offline' | 'error' | 'checking';

interface FirestoreStatusContextValue {
  status: FirestoreStatus;
  lastCheck: Date | null;
  retry: () => Promise<FirestoreStatus>;
}

const defaultContextValue: FirestoreStatusContextValue = {
  status: 'checking',
  lastCheck: null,
  retry: async () => 'checking'
};

const FirestoreStatusContext = createContext<FirestoreStatusContextValue>(defaultContextValue);

export const FirestoreStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<FirestoreStatus>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runCheck = async (): Promise<FirestoreStatus> => {
    try {
      console.log("[FirestoreStatusContext] Checking connection...");
      setStatus('checking');
      const result = await checkFirestoreConnection();
      console.log(`[FirestoreStatusContext] Connection status: ${result}`);
      setStatus(result as FirestoreStatus);
      setLastCheck(new Date());
      return result as FirestoreStatus;
    } catch (error) {
      console.error("[FirestoreStatusContext] Error checking connection:", error);
      const newStatus = navigator.onLine ? 'error' : 'offline';
      setStatus(newStatus);
      setLastCheck(new Date());
      return newStatus;
    }
  };

  // Initial check on mount
  useEffect(() => {
    runCheck();

    // Reconnect when browser comes back online
    const handleOnline = () => {
      console.log("[FirestoreStatusContext] Browser reports online, running connection check");
      runCheck();
    };

    // Update status when browser goes offline
    const handleOffline = () => {
      console.log("[FirestoreStatusContext] Browser reports offline");
      setStatus('offline');
      setLastCheck(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <FirestoreStatusContext.Provider value={{ status, lastCheck, retry: runCheck }}>
      {children}
    </FirestoreStatusContext.Provider>
  );
};

export const useFirestoreStatus = () => useContext(FirestoreStatusContext);
