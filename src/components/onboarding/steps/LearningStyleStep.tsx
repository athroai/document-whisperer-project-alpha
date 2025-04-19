
import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Zap, Book, Video, Mic, PenTool, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface LearningPreference {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
}

export const LearningStyleStep: React.FC = () => {
  const { updateOnboardingStep } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [preferences, setPreferences] = useState<LearningPreference[]>([
    { 
      id: 'visual', 
      title: 'Visual Learning', 
      description: 'I learn best with diagrams, charts and videos',
      icon: <Video className="h-5 w-5" />,
      selected: false
    },
    { 
      id: 'auditory', 
      title: 'Auditory Learning', 
      description: 'I prefer listening to explanations and discussions',
      icon: <Mic className="h-5 w-5" />,
      selected: false
    },
    { 
      id: 'reading', 
      title: 'Reading/Writing', 
      description: 'I learn by reading texts and writing notes',
      icon: <Book className="h-5 w-5" />,
      selected: false
    },
    { 
      id: 'kinesthetic', 
      title: 'Hands-on Learning', 
      description: 'I prefer practical activities and exercises',
      icon: <PenTool className="h-5 w-5" />,
      selected: false
    }
  ]);
  
  const [learningPace, setPace] = useState<string | null>(null);
  const [reviewFrequency, setReviewFrequency] = useState<string | null>(null);
  
  const togglePreference = (id: string) => {
    setPreferences(preferences.map(pref => 
      pref.id === id ? { ...pref, selected: !pref.selected } : pref
    ));
  };

  const handleBack = () => {
    updateOnboardingStep('schedule');
  };

  const handleContinue = () => {
    setIsSubmitting(true);
    
    // Here you would normally save these preferences to your backend
    // For now, we'll just proceed to the next step
    
    setTimeout(() => {
      updateOnboardingStep('plan');
      setIsSubmitting(false);
    }, 800);
  };

  const paces = [
    { id: 'quick', label: 'Quick Pace', description: 'I prefer covering more topics faster' },
    { id: 'moderate', label: 'Moderate Pace', description: 'I like a balanced approach' },
    { id: 'thorough', label: 'Thorough Pace', description: 'I prefer detailed explanations' }
  ];
  
  const frequencies = [
    { id: 'daily', label: 'Daily Review', description: 'Frequent, short review sessions' },
    { id: 'weekly', label: 'Weekly Review', description: 'Regular review of the week\'s topics' },
    { id: 'monthly', label: 'Monthly Review', description: 'Comprehensive monthly reviews' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Learning Style</h2>
        <p className="text-muted-foreground">Help us personalize your study plan by telling us how you learn best</p>
      </div>
      
      {/* Learning Preferences */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">How do you learn best? (Select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {preferences.map((pref) => (
            <Card 
              key={pref.id}
              className={`p-4 cursor-pointer transition-all ${
                pref.selected ? 'border-purple-400 bg-purple-50' : 'hover:border-purple-200'
              }`}
              onClick={() => togglePreference(pref.id)}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  pref.selected ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {pref.icon}
                </div>
                <div>
                  <h3 className="font-medium">{pref.title}</h3>
                  <p className="text-sm text-muted-foreground">{pref.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Learning Pace */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">What learning pace do you prefer?</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {paces.map((pace) => (
            <Card 
              key={pace.id}
              className={`p-4 cursor-pointer transition-all ${
                learningPace === pace.id ? 'border-purple-400 bg-purple-50' : 'hover:border-purple-200'
              }`}
              onClick={() => setPace(pace.id)}
            >
              <div className="flex flex-col items-center text-center">
                <Zap className={`h-6 w-6 ${
                  learningPace === pace.id ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <h3 className="font-medium mt-2">{pace.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{pace.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Review Frequency */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">How often would you like to review material?</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {frequencies.map((freq) => (
            <Card 
              key={freq.id}
              className={`p-4 cursor-pointer transition-all ${
                reviewFrequency === freq.id ? 'border-purple-400 bg-purple-50' : 'hover:border-purple-200'
              }`}
              onClick={() => setReviewFrequency(freq.id)}
            >
              <div className="flex flex-col items-center text-center">
                <Brain className={`h-6 w-6 ${
                  reviewFrequency === freq.id ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <h3 className="font-medium mt-2">{freq.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{freq.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={
            !preferences.some(p => p.selected) || 
            !learningPace || 
            !reviewFrequency ||
            isSubmitting
          }
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
