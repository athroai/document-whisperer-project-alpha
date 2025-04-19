
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Send, ChevronRight } from 'lucide-react';
import { SubjectsSelector } from './SubjectsSelector';
import { DiagnosticQuizSelector } from './DiagnosticQuizSelector';
import { SlotSelection } from './SlotSelection';
import { confidenceOptions, ConfidenceLabel } from '@/types/confidence';
import LearningStyleQuiz from './LearningStyleQuiz';

type OnboardingStep = 
  | 'welcome' 
  | 'subjects' 
  | 'confidence' 
  | 'schedule' 
  | 'learning_style' 
  | 'generatePlan'
  | 'completed';

interface Message {
  id: string;
  sender: 'system' | 'user';
  content: string;
  timestamp: Date;
  component?: React.ReactNode;
}

interface LearningStyle {
  visual: number;
  auditory: number;
  reading: number;
  kinesthetic: number;
}

const ChatOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, updateOnboardingStep, selectSubject, completeOnboarding } = useOnboarding();
  const { state: authState } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [learningStyles, setLearningStyles] = useState<LearningStyle>({
    visual: 0,
    auditory: 0,
    reading: 0,
    kinesthetic: 0
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userName = authState.user?.displayName || 'Student';

  // Calculate current step for progress bar
  useEffect(() => {
    const steps: OnboardingStep[] = [
      'welcome', 'subjects', 'confidence', 'schedule', 
      'learning_style', 'generatePlan', 'completed'
    ];
    
    const currentIndex = steps.findIndex(step => step === currentStep);
    setProgress(((currentIndex + 1) / steps.length) * 100);
  }, [currentStep]);

  // Send welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      sendSystemMessage(
        `👋 Hi ${userName}! I'm your Athro AI study assistant. I'd love to get to know you better so I can help you create the perfect study plan. Let's start by talking about what subjects you're currently studying.`,
        <Button 
          onClick={() => handleInteraction('start_subjects')} 
          className="bg-purple-600 hover:bg-purple-700 mt-2"
        >
          Let's get started <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      );
    }
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendSystemMessage = (content: string, component?: React.ReactNode) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'system',
      content,
      timestamp: new Date(),
      component
    }]);
  };

  const sendUserMessage = (content: string) => {
    if (!content.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date()
    }]);
    
    setInputValue('');
    setIsLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      processUserInput(content);
      setIsLoading(false);
    }, 1000);
  };

  const processUserInput = (input: string) => {
    const lowercaseInput = input.toLowerCase();
    
    // Process based on current step
    if (currentStep === 'welcome') {
      handleStartSubjects();
    } 
    else if (currentStep === 'subjects' && messages.some(m => m.component && m.content.includes('confidence'))) {
      // Process confidence input
      const confidenceMatch = lowercaseInput.match(/\b(very low|low|neutral|high|very high)\b/i);
      if (confidenceMatch) {
        handleConfidenceSelection(confidenceMatch[0] as ConfidenceLabel);
      } else {
        sendSystemMessage("I didn't quite catch that. Could you tell me your confidence level in these subjects (Very Low, Low, Neutral, High, or Very High)?");
      }
    } 
    else if (currentStep === 'schedule') {
      // Process schedule input
      if (lowercaseInput.includes('yes') || lowercaseInput.includes('good') || lowercaseInput.includes('great')) {
        handleScheduleConfirmation();
      } else {
        sendSystemMessage(
          "Let's adjust your schedule. Would you prefer more morning sessions, afternoon sessions, or a different pattern?",
          <SlotSelection />
        );
      }
    } 
    else if (currentStep === 'learning_style') {
      // Process learning style input
      handleLearningStyleResponse(input);
    } 
    else {
      // Generic response for other inputs
      sendSystemMessage(
        "I'm not sure how to respond to that. Let's continue with our onboarding process.",
        <Button 
          onClick={() => handleProgressToNextStep()} 
          className="bg-purple-600 hover:bg-purple-700 mt-2"
        >
          Continue
        </Button>
      );
    }
  };

  const handleLearningStyleResponse = (input: string) => {
    // Simple natural language processing for learning style responses
    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('visual') || lowercaseInput.includes('see') || lowercaseInput.includes('diagram') || lowercaseInput.includes('chart') || lowercaseInput.includes('image')) {
      handleCompleteLearningStyle({ visual: 5, auditory: 2, reading: 3, kinesthetic: 2 });
    } else if (lowercaseInput.includes('auditory') || lowercaseInput.includes('listen') || lowercaseInput.includes('hear') || lowercaseInput.includes('audio') || lowercaseInput.includes('speak')) {
      handleCompleteLearningStyle({ visual: 2, auditory: 5, reading: 2, kinesthetic: 2 });
    } else if (lowercaseInput.includes('read') || lowercaseInput.includes('write') || lowercaseInput.includes('book') || lowercaseInput.includes('text')) {
      handleCompleteLearningStyle({ visual: 2, auditory: 2, reading: 5, kinesthetic: 2 });
    } else if (lowercaseInput.includes('hands') || lowercaseInput.includes('do') || lowercaseInput.includes('practice') || lowercaseInput.includes('physical') || lowercaseInput.includes('touch')) {
      handleCompleteLearningStyle({ visual: 2, auditory: 2, reading: 2, kinesthetic: 5 });
    } else {
      // If no clear preference, offer the quiz
      sendSystemMessage(
        "I understand that learning styles can be complex. Let me help you identify yours with a quick quiz.",
        <LearningStyleQuiz onComplete={(styles) => handleCompleteLearningStyle(styles)} />
      );
    }
  };

  const handleInteraction = (action: string, data?: any) => {
    switch (action) {
      case 'start_subjects':
        handleStartSubjects();
        break;
      case 'select_subject':
        if (data?.subject && data?.confidence) {
          selectSubject(data.subject, data.confidence);
        }
        break;
      case 'complete_subjects':
        handleCompleteSubjects();
        break;
      case 'complete_schedule':
        handleScheduleConfirmation();
        break;
      case 'complete_learning_style':
        handleCompleteLearningStyle(data);
        break;
      case 'complete_onboarding':
        handleCompleteOnboarding();
        break;
      default:
        console.log('Unknown interaction:', action);
    }
  };

  const handleStartSubjects = () => {
    updateOnboardingStep('subjects');
    sendSystemMessage(
      "Great! Let's talk about your subjects. Which subjects are you studying for your GCSEs?",
      <SubjectsSelector />
    );
  };

  const handleCompleteSubjects = () => {
    updateOnboardingStep('confidence');
    sendSystemMessage(
      "How confident do you feel about these subjects overall? (Very Low, Low, Neutral, High, or Very High)"
    );
  };

  const handleConfidenceSelection = (confidence: ConfidenceLabel) => {
    updateOnboardingStep('schedule');
    sendSystemMessage(
      `Thanks! Now let's talk about when you like to study. I'll help you create a schedule that works around your commitments.`,
      <SlotSelection />
    );
  };

  const handleScheduleConfirmation = () => {
    updateOnboardingStep('learning_style');
    sendSystemMessage(
      "Great! Now I'd like to understand your learning style better. This will help me recommend study techniques that work best for you.",
      <LearningStyleQuiz onComplete={(styles) => handleCompleteLearningStyle(styles)} />
    );
  };

  const handleCompleteLearningStyle = (styles: LearningStyle) => {
    setLearningStyles(styles);
    updateOnboardingStep('generatePlan');
    
    const dominantStyle = Object.entries(styles).sort((a, b) => b[1] - a[1])[0][0];
    let styleDescription = '';
    
    switch(dominantStyle) {
      case 'visual':
        styleDescription = 'visual learner who benefits from diagrams, charts, and videos';
        break;
      case 'auditory':
        styleDescription = 'auditory learner who benefits from discussions, lectures, and verbal explanations';
        break;
      case 'reading':
        styleDescription = 'reading/writing learner who benefits from lists, notes, and text-based materials';
        break;
      case 'kinesthetic':
        styleDescription = 'hands-on learner who benefits from practical activities and real-world applications';
        break;
    }
    
    sendSystemMessage(
      `Based on your responses, you appear to be primarily a ${styleDescription}. I'll incorporate study methods that match this learning style in your plan.`,
      <Button 
        onClick={() => handleGeneratePlan()} 
        className="bg-purple-600 hover:bg-purple-700 mt-2"
      >
        Generate My Study Plan
      </Button>
    );
  };

  const handleGeneratePlan = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      sendSystemMessage(
        "I've created a personalized study plan based on your preferences! It includes specific study sessions, recommended methods, and a calendar to keep you on track.",
        <Card className="w-full mt-4">
          <CardContent className="pt-4">
            <h3 className="font-bold text-lg">Your Personalized Study Plan</h3>
            <p className="text-muted-foreground mb-4">Tailored to your schedule and learning style</p>
            <Button 
              onClick={handleCompleteOnboarding} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Let's Get Started!
            </Button>
          </CardContent>
        </Card>
      );
      setIsLoading(false);
    }, 3000);
  };

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
      sendSystemMessage(
        "🎉 Congratulations! Your onboarding is complete. You're all set to start your GCSE journey with Athro AI!",
        <Button 
          onClick={() => navigate('/calendar')} 
          className="bg-purple-600 hover:bg-purple-700 mt-2"
        >
          Go to My Calendar
        </Button>
      );
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      sendSystemMessage(
        "There was an issue completing your onboarding. Please try again or contact support if the problem persists."
      );
    }
  };

  const handleProgressToNextStep = () => {
    switch (currentStep) {
      case 'welcome':
        handleStartSubjects();
        break;
      case 'subjects':
        handleCompleteSubjects();
        break;
      case 'schedule':
        handleScheduleConfirmation();
        break;
      case 'learning_style':
        updateOnboardingStep('generatePlan');
        handleGeneratePlan();
        break;
      case 'generatePlan':
        handleCompleteOnboarding();
        break;
      default:
        console.log('No next step defined for', currentStep);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="bg-card border rounded-lg shadow-sm p-4 mb-4">
        <Progress value={progress} className="h-2 mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Start</span>
          <span>Subjects</span>
          <span>Schedule</span>
          <span>Learning Style</span>
          <span>Complete</span>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto rounded-lg border bg-background p-4 mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {message.sender === 'system' && (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/athro-avatar.png" alt="Athro AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg p-4 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.component && <div className="mt-4">{message.component}</div>}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/athro-avatar.png" alt="Athro AI" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-4 bg-muted">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-background">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            sendUserMessage(inputValue);
          }} 
          className="flex items-center space-x-2"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatOnboarding;
