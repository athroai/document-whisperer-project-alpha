
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ChoiceScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-4">Welcome to Your Learning Journey</h1>
          <p className="text-xl text-gray-600">Choose how you'd like to start</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-700">Timekeeper's Zone</CardTitle>
              <CardDescription>Create your personalized study schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-gray-600">
                Set up your ideal study times, manage your subjects, and create a structured learning plan.
              </p>
              <Button 
                onClick={() => navigate('/athro-onboarding')} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Set Study Schedule <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-700">Dashboard</CardTitle>
              <CardDescription>Jump straight into learning</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-gray-600">
                Access your study tools, meet your Athro mentors, and explore learning resources.
              </p>
              <Button 
                onClick={() => navigate('/home')} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChoiceScreen;
