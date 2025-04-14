/**
 * Study session manager for Athro AI
 * Handles tracking and persistence of study session data
 */

import persistentStorage from '@/services/persistentStorage';
import tabSyncManager from '@/utils/tabSync';

export interface StudySessionContext {
  subject: string;
  entryMode: 'assigned' | 'selfStudy';
  startedAt: number;
  taskId: string | null;
  taskTitle: string | null;
  lastActive: number; // Timestamp of last activity
  tabId?: string; // ID of the tab that created this session
}

// Storage keys
const STORAGE_KEY = 'athro_study_session_context';

// Start a new study session
export const startStudySession = async (userId: string, context: StudySessionContext): Promise<boolean> => {
  try {
    // Add tab ID and last active timestamp to context
    const enhancedContext: StudySessionContext = {
      ...context,
      lastActive: Date.now(),
      tabId: tabSyncManager.getTabId()
    };
    
    // Store in both sessionStorage (for quick access) and persistentStorage (for cross-tab sync)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(enhancedContext));
    
    // Store in persistent storage
    const result = await persistentStorage.saveStudySession(userId, enhancedContext);
    
    // Notify other tabs
    tabSyncManager.sendMessage({
      type: 'STUDY_STATE_CHANGE',
      tabId: tabSyncManager.getTabId(),
      timestamp: Date.now(),
      payload: { action: 'start', context: enhancedContext }
    });
    
    console.log('Study session context saved:', enhancedContext);
    return result.success;
  } catch (error) {
    console.error('Failed to save study session context:', error);
    return false;
  }
};

// Get the current study session context
export const getStudySessionContext = async (userId: string): Promise<StudySessionContext | null> => {
  try {
    // Try session storage first for performance
    const sessionData = sessionStorage.getItem(STORAGE_KEY);
    
    if (sessionData) {
      return JSON.parse(sessionData) as StudySessionContext;
    }
    
    // If not in session storage, try persistent storage
    const result = await persistentStorage.getStudySession<StudySessionContext>(userId);
    
    if (result.success && result.data) {
      const context = result.data;
      
      // Update the session storage for quick access
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context));
      
      return context;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to retrieve study session context:', error);
    return null;
  }
};

// Update the current session context
export const updateStudySessionContext = async (
  userId: string,
  updates: Partial<StudySessionContext>
): Promise<boolean> => {
  try {
    const existingContext = await getStudySessionContext(userId);
    
    if (!existingContext) {
      return false;
    }
    
    const updatedContext: StudySessionContext = {
      ...existingContext,
      ...updates,
      lastActive: Date.now()
    };
    
    // Update both storages
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContext));
    const result = await persistentStorage.saveStudySession(userId, updatedContext);
    
    // Notify other tabs
    tabSyncManager.sendMessage({
      type: 'STUDY_STATE_CHANGE',
      tabId: tabSyncManager.getTabId(),
      timestamp: Date.now(),
      payload: { action: 'update', context: updatedContext }
    });
    
    return result.success;
  } catch (error) {
    console.error('Failed to update study session context:', error);
    return false;
  }
};

// Clear the study session context
export const clearStudySessionContext = async (userId: string): Promise<boolean> => {
  try {
    // Clear from session storage
    sessionStorage.removeItem(STORAGE_KEY);
    
    // Clear from persistent storage
    const result = await persistentStorage.saveStudySession(userId, null);
    
    // Notify other tabs
    tabSyncManager.sendMessage({
      type: 'STUDY_STATE_CHANGE',
      tabId: tabSyncManager.getTabId(),
      timestamp: Date.now(),
      payload: { action: 'clear' }
    });
    
    console.log('Study session context cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear study session context:', error);
    return false;
  }
};

// Check if the user is currently in a study session
export const isInStudySession = async (userId: string): Promise<boolean> => {
  const context = await getStudySessionContext(userId);
  return !!context;
};

// Update the last active timestamp to keep the session alive
export const keepStudySessionAlive = async (userId: string): Promise<void> => {
  try {
    const context = await getStudySessionContext(userId);
    
    if (context) {
      await updateStudySessionContext(userId, {
        lastActive: Date.now()
      });
    }
  } catch (error) {
    console.error('Failed to update study session activity:', error);
  }
};

// Show confirmation dialog before exiting study session
export const confirmExitStudySession = async (userId: string): Promise<boolean> => {
  const inSession = await isInStudySession(userId);
  
  if (!inSession) {
    return true; // No active session, can exit safely
  }
  
  return window.confirm('Are you sure you want to leave? Unsaved progress may be lost.');
};

// Handle safe exit (can be expanded with save functionality later)
export const safeExitStudySession = async (userId: string): Promise<void> => {
  await clearStudySessionContext(userId);
};

// Check for abandoned sessions (no activity for 30 minutes)
export const checkForAbandonedSessions = async (userId: string): Promise<boolean> => {
  try {
    const context = await getStudySessionContext(userId);
    
    if (!context) {
      return false;
    }
    
    const now = Date.now();
    const inactiveTime = now - (context.lastActive || context.startedAt);
    const maxInactiveTime = 30 * 60 * 1000; // 30 minutes
    
    // If session has been inactive for too long, clear it
    if (inactiveTime > maxInactiveTime) {
      await clearStudySessionContext(userId);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to check for abandoned sessions:', error);
    return false;
  }
};
