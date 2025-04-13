
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAuth();
  const { user, loading } = state;
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  useEffect(() => {
    // Only redirect after auth state is confirmed and prevent redirect loops
    if (!loading && !redirectAttempted) {
      setRedirectAttempted(true);
      
      if (user) {
        // If user is logged in, redirect based on role
        if (user.role === 'teacher') {
          navigate('/teacher-dashboard', { replace: true });
        } else {
          navigate('/athro/select', { replace: true });
        }
      } else {
        // If not logged in, redirect to welcome page
        navigate('/welcome', { replace: true });
      }
    }
  }, [navigate, user, loading, redirectAttempted]);

  // Add a fail-safe for stuck redirects
  const handleManualRedirect = () => {
    if (user) {
      if (user.role === 'teacher') {
        navigate('/teacher-dashboard', { replace: true });
      } else {
        navigate('/athro/select', { replace: true });
      }
    } else {
      navigate('/welcome', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Redirecting...</h1>
        <p className="text-gray-600 mb-6">Please wait while we redirect you to Athro AI.</p>
        
        {/* Fail-safe button that appears immediately */}
        <div className="mt-8">
          <Button onClick={handleManualRedirect} variant="default">
            Take me to my Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
