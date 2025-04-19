
import React from 'react';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import ChatOnboarding from '@/components/onboarding/ChatOnboarding';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const ChatOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();

  // Check if user is logged in
  if (!state.user) {
    return (
      <div className="container mx-auto p-6 max-w-xl text-center">
        <h1 className="text-2xl font-bold mb-4">Login Required</h1>
        <p className="mb-6">You need to be logged in to access the onboarding process.</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <OnboardingProvider>
      <div className="container mx-auto p-4 h-[calc(100vh-5rem)]">
        <ChatOnboarding />
      </div>
    </OnboardingProvider>
  );
};

export default ChatOnboardingPage;
