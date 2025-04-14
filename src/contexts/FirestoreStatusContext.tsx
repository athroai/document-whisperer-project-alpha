
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { checkFirestoreConnection } from '../config/firebase';

export type FirestoreStatus = 'checking' | 'connected' | 'offline' | 'error';

interface FirestoreStatusContextType {
  status: FirestoreStatus;
  lastCheck: Date | null;
  retry: () => Promise<FirestoreStatus>;
}

const FirestoreStatusContext = createContext<FirestoreStatusContextType>({
  status: 'checking',
  lastCheck: null,
  retry: async () => 'checking',
});

export const FirestoreStatusProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [status, setStatus] = useState<FirestoreStatus>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = useCallback(async () => {
    setStatus('checking');
    try {
      const result = await checkFirestoreConnection();
      setStatus(result);
      if (result === 'connected') {
        setLastCheck(new Date());
      }
      return result;
    } catch (error) {
      console.error('Error checking Firestore connection:', error);
      setStatus('error');
      return 'error' as FirestoreStatus;
    }
  }, []);

  useEffect(() => {
    const runCheck = async () => {
      await checkConnection();
    };

    runCheck();

    // Check again if browser comes back online
    const handleOnline = () => {
      console.log('Browser is online, checking Firestore connection...');
      checkConnection();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [checkConnection]);

  const retry = useCallback(async () => {
    console.log('Manually retrying Firestore connection...');
    return await checkConnection();
  }, [checkConnection]);

  const contextValue = {
    status,
    lastCheck,
    retry
  };

  return (
    <FirestoreStatusContext.Provider value={contextValue}>
      {children}
    </FirestoreStatusContext.Provider>
  );
};

export const useFirestoreStatus = () => useContext(FirestoreStatusContext);

export default FirestoreStatusContext;
