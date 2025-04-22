
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';

const WelcomePage: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const { needsOnboarding, isLoading } = useOnboardingCheck(false);
  const hasRedirected = useRef(false);
  
  useEffect(() => {
    // If user is logged in, check if they need onboarding
    if (state.user && !isLoading && !hasRedirected.current) {
      hasRedirected.current = true;
      
      // Use setTimeout to prevent rapid state changes
      setTimeout(() => {
        if (needsOnboarding) {
          navigate('/athro-onboarding', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      }, 100);
    }
  }, [state.user, navigate, needsOnboarding, isLoading]);
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  const handleSignup = () => {
    navigate('/signup');
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-purple-800 mb-4">Welcome to Athro AI</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your personal AI tutor for GCSE subjects. Study smarter with personalized learning plans and assistance.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleLogin} 
            className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6"
            size="lg"
          >
            Login
          </Button>
          <Button 
            onClick={handleSignup} 
            variant="outline"
            className="border-purple-600 text-purple-700 hover:bg-purple-50 text-lg px-8 py-6"
            size="lg"
          >
            Sign Up
          </Button>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-purple-700 mb-2">Meet Your AI Tutors</h2>
          <p className="text-gray-600">Engage with subject-specific AI tutors for personalized learning experiences.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-purple-700 mb-2">Smart Study Plans</h2>
          <p className="text-gray-600">Get a tailored study schedule based on your subjects and learning style.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-purple-700 mb-2">Track Your Progress</h2>
          <p className="text-gray-600">Monitor your improvement and identify areas needing more attention.</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
