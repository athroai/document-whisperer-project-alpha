
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase, verifyAuth } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'parent';
  displayName?: string;
  schoolId?: string;
  customerId?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, role: 'student' | 'teacher' | 'parent') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  dispatch: React.Dispatch<AuthAction>;
}

type AuthAction = 
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const user = await verifyAuth();
        
        if (user) {
          dispatch({
            type: 'LOGIN',
            payload: {
              id: user.id,
              email: user.email || '',
              role: (user.user_metadata?.role || 'student') as 'student' | 'teacher' | 'parent',
              displayName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              schoolId: user.user_metadata?.schoolId,
              customerId: user.user_metadata?.customerId
            }
          });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = true): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For development/testing - allow login without actual auth
      if (process.env.NODE_ENV === 'development' && email === 'demo@example.com') {
        const mockUser = {
          id: 'mock-user-id',
          email,
          role: 'student' as const,
          displayName: 'Demo User'
        };
        
        // Store the mock user in localStorage for persistence across refreshes
        localStorage.setItem('athro_user', JSON.stringify(mockUser));
        
        dispatch({ type: 'LOGIN', payload: mockUser });
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.user) {
        dispatch({
          type: 'LOGIN',
          payload: {
            id: data.user.id,
            email: data.user.email || '',
            role: (data.user.user_metadata?.role || 'student') as 'student' | 'teacher' | 'parent',
            displayName: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            schoolId: data.user.user_metadata?.schoolId,
            customerId: data.user.user_metadata?.customerId
          }
        });
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signup = async (email: string, password: string, role: 'student' | 'teacher' | 'parent'): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name: email.split('@')[0]
          }
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.user) {
        // Check if email confirmation is required
        if (data.session) {
          dispatch({
            type: 'LOGIN',
            payload: {
              id: data.user.id,
              email: data.user.email || '',
              role: role,
              displayName: data.user.email?.split('@')[0] || 'User'
            }
          });
        } else {
          // Email confirmation required
          throw new Error('Please check your email for confirmation link');
        }
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For mock user
      if (localStorage.getItem('athro_user')) {
        localStorage.removeItem('athro_user');
        dispatch({ type: 'LOGOUT' });
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      dispatch({ type: 'LOGOUT' });
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still log the user out on the client side even if there's an error
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  return (
    <AuthContext.Provider value={{ state, login, signup, logout, updateUser, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
