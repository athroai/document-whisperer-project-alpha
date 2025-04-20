
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  
  useEffect(() => {
    if (state.isLoading) {
      return; // Wait for auth to finish loading
    }
    
    if (state.user) {
      navigate('/calendar');
    } else {
      navigate('/login');
    }
  }, [navigate, state.user, state.isLoading]);

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
