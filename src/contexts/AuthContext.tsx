
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types/auth';
import { toast } from 'sonner';
import UserFirestoreService from '@/services/firestore/userService';

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAIL'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  loading: true, // Start with loading true to check session
  error: null
};

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, role: 'student' | 'teacher' | 'parent', additionalData?: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  resetAuthState: () => void;
}>({
  state: initialState,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateUser: () => {},
  resetAuthState: () => {}
});

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    let authCheckTimeout: NodeJS.Timeout;
    
    const checkAuth = async () => {
      try {
        dispatch({ type: 'AUTH_START' });
        
        // Add timeout to ensure we don't get stuck in loading state
        authCheckTimeout = setTimeout(() => {
          console.log("Auth check timed out after 3 seconds, forcing completion");
          dispatch({ type: 'AUTH_LOGOUT' });
        }, 3000); // Reduced from 5s to 3s for faster feedback
        
        const savedUser = localStorage.getItem('athro_user') || sessionStorage.getItem('athro_user');
        
        if (savedUser) {
          const user = JSON.parse(savedUser);
          
          if (user.email && user.email.endsWith('@nexastream.co.uk')) {
            user.licenseExempt = true;
            if (user.role !== 'admin') {
              user.role = 'admin';
            }
          }
          
          if (!user.examBoard) {
            user.examBoard = 'none';
          }
          
          try {
            // Add a separate timeout just for the Firestore operation
            const firestoreTimeout = setTimeout(() => {
              console.warn("Firestore sync timed out, using local user data");
              clearTimeout(authCheckTimeout); // Clear the main timeout
              
              // Ensure user object has all required fields
              const safeUser = {
                ...user,
                examBoard: user.examBoard || 'none',
                confidenceScores: user.confidenceScores || {
                  maths: 5,
                  science: 5,
                  english: 5
                },
                welshEligible: user.welshEligible || false,
                preferredLanguage: user.preferredLanguage || 'en'
              };
              
              if (user.rememberMe) {
                localStorage.setItem('athro_user', JSON.stringify(safeUser));
              }
              
              dispatch({ type: 'AUTH_SUCCESS', payload: safeUser });
            }, 2000);
            
            const firestoreUser = await UserFirestoreService.getUser(user.id);
            clearTimeout(firestoreTimeout); // Clear the Firestore timeout since it succeeded
            
            if (firestoreUser) {
              const mergedUser = {
                ...firestoreUser,
                rememberMe: user.rememberMe
              };
              
              if (mergedUser.rememberMe) {
                localStorage.setItem('athro_user', JSON.stringify(mergedUser));
              }
              
              clearTimeout(authCheckTimeout);
              dispatch({ type: 'AUTH_SUCCESS', payload: mergedUser });
            } else {
              await UserFirestoreService.saveUser(user);
              
              if (user.rememberMe) {
                localStorage.setItem('athro_user', JSON.stringify(user));
              }
              
              clearTimeout(authCheckTimeout);
              dispatch({ type: 'AUTH_SUCCESS', payload: user });
            }
          } catch (firestoreError) {
            console.warn("Failed to sync with Firestore, using local user data:", firestoreError);
            
            if (user.rememberMe) {
              localStorage.setItem('athro_user', JSON.stringify(user));
            }
            
            clearTimeout(authCheckTimeout);
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
          }
        } else {
          clearTimeout(authCheckTimeout);
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        clearTimeout(authCheckTimeout);
        dispatch({ type: 'AUTH_FAIL', payload: 'Authentication check failed' });
        toast.error('Authentication error. Please try logging in again.');
      }
    };
    
    checkAuth();
    
    // Clean up timeouts when component unmounts
    return () => {
      if (authCheckTimeout) clearTimeout(authCheckTimeout);
    };
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const isNexastream = email.endsWith('@nexastream.co.uk');
      const mockUser: User = {
        id: '123456789',
        email,
        role: isNexastream ? 'admin' : 'student',
        displayName: email.split('@')[0],
        createdAt: new Date(),
        rememberMe,
        examBoard: 'none',
        licenseExempt: isNexastream,
        confidenceScores: {
          maths: 5,
          science: 5,
          english: 5
        },
        welshEligible: false, // Default to false for existing users
        preferredLanguage: 'en' // Default to English
      };
      
      try {
        await UserFirestoreService.saveUser(mockUser);
      } catch (firestoreError) {
        console.warn("Failed to save user to Firestore during login:", firestoreError);
      }
      
      if (rememberMe) {
        localStorage.setItem('athro_user', JSON.stringify(mockUser));
      } else {
        sessionStorage.setItem('athro_user', JSON.stringify(mockUser));
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
    } catch (error) {
      console.error("Login error:", error);
      dispatch({ type: 'AUTH_FAIL', payload: 'Login failed. Please check your credentials.' });
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const signup = async (email: string, password: string, role: 'student' | 'teacher' | 'parent', additionalData?: Partial<User>) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const isNexastream = email.endsWith('@nexastream.co.uk');
      
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role: isNexastream ? 'admin' : role,
        displayName: email.split('@')[0],
        createdAt: new Date(),
        examBoard: 'none',
        licenseExempt: isNexastream,
        rememberMe: true,
        confidenceScores: {
          maths: 5,
          science: 5,
          english: 5
        },
        welshEligible: additionalData?.welshEligible || false,
        preferredLanguage: additionalData?.preferredLanguage || 'en'
      };
      
      try {
        await UserFirestoreService.saveUser(mockUser);
      } catch (firestoreError) {
        console.warn("Failed to save user to Firestore during signup:", firestoreError);
      }
      
      localStorage.setItem('athro_user', JSON.stringify(mockUser));
      
      dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
      return Promise.resolve();
    } catch (error) {
      console.error("Signup error:", error);
      dispatch({ type: 'AUTH_FAIL', payload: 'Signup failed. Please try again.' });
      toast.error('Signup failed. Please try again.');
      return Promise.reject(error);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('athro_user');
      sessionStorage.removeItem('athro_user');
      
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error("Logout error:", error);
      dispatch({ type: 'AUTH_FAIL', payload: 'Logout failed' });
      toast.error('Logout failed. Please try again.');
    }
  };
  
  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      
      try {
        UserFirestoreService.saveUser(updatedUser);
      } catch (firestoreError) {
        console.warn("Failed to update user in Firestore:", firestoreError);
      }
      
      if (updatedUser.rememberMe) {
        localStorage.setItem('athro_user', JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem('athro_user', JSON.stringify(updatedUser));
      }
      
      dispatch({ type: 'UPDATE_USER', payload: userData });
    }
  };
  
  const resetAuthState = () => {
    localStorage.removeItem('athro_user');
    sessionStorage.removeItem('athro_user');
    
    dispatch({ type: 'AUTH_START' });
    setTimeout(() => {
      dispatch({ type: 'AUTH_LOGOUT' });
      window.location.href = '/login';
    }, 100);
  };

  return (
    <AuthContext.Provider value={{ state, login, signup, logout, updateUser, resetAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
