
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useOnboardingCheck } from '@/hooks/useOnboardingCheck';

const AthroChat: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  useOnboardingCheck();
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!state.isLoading && !state.user) {
      navigate('/login', { state: { from: '/athro-chat' } });
    }
  }, [state.isLoading, state.user, navigate]);
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2" 
          onClick={() => navigate('/home')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Athro Chat</h1>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-purple-500" />
            Chat with your Athro Mentor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            This is where you'll be able to chat with your AI tutor about your studies.
          </p>
          <div className="p-4 bg-gray-50 rounded-lg border text-center">
            <p>Chat functionality coming soon!</p>
            <Button 
              className="mt-4 bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/home')}
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AthroChat;
