
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user, loading } = state;
  
  useEffect(() => {
    // Wait until auth state is confirmed
    if (!loading) {
      if (user) {
        // If user is logged in, redirect based on role
        if (user.role === 'teacher' || user.role === 'admin') {
          navigate('/teacher-dashboard', { replace: true });
        } else {
          navigate('/athro/select', { replace: true });
        }
      } else {
        // If not logged in, redirect to welcome page
        navigate('/welcome', { replace: true });
      }
    }
  }, [navigate, user, loading]);

  // Handle manual redirect if needed
  const handleManualRedirect = () => {
    if (user) {
      if (user.role === 'teacher' || user.role === 'admin') {
        navigate('/teacher-dashboard', { replace: true });
      } else {
        navigate('/athro/select', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome to Athro AI</h1>
        <p className="text-gray-600 mb-6">
          {loading ? "Setting up your experience..." : "Redirecting to your dashboard..."}
        </p>
        
        <div className="mt-8">
          <Button onClick={handleManualRedirect} variant="default">
            {user ? "Go to Dashboard" : "Log In"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
