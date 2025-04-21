
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    // Prevent multiple redirects by using a flag
    if (isRedirecting) return;
    
    const handleNavigation = async () => {
      setIsRedirecting(true);
      
      if (state.user) {
        try {
          await logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
      
      // Navigate only once and after a short delay to prevent rapid state changes
      setTimeout(() => {
        navigate('/welcome', { replace: true });
      }, 100);
    };
    
    if (!state.isLoading) {
      handleNavigation();
    }
  }, [navigate, state.user, state.isLoading, logout, isRedirecting]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <Loader className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
        <p className="text-gray-600">Initializing Athro AI...</p>
      </div>
    </div>
  );
};

export default Index;
