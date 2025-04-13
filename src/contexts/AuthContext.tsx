
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types/auth';
import { toast } from 'sonner';

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
  signup: (email: string, password: string, role: 'student' | 'teacher' | 'parent') => Promise<void>;
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

  // Check for existing auth session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: 'AUTH_START' });
        
        // Check for existing user session in localStorage or sessionStorage
        const savedUser = localStorage.getItem('athro_user') || sessionStorage.getItem('athro_user');
        
        if (savedUser) {
          const user = JSON.parse(savedUser);
          
          // Apply Nexastream privilege rules
          if (user.email && user.email.endsWith('@nexastream.co.uk')) {
            user.licenseExempt = true;
            if (user.role !== 'admin') {
              user.role = 'admin';
            }
          }
          
          // Ensure user has an examBoard property, defaulting to 'none'
          if (!user.examBoard) {
            user.examBoard = 'none';
          }
          
          // Store back to storage based on rememberMe setting
          if (user.rememberMe) {
            localStorage.setItem('athro_user', JSON.stringify(user));
          }
          
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        dispatch({ type: 'AUTH_FAIL', payload: 'Authentication check failed' });
        toast.error('Authentication error. Please try logging in again.');
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    dispatch({ type: 'AUTH_START' });
    try {
      // Mock login - would use Firebase auth in actual implementation
      const isNexastream = email.endsWith('@nexastream.co.uk');
      const mockUser: User = {
        id: '123456789',
        email,
        role: isNexastream ? 'admin' : 'student',
        displayName: email.split('@')[0],
        createdAt: new Date(),
        rememberMe,
        examBoard: 'none', // Default to none
        licenseExempt: isNexastream,
        confidenceScores: {
          maths: 5,
          science: 5,
          english: 5
        }
      };
      
      // Store auth info based on remember me setting
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

  const signup = async (email: string, password: string, role: 'student' | 'teacher' | 'parent') => {
    dispatch({ type: 'AUTH_START' });
    try {
      // Check if Nexastream user and apply special privileges
      const isNexastream = email.endsWith('@nexastream.co.uk');
      
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role: isNexastream ? 'admin' : role,
        displayName: email.split('@')[0],
        createdAt: new Date(),
        examBoard: 'none', // Default to none
        licenseExempt: isNexastream,
        rememberMe: true,
        confidenceScores: {
          maths: 5,
          science: 5,
          english: 5
        }
      };
      
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
      // Clear all storage
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
      
      // Update local storage if user exists
      if (updatedUser.rememberMe) {
        localStorage.setItem('athro_user', JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem('athro_user', JSON.stringify(updatedUser));
      }
      
      dispatch({ type: 'UPDATE_USER', payload: userData });
    }
  };
  
  const resetAuthState = () => {
    // Clear any stale state and restart the auth flow
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
