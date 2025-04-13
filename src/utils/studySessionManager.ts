
export interface StudySessionContext {
  subject: string;
  entryMode: 'assigned' | 'selfStudy';
  startedAt: number;
  taskId: string | null;
  taskTitle: string | null;
}

// Storage keys
const STORAGE_KEY = 'athro_study_session_context';

// Start a new study session
export const startStudySession = (context: StudySessionContext): void => {
  try {
    // Store in sessionStorage (cleared when browser tab is closed)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context));
    console.log('Study session context saved:', context);
  } catch (error) {
    console.error('Failed to save study session context:', error);
  }
};

// Get the current study session context
export const getStudySessionContext = (): StudySessionContext | null => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as StudySessionContext;
    }
    return null;
  } catch (error) {
    console.error('Failed to retrieve study session context:', error);
    return null;
  }
};

// Clear the study session context
export const clearStudySessionContext = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    console.log('Study session context cleared');
  } catch (error) {
    console.error('Failed to clear study session context:', error);
  }
};

// Check if the user is currently in a study session
export const isInStudySession = (): boolean => {
  return !!getStudySessionContext();
};

// Show confirmation dialog before exiting study session
export const confirmExitStudySession = async (): Promise<boolean> => {
  if (!isInStudySession()) {
    return true; // No active session, can exit safely
  }
  
  return window.confirm('Are you sure you want to leave? Unsaved progress may be lost.');
};

// Handle safe exit (can be expanded with save functionality later)
export const safeExitStudySession = (): void => {
  clearStudySessionContext();
};
