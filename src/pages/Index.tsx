
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from '@/hooks/use-toast';

const IndexPage = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user, loading } = state;
  const [localLoading, setLocalLoading] = useState(true);
  
  useEffect(() => {
    // Handle redirection when auth state is confirmed
    if (!loading) {
      setLocalLoading(false);
      redirectToUserDashboard();
    }
    
    // Set a maximum wait time before redirecting to login anyway
    const redirectTimeout = setTimeout(() => {
      if (loading) {
        console.log("Redirect timeout triggered - navigating to login");
        setLocalLoading(false);
        navigate('/login', { replace: true });
      }
    }, 3000);
    
    return () => clearTimeout(redirectTimeout);
  }, [navigate, user, loading]);
  
  // Handle redirection based on user role
  const redirectToUserDashboard = () => {
    if (user) {
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
  };

  // Handle manual redirect if needed
  const handleManualRedirect = () => {
    setLocalLoading(false);
    redirectToUserDashboard();
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
          {localLoading ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner className="mr-2 h-4 w-4" /> 
              <span className="ml-2">Preparing your experience...</span>
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
