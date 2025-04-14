
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';

const IndexPage = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user, loading } = state;
  
  useEffect(() => {
    // Wait until auth state is confirmed
    if (!loading) {
      if (user) {
        // If user is logged in, redirect based on role
        if (user.role === 'teacher' || user.role === 'admin') {
          navigate('/teacher', { replace: true });
        } else if (user.role === 'student') {
          navigate('/athro/select', { replace: true });
        } else {
          // Default for other roles
          navigate('/home', { replace: true });
        }
      } else {
        // If not logged in, redirect to login page
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, user, loading]);

  // Handle manual redirect if needed
  const handleManualRedirect = () => {
    if (user) {
      if (user.role === 'teacher' || user.role === 'admin') {
        navigate('/teacher', { replace: true });
      } else if (user.role === 'student') {
        navigate('/athro/select', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-100 to-white">
      <div className="text-center mb-6">
        <img
          src="/lovable-uploads/40369f55-a9f5-48fb-bcf9-fdf91c946daa.png"
          alt="Athro Logo"
          className="h-24 mx-auto mb-6"
        />
        <h1 className="text-2xl font-bold mb-2">Welcome to Athro AI</h1>
        <p className="text-gray-600 mb-6">
          {loading ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Setting up your experience...
            </span>
          ) : (
            "Redirecting to your dashboard..."
          )}
        </p>
        
        <div className="mt-8">
          <Button 
            onClick={handleManualRedirect} 
            variant="default"
            className="transition-all duration-300 hover:scale-105"
          >
            {user ? "Go to Dashboard" : "Log In"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
