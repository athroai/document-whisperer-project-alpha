
import { useEffect, useState, useCallback } from 'react';
import tabSyncManager, { SyncMessageType, SyncMessage } from '@/utils/tabSync';

interface UseTabSyncOptions {
  onConflict?: () => void;
}

/**
 * React hook for synchronizing state across browser tabs
 * @param messageType Type of messages to listen for
 * @param options Configuration options
 */
export function useTabSync<T = any>(
  messageType: SyncMessageType,
  options?: UseTabSyncOptions
) {
  const [hasMultipleTabs, setHasMultipleTabs] = useState(false);
  const [lastMessage, setLastMessage] = useState<SyncMessage | null>(null);
  const [tabId] = useState(() => tabSyncManager.getTabId());
  
  // Check for multiple tabs on mount
  useEffect(() => {
    const checkMultipleTabs = () => {
      const multiple = tabSyncManager.hasMultipleTabs();
      setHasMultipleTabs(multiple);
      
      // Call onConflict callback if provided and multiple tabs detected
      if (multiple && options?.onConflict) {
        options.onConflict();
      }
    };
    
    // Check immediately
    checkMultipleTabs();
    
    // Listen for tab heartbeat messages to update multiple tabs state
    const removeListener = tabSyncManager.addListener('TAB_HEARTBEAT', () => {
      checkMultipleTabs();
    });
    
    return () => {
      removeListener();
    };
  }, [options]);
  
  // Set up listener for the specific message type
  useEffect(() => {
    const handleMessage = (message: SyncMessage) => {
      // Update last received message
      setLastMessage(message);
    };
    
    const removeListener = tabSyncManager.addListener(messageType, handleMessage);
    
    return () => {
      removeListener();
    };
  }, [messageType]);
  
  // Function to send messages of the specified type
  const sendMessage = useCallback(
    (payload: T) => {
      const message: SyncMessage = {
        type: messageType,
        tabId,
        timestamp: Date.now(),
        payload
      };
      
      tabSyncManager.sendMessage(message);
    },
    [messageType, tabId]
  );
  
  return {
    hasMultipleTabs,
    lastMessage,
    sendMessage,
    tabId
  };
}

export default useTabSync;
