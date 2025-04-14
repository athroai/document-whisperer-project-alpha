
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, User, UserRole } from '../types/auth';
import { toast } from 'sonner';

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
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role?: UserRole, additionalData?: Record<string, any>) => Promise<void>;
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
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'AUTH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'AUTH_LOGOUT':
      return { ...state, user: null, loading: false, error: null };
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch additional user profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const role = (profileData?.role || 'student') as UserRole;
          
          // Use optional chaining and provide fallback values for all profile fields
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: {
              id: session.user.id,
              email: session.user.email || '',
              role: role,
              displayName: profileData?.name || session.user.email?.split('@')[0] || '',
              createdAt: new Date(session.user.created_at),
              rememberMe: true,
              schoolId: profileData?.school_id || undefined,
              // Safe fallbacks for potentially missing properties
              examBoard: (profileData as any)?.exam_board as 'wjec' | 'ocr' | 'aqa' | 'none' | undefined || undefined,
              confidenceScores: (profileData as any)?.confidence_scores as {[subject: string]: number} | undefined || {},
              welshEligible: (profileData as any)?.welsh_eligible as boolean | undefined || false,
              preferredLanguage: (profileData as any)?.preferred_language as 'en' | 'cy' | 'es' | 'fr' | 'de' | undefined || 'en'
            }
          });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      }
    );

    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const role = (profileData?.role || 'student') as UserRole;

        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: {
            id: session.user.id,
            email: session.user.email || '',
            role: role,
            displayName: profileData?.name || session.user.email?.split('@')[0] || '',
            createdAt: new Date(session.user.created_at),
            rememberMe: true,
            schoolId: profileData?.school_id || undefined,
            // Safe fallbacks for potentially missing properties
            examBoard: (profileData as any)?.exam_board as 'wjec' | 'ocr' | 'aqa' | 'none' | undefined || undefined,
            confidenceScores: (profileData as any)?.confidence_scores as {[subject: string]: number} | undefined || {},
            welshEligible: (profileData as any)?.welsh_eligible as boolean | undefined || false,
            preferredLanguage: (profileData as any)?.preferred_language as 'en' | 'cy' | 'es' | 'fr' | 'de' | undefined || 'en'
          }
        });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login method
  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAIL', payload: error.message });
      toast.error('Login failed', { description: error.message });
      throw error;
    }
  };

  // Signup method
  const signup = async (
    email: string, 
    password: string, 
    role: UserRole = 'student',
    additionalData?: Record<string, any>
  ) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            ...additionalData
          }
        }
      });

      if (error) throw error;

      toast.success('Signup successful', { description: 'Please check your email to verify your account' });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAIL', payload: error.message });
      toast.error('Signup failed', { description: error.message });
      throw error;
    }
  };

  // Logout method
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch({ type: 'AUTH_LOGOUT' });
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Logout failed', { description: error.message });
      throw error;
    }
  };

  // Update user method
  const updateUser = async (userData: Partial<User>) => {
    if (!state.user) return;

    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', state.user.id);

      if (error) throw error;

      dispatch({ 
        type: 'UPDATE_USER', 
        payload: userData 
      });

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Update failed', { description: error.message });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      login, 
      signup, 
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
