
/**
 * Persistent storage service for Athro AI
 * Stores session data in IndexedDB for persistence across page reloads
 */

// Define the types of data we'll be storing
export type StorageKey = 
  | 'chatHistory'
  | 'activeCharacter'
  | 'studySession'
  | 'selectedSubject'
  | 'userPreferences'
  | 'draftResponses';

// Interface for IndexedDB operations
interface IDBOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// IndexedDB database configuration
const DB_NAME = 'athroAI';
const DB_VERSION = 1;
const STORE_NAME = 'userSessions';
const USER_KEY_PREFIX = 'user_';

/**
 * Initialize the IndexedDB database
 */
const initializeDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject('IndexedDB not supported in this browser');
      return;
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject(`Failed to open IndexedDB: ${request.error?.message || 'Unknown error'}`);
    };
    
    request.onsuccess = (event) => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('key', 'key', { unique: false });
        
        console.log('IndexedDB object store created');
      }
    };
  });
};

/**
 * Get a composite key for storing user data
 */
const getUserKey = (userId: string, key: StorageKey): string => {
  return `${USER_KEY_PREFIX}${userId}_${key}`;
};

/**
 * Store data in IndexedDB
 */
export const storeData = async <T>(
  userId: string,
  key: StorageKey,
  data: T
): Promise<IDBOperationResult<T>> => {
  try {
    const db = await initializeDB();
    
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const compositeKey = getUserKey(userId, key);
      
      const request = store.put({
        id: compositeKey,
        userId,
        key,
        data,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => {
        resolve({ success: true, data });
      };
      
      request.onerror = () => {
        console.error('Error storing data:', request.error);
        resolve({ 
          success: false, 
          error: request.error?.message || 'Failed to store data' 
        });
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Retrieve data from IndexedDB
 */
export const retrieveData = async <T>(
  userId: string,
  key: StorageKey
): Promise<IDBOperationResult<T>> => {
  try {
    const db = await initializeDB();
    
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      const compositeKey = getUserKey(userId, key);
      const request = store.get(compositeKey);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve({ success: true, data: request.result.data });
        } else {
          resolve({ success: false, error: 'Data not found' });
        }
      };
      
      request.onerror = () => {
        console.error('Error retrieving data:', request.error);
        resolve({ 
          success: false, 
          error: request.error?.message || 'Failed to retrieve data' 
        });
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Delete data from IndexedDB
 */
export const deleteData = async (
  userId: string,
  key: StorageKey
): Promise<IDBOperationResult<void>> => {
  try {
    const db = await initializeDB();
    
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const compositeKey = getUserKey(userId, key);
      const request = store.delete(compositeKey);
      
      request.onsuccess = () => {
        resolve({ success: true });
      };
      
      request.onerror = () => {
        console.error('Error deleting data:', request.error);
        resolve({ 
          success: false, 
          error: request.error?.message || 'Failed to delete data' 
        });
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Clear all user data from IndexedDB
 */
export const clearUserData = async (
  userId: string
): Promise<IDBOperationResult<void>> => {
  try {
    const db = await initializeDB();
    
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('userId');
      
      const request = index.openCursor(IDBKeyRange.only(userId));
      
      request.onsuccess = (event) => {
        const cursor = request.result;
        
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve({ success: true });
        }
      };
      
      request.onerror = () => {
        console.error('Error clearing user data:', request.error);
        resolve({ 
          success: false, 
          error: request.error?.message || 'Failed to clear user data' 
        });
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Check if IndexedDB is supported in this browser
 */
export const isIndexedDBSupported = (): boolean => {
  return 'indexedDB' in window;
};

// Helper functions for specific data types
export const persistentStorage = {
  saveChatHistory: <T>(userId: string, chatHistory: T) => 
    storeData(userId, 'chatHistory', chatHistory),
  
  getChatHistory: <T>(userId: string) => 
    retrieveData<T>(userId, 'chatHistory'),
  
  saveActiveCharacter: <T>(userId: string, character: T) => 
    storeData(userId, 'activeCharacter', character),
  
  getActiveCharacter: <T>(userId: string) => 
    retrieveData<T>(userId, 'activeCharacter'),
  
  saveStudySession: <T>(userId: string, sessionData: T) => 
    storeData(userId, 'studySession', sessionData),
  
  getStudySession: <T>(userId: string) => 
    retrieveData<T>(userId, 'studySession'),
  
  saveSelectedSubject: (userId: string, subject: string) => 
    storeData(userId, 'selectedSubject', subject),
  
  getSelectedSubject: (userId: string) => 
    retrieveData<string>(userId, 'selectedSubject'),
  
  saveUserPreferences: <T>(userId: string, preferences: T) => 
    storeData(userId, 'userPreferences', preferences),
  
  getUserPreferences: <T>(userId: string) => 
    retrieveData<T>(userId, 'userPreferences'),
  
  saveDraftResponse: (userId: string, draft: string) => 
    storeData(userId, 'draftResponses', draft),
  
  getDraftResponse: (userId: string) => 
    retrieveData<string>(userId, 'draftResponses'),
  
  clearAllUserData: (userId: string) => 
    clearUserData(userId)
};

export default persistentStorage;
