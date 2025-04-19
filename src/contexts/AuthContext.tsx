
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types/auth';
import { generateUUID } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAIL'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null
};

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, role: 'student' | 'teacher' | 'parent') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}>({
  state: initialState,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateUser: () => {}
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
      // Clear any user-specific data from localStorage when logging out
      localStorage.removeItem('athro_user');
      localStorage.removeItem('athro_token');
      
      // Also clear any session-specific data
      sessionStorage.removeItem('athro_user');
      sessionStorage.removeItem('athro_token');
      
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
    const checkAuth = async () => {
      try {
        dispatch({ type: 'AUTH_START' });
        const savedUser = localStorage.getItem('athro_user');
        const savedToken = localStorage.getItem('athro_token');
        
        if (savedUser && savedToken) {
          const user = JSON.parse(savedUser);
          
          if (user.email.endsWith('@nexastream.co.uk') && !user.licenseExempt) {
            user.licenseExempt = true;
          }
          
          if (!user.examBoard) {
            user.examBoard = 'none';
          }
          
          localStorage.setItem('athro_user', JSON.stringify(user));
          
          // Create a Supabase session for the mock user
          try {
            // We don't actually authenticate with Supabase here, but we create a reference 
            // that can be used for RLS policies
            const { data, error } = await supabase.auth.getSession();
            if (error || !data.session) {
              console.log("Setting up mock authentication for Supabase access");
            }
          } catch (error) {
            console.error('Error syncing user with Supabase:', error);
          }
          
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        dispatch({ type: 'AUTH_FAIL', payload: 'Authentication check failed' });
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const mockUser: User = {
        id: generateUUID(),
        email,
        role: 'student',
        displayName: email.split('@')[0],
        createdAt: new Date(),
        rememberMe,
        examBoard: 'none',
        licenseExempt: email.endsWith('@nexastream.co.uk'),
        confidenceScores: {
          maths: 5,
          science: 5,
          english: 5
        }
      };
      
      // Store user data appropriately based on remember me preference
      if (rememberMe) {
        localStorage.setItem('athro_user', JSON.stringify(mockUser));
        localStorage.setItem('athro_token', 'mock-token-' + Date.now());
      } else {
        sessionStorage.setItem('athro_user', JSON.stringify(mockUser));
        sessionStorage.setItem('athro_token', 'mock-token-' + Date.now());
      }
      
      // Create a reference in Supabase
      try {
        const userData = {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        };
        await supabase.from('profiles').upsert(userData, { onConflict: 'id' });
      } catch (error) {
        console.error('Error creating mock user in Supabase:', error);
        // Continue anyway since this is just for development
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL', payload: 'Login failed. Please check your credentials.' });
    }
  };

  const signup = async (email: string, password: string, role: 'student' | 'teacher' | 'parent') => {
    dispatch({ type: 'AUTH_START' });
    try {
      const mockUser: User = {
        id: generateUUID(),
        email,
        role,
        displayName: email.split('@')[0],
        createdAt: new Date(),
        examBoard: 'none',
        licenseExempt: email.endsWith('@nexastream.co.uk'),
        rememberMe: true,
        confidenceScores: {
          maths: 5,
          science: 5,
          english: 5
        }
      };
      
      localStorage.setItem('athro_user', JSON.stringify(mockUser));
      localStorage.setItem('athro_token', 'mock-token-' + Date.now());
      
      // Create a reference in Supabase
      try {
        const userData = {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        };
        await supabase.from('profiles').upsert(userData, { onConflict: 'id' });
      } catch (error) {
        console.error('Error creating mock user in Supabase:', error);
        // Continue anyway since this is just for development
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
      return Promise.resolve();
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL', payload: 'Signup failed. Please try again.' });
      return Promise.reject(error);
    }
  };

  const logout = async () => {
    try {
      // Clear auth data
      localStorage.removeItem('athro_user');
      localStorage.removeItem('athro_token');
      sessionStorage.removeItem('athro_user');
      sessionStorage.removeItem('athro_token');
      
      // Also sign out from Supabase to clear any session
      await supabase.auth.signOut();
      
      // Clear any user-specific data from localStorage
      // Find and remove any calendar event notifications
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('notified_session_') || key?.startsWith('athro_calendar_events_')) {
          localStorage.removeItem(key);
        }
      }
      
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL', payload: 'Logout failed' });
    }
  };
  
  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      
      if (state.user.rememberMe) {
        localStorage.setItem('athro_user', JSON.stringify(updatedUser));
      }
      
      dispatch({ type: 'UPDATE_USER', payload: userData });
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
