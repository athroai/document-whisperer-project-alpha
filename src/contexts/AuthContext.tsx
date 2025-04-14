
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, User, UserRole } from '../types/auth';
import { toast } from '@/hooks/use-toast';

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
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            try {
              // Fetch additional user profile data
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (error) {
                console.error('Error fetching profile:', error);
              }

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
                  examBoard: (profileData?.exam_board as any) || undefined,
                  confidenceScores: (profileData?.confidence_scores as any) || {},
                  welshEligible: profileData?.welsh_eligible || false,
                  preferredLanguage: (profileData?.preferred_language as any) || 'en'
                }
              });
            } catch (err) {
              console.error('Error in auth state change handler:', err);
              dispatch({ type: 'AUTH_FAIL', payload: 'Failed to load user data' });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      }
    );

    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }

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
              examBoard: (profileData?.exam_board as any) || undefined,
              confidenceScores: (profileData?.confidence_scores as any) || {},
              welshEligible: profileData?.welsh_eligible || false,
              preferredLanguage: (profileData?.preferred_language as any) || 'en'
            }
          });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error: any) {
        console.error('Error checking session:', error);
        dispatch({ type: 'AUTH_FAIL', payload: error.message || 'Authentication failed' });
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Auth state change listener will handle the rest
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAIL', payload: error.message });
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

      toast({
        title: "Signup successful",
        description: "Please check your email to verify your account",
        variant: "success"
      });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAIL', payload: error.message });
      throw error;
    }
  };

  // Logout method
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      dispatch({ type: 'AUTH_LOGOUT' });
      
      toast({
        title: "Logged out successfully",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Logout failed", 
        description: error.message,
        variant: "destructive"
      });
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

      toast({
        title: "Profile updated successfully",
        variant: "success"
      });
    } catch (error: any) {
      toast({
        title: "Update failed", 
        description: error.message,
        variant: "destructive"
      });
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
