
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Clock, Brain, LineChart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export const WelcomeStep: React.FC = () => {
  const { updateOnboardingStep } = useOnboarding();
  const { state } = useAuth();
  const { user } = state;

  const handleContinue = () => {
    updateOnboardingStep('subjects');
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Personalized Learning',
      description: 'Tailored study plans based on your subjects and confidence levels'
    },
    {
      icon: Clock,
      title: 'Smart Scheduling',
      description: 'Study sessions that fit your schedule and optimize your learning'
    },
    {
      icon: Brain,
      title: 'AI Assistance',
      description: 'Subject-specific mentors to help you tackle challenging topics'
    },
    {
      icon: LineChart,
      title: 'Progress Tracking',
      description: 'Monitor your improvement and identify areas that need attention'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to AthroAI{user?.displayName ? `, ${user.displayName}` : ''}!
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Let's set up your personalized learning journey in just a few steps
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="flex items-start space-x-4 p-4 border rounded-lg"
          >
            <div className="bg-primary/10 p-2 rounded-full">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center pt-6">
        <Button 
          onClick={handleContinue} 
          size="lg"
          className="bg-purple-600 hover:bg-purple-700"
        >
          Let's Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};
