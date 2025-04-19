
import React from 'react';
import { AthroAi } from '@/components/onboarding/AthroAi';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AthroOnboardingPage: React.FC = () => {
  const { state } = useAuth();
  
  if (state.loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!state.user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="container mx-auto p-4 pt-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-purple-800">Welcome to Athro AI</h1>
        <p className="text-gray-600 mt-2">Let's set up your personalized study experience</p>
      </div>
      
      <AthroAi />
    </div>
  );
};

export default AthroOnboardingPage;
