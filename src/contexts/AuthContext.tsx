
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types/auth';

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAIL'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  loading: true, // Changed to true to prevent flicker during session check
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

  // Simulating authentication check on app load with persistence
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: 'AUTH_START' });
        // Check for existing user session
        const savedUser = localStorage.getItem('athro_user');
        const savedToken = localStorage.getItem('athro_token');
        
        if (savedUser && savedToken) {
          const user = JSON.parse(savedUser);
          
          // Check if the user is from nexastream for license exemption
          if (user.email.endsWith('@nexastream.co.uk') && !user.licenseExempt) {
            user.licenseExempt = true;
            localStorage.setItem('athro_user', JSON.stringify(user));
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
      // Mock login - would use Firebase auth in actual implementation
      const mockUser: User = {
        id: '123456789',
        email,
        role: 'student',
        displayName: email.split('@')[0],
        createdAt: new Date(),
        rememberMe,
        licenseExempt: email.endsWith('@nexastream.co.uk'),
        confidenceScores: {
          maths: 5,
          science: 5,
          english: 5
        }
      };
      
      // Store auth info based on remember me setting
      if (rememberMe) {
        localStorage.setItem('athro_user', JSON.stringify(mockUser));
        localStorage.setItem('athro_token', 'mock-token-' + Date.now());
      } else {
        sessionStorage.setItem('athro_user', JSON.stringify(mockUser));
        sessionStorage.setItem('athro_token', 'mock-token-' + Date.now());
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL', payload: 'Login failed. Please check your credentials.' });
    }
  };

  const signup = async (email: string, password: string, role: 'student' | 'teacher' | 'parent') => {
    dispatch({ type: 'AUTH_START' });
    try {
      // Mock signup with Nexastream license exemption check
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role,
        displayName: email.split('@')[0],
        createdAt: new Date(),
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
      
      dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
      return Promise.resolve();
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL', payload: 'Signup failed. Please try again.' });
      return Promise.reject(error);
    }
  };

  const logout = async () => {
    try {
      // Clear all storage
      localStorage.removeItem('athro_user');
      localStorage.removeItem('athro_token');
      sessionStorage.removeItem('athro_user');
      sessionStorage.removeItem('athro_token');
      
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL', payload: 'Logout failed' });
    }
  };
  
  const updateUser = (userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      
      // Update local storage if remember me is set
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
