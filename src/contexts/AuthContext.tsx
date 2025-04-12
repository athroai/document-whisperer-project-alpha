
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types/auth';

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAIL'; payload: string }
  | { type: 'AUTH_LOGOUT' };

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null
};

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: 'student' | 'teacher' | 'parent') => Promise<void>;
  logout: () => Promise<void>;
}>({
  state: initialState,
  login: async () => {},
  signup: async () => {},
  logout: async () => {}
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
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Simulating authentication check on app load
  useEffect(() => {
    // In a real implementation, we would check for an existing session here
    const checkAuth = async () => {
      try {
        // Mock checking for existing user
        const savedUser = localStorage.getItem('athro_user');
        if (savedUser) {
          dispatch({ type: 'AUTH_SUCCESS', payload: JSON.parse(savedUser) });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        dispatch({ type: 'AUTH_FAIL', payload: 'Authentication check failed' });
      }
    };
    
    checkAuth();
  }, []);

  // Firebase authentication would be implemented here
  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      // Mock login - would use Firebase auth in actual implementation
      // This is just for demonstration
      const mockUser: User = {
        id: '123456789',
        email,
        role: 'student',
        displayName: email.split('@')[0],
        createdAt: new Date()
      };
      
      localStorage.setItem('athro_user', JSON.stringify(mockUser));
      dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL', payload: 'Login failed. Please check your credentials.' });
    }
  };

  const signup = async (email: string, password: string, role: 'student' | 'teacher' | 'parent') => {
    dispatch({ type: 'AUTH_START' });
    try {
      // Mock signup - would use Firebase auth in actual implementation
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        role,
        displayName: email.split('@')[0],
        createdAt: new Date()
      };
      
      localStorage.setItem('athro_user', JSON.stringify(mockUser));
      dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL', payload: 'Signup failed. Please try again.' });
    }
  };

  const logout = async () => {
    try {
      // Would use Firebase auth logout in actual implementation
      localStorage.removeItem('athro_user');
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL', payload: 'Logout failed' });
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
