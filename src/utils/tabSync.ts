
/**
 * Tab synchronization utility for Athro AI
 * Handles cross-tab communication and state synchronization
 */

// Define message types for tab synchronization
export type SyncMessageType = 
  | 'SESSION_UPDATE'
  | 'CHARACTER_CHANGE' 
  | 'STUDY_STATE_CHANGE'
  | 'CHAT_HISTORY_UPDATE'
  | 'TAB_HEARTBEAT'
  | 'CONFLICT_RESOLUTION';

export interface SyncMessage {
  type: SyncMessageType;
  tabId: string;
  timestamp: number;
  payload: any;
}

// Generate a unique ID for this tab instance
const generateTabId = (): string => {
  return `tab_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
};

// Create a class to handle tab synchronization
export class TabSyncManager {
  private channel: BroadcastChannel | null = null;
  private tabId: string;
  private listeners: Map<SyncMessageType, ((message: SyncMessage) => void)[]>;
  private isSupported: boolean;
  private heartbeatInterval: number | null = null;
  private activeTabs: Set<string> = new Set();
  
  constructor() {
    this.tabId = generateTabId();
    this.listeners = new Map();
    this.isSupported = typeof BroadcastChannel !== 'undefined';
    
    // Try to initialize BroadcastChannel
    try {
      this.channel = new BroadcastChannel('athro_sync_channel');
      this.setupChannel();
    } catch (error) {
      console.warn('BroadcastChannel not supported, falling back to localStorage polling', error);
      this.isSupported = false;
      this.setupPollingFallback();
    }
    
    // Register this tab
    this.registerTabPresence();
  }
  
  /**
   * Set up BroadcastChannel event listeners
   */
  private setupChannel() {
    if (!this.channel) return;
    
    this.channel.onmessage = (event) => {
      const message = event.data as SyncMessage;
      
      // Update active tabs set
      if (message.type === 'TAB_HEARTBEAT') {
        this.activeTabs.add(message.tabId);
      }
      
      // Process message with registered listeners
      this.processMessage(message);
    };
    
    // Start heartbeat to notify other tabs
    this.startHeartbeat();
  }
  
  /**
   * Set up localStorage polling fallback for browsers without BroadcastChannel
   */
  private setupPollingFallback() {
    // Use localStorage for message passing
    const pollInterval = setInterval(() => {
      try {
        const message = localStorage.getItem('athro_sync_message');
        if (message) {
          const syncMessage = JSON.parse(message) as SyncMessage;
          
          // Only process if it's not our own message
          if (syncMessage.tabId !== this.tabId) {
            this.processMessage(syncMessage);
          }
          
          // Clear message after processing
          localStorage.removeItem('athro_sync_message');
        }
      } catch (error) {
        console.error('Error processing sync message from localStorage:', error);
      }
    }, 1000);
    
    // Clean up interval when window closes
    window.addEventListener('beforeunload', () => {
      clearInterval(pollInterval);
    });
  }
  
  /**
   * Register this tab's presence to other tabs
   */
  private registerTabPresence() {
    // Add self to active tabs
    this.activeTabs.add(this.tabId);
    
    // Send heartbeat to other tabs
    this.sendMessage({
      type: 'TAB_HEARTBEAT',
      tabId: this.tabId,
      timestamp: Date.now(),
      payload: { active: true }
    });
    
    // Unregister when tab closes
    window.addEventListener('beforeunload', () => {
      this.sendMessage({
        type: 'TAB_HEARTBEAT',
        tabId: this.tabId,
        timestamp: Date.now(),
        payload: { active: false }
      });
      
      // If using polling fallback, mark tab as inactive
      if (!this.isSupported) {
        try {
          localStorage.setItem(`athro_tab_${this.tabId}`, 'inactive');
        } catch (error) {
          console.warn('Failed to mark tab as inactive', error);
        }
      }
    });
  }
  
  /**
   * Start sending periodic heartbeats to other tabs
   */
  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      this.sendMessage({
        type: 'TAB_HEARTBEAT',
        tabId: this.tabId,
        timestamp: Date.now(),
        payload: { active: true }
      });
    }, 10000); // Send heartbeat every 10 seconds
    
    // Clean up when window closes
    window.addEventListener('beforeunload', () => {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
    });
  }
  
  /**
   * Process an incoming message and notify listeners
   */
  private processMessage(message: SyncMessage) {
    // Skip our own messages
    if (message.tabId === this.tabId) return;
    
    // Notify all registered listeners for this message type
    const handlers = this.listeners.get(message.type) || [];
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error in sync message handler for ${message.type}:`, error);
      }
    });
  }
  
  /**
   * Send a message to other tabs
   */
  public sendMessage(message: SyncMessage): void {
    if (this.isSupported && this.channel) {
      // Use BroadcastChannel
      this.channel.postMessage(message);
    } else {
      // Use localStorage fallback
      try {
        localStorage.setItem('athro_sync_message', JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send sync message via localStorage:', error);
      }
    }
  }
  
  /**
   * Register a listener for specific message types
   */
  public addListener(type: SyncMessageType, handler: (message: SyncMessage) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    const handlers = this.listeners.get(type)!;
    handlers.push(handler);
    
    // Return function to remove this listener
    return () => {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }
  
  /**
   * Check if multiple tabs are currently active
   */
  public hasMultipleTabs(): boolean {
    // Clean up potentially stale tab IDs
    const now = Date.now();
    const staleTimeout = 30000; // 30 seconds
    
    // Count only tabs that have heartbeated recently
    let activeTabs = 0;
    
    if (this.isSupported) {
      return this.activeTabs.size > 1;
    } else {
      // Use localStorage to check for active tabs
      try {
        const keys = Object.keys(localStorage);
        const tabKeys = keys.filter(key => key.startsWith('athro_tab_'));
        return tabKeys.filter(key => localStorage.getItem(key) === 'active').length > 1;
      } catch (error) {
        console.warn('Error checking active tabs:', error);
        return false;
      }
    }
  }
  
  /**
   * Get this tab's unique ID
   */
  public getTabId(): string {
    return this.tabId;
  }
  
  /**
   * Cleanup resources when no longer needed
   */
  public destroy(): void {
    if (this.channel) {
      this.channel.close();
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.listeners.clear();
  }
}

// Create singleton instance
const tabSyncManager = new TabSyncManager();

export default tabSyncManager;
