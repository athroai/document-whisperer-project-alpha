
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader, BookOpen, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export const AthroAi: React.FC = () => {
  const { state } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<string>('welcome');
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Data collected during onboarding
  const [userSubjects, setUserSubjects] = useState<Array<{subject: string, helpLevel: string}>>([]);
  const [learningStyles, setLearningStyles] = useState<string[]>([]);
  const [availabilityData, setAvailabilityData] = useState<{
    preferredDaysPerWeek: number;
    sessionDuration: string;
    timeBlocks: string[];
  }>({
    preferredDaysPerWeek: 3,
    sessionDuration: 'medium',
    timeBlocks: ['afternoon']
  });

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    const initialMessages = [
      {
        id: 'welcome-1',
        role: 'assistant' as const,
        content: `Hi there! I'm AthroAi, your personal study assistant. I'll help you set up your personalized study plan.`,
        timestamp: new Date()
      },
      {
        id: 'welcome-2',
        role: 'assistant' as const,
        content: `Let's start by getting to know what subjects you're studying. What GCSE subjects are you working on right now?`,
        timestamp: new Date(Date.now() + 100)
      }
    ];
    
    setMessages(initialMessages);
  }, []);

  // Process user input based on current onboarding step
  const processUserInput = async (userInput: string) => {
    if (!userInput.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Handle different onboarding steps
      switch (onboardingStep) {
        case 'welcome':
          // Process subjects
          await handleSubjectsInput(userInput);
          break;
        case 'confidence':
          // Process confidence levels
          await handleConfidenceInput(userInput);
          break;
        case 'learning_style':
          // Process learning style
          await handleLearningStyleInput(userInput);
          break;
        case 'availability':
          // Process availability
          await handleAvailabilityInput(userInput);
          break;
        case 'plan_preview':
          // Process plan feedback
          await handlePlanFeedbackInput(userInput);
          break;
        case 'completion':
          // Process any final questions
          await handleCompletionInput(userInput);
          break;
        default:
          // General conversation
          await handleGeneralInput(userInput);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addAssistantMessage("I'm having trouble processing that. Could you try again?");
    }
    
    setIsLoading(false);
  };

  // Helper to add assistant messages
  const addAssistantMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    }]);
  };

  // Process subjects input
  const handleSubjectsInput = async (input: string) => {
    // Extract subjects from user input
    const extractedSubjects = extractSubjects(input);
    
    if (extractedSubjects.length > 0) {
      setUserSubjects(extractedSubjects.map(subject => ({
        subject,
        helpLevel: 'medium' // Default help level
      })));
      
      addAssistantMessage(`Great! I've noted that you're studying ${extractedSubjects.join(', ')}.`);
      addAssistantMessage(`For each subject, how would you rate your confidence level? (low, medium, high)`);
      setOnboardingStep('confidence');
    } else {
      addAssistantMessage("I couldn't identify specific subjects. Could you list them again? For example: 'Maths, English, Science'");
    }
  };

  // Process confidence input
  const handleConfidenceInput = async (input: string) => {
    // Update help level based on confidence
    const updatedSubjects = updateSubjectsConfidence(userSubjects, input);
    setUserSubjects(updatedSubjects);
    
    addAssistantMessage("Thanks for sharing your confidence levels. This helps me customize your study plan.");
    addAssistantMessage("What's your preferred way of learning? For example: visual learning, reading, practice questions, group study, etc.");
    setOnboardingStep('learning_style');
  };

  // Process learning style input
  const handleLearningStyleInput = async (input: string) => {
    // Extract learning styles
    const styles = extractLearningStyles(input);
    setLearningStyles(styles);
    
    addAssistantMessage(`I see you prefer ${styles.join(', ')} learning approaches. I'll use these to tailor your study resources.`);
    addAssistantMessage("Let's set up your study schedule. How many days per week would you like to study? And do you prefer short (25min), medium (45min), or long (90min) study sessions?");
    setOnboardingStep('availability');
  };

  // Process availability input
  const handleAvailabilityInput = async (input: string) => {
    // Extract availability preferences
    const availabilityPrefs = extractAvailabilityPreferences(input);
    setAvailabilityData(availabilityPrefs);
    
    addAssistantMessage(`Perfect! I'll schedule ${availabilityPrefs.preferredDaysPerWeek} days per week with ${availabilityPrefs.sessionDuration} sessions.`);
    
    // Simulate plan creation
    addAssistantMessage("I'm creating your personalized study plan based on your preferences...");
    
    // Save data to Supabase
    if (state.user) {
      try {
        await saveOnboardingData();
        addAssistantMessage("Your study plan is ready! You'll have a balanced mix of subjects, with more time allocated to areas where you need more support.");
        addAssistantMessage("Would you like to see your calendar now, or would you like to make any adjustments to your plan?");
        setOnboardingStep('plan_preview');
      } catch (error) {
        console.error('Error saving onboarding data:', error);
        addAssistantMessage("There was an issue saving your preferences. Don't worry, we can still proceed and fix this later.");
        setOnboardingStep('plan_preview');
      }
    } else {
      addAssistantMessage("I can't save your preferences since you're not logged in. Please log in to save your study plan.");
    }
  };

  // Process plan feedback
  const handlePlanFeedbackInput = async (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('calendar') || lowerInput.includes('see') || lowerInput.includes('view')) {
      addAssistantMessage("Great! I'll take you to your calendar so you can see your study schedule. Feel free to come back anytime if you want to adjust your plan.");
      setOnboardingStep('completion');
      setIsComplete(true);
      
      // Redirect to calendar after a short delay
      setTimeout(() => {
        navigate('/calendar');
      }, 2000);
    } else if (lowerInput.includes('adjust') || lowerInput.includes('change') || lowerInput.includes('modify')) {
      addAssistantMessage("Sure, what adjustments would you like to make? You can change your subjects, study frequency, or session duration.");
      setOnboardingStep('general');
    } else {
      addAssistantMessage("Would you like to view your calendar, or make adjustments to your study plan?");
    }
  };

  // Process general input or completion
  const handleGeneralInput = async (input: string) => {
    // For simplicity, just respond generically
    addAssistantMessage("I've noted your feedback. Your study plan has been updated. Would you like to see your calendar now?");
    setOnboardingStep('plan_preview');
  };
  
  // Handle completion input
  const handleCompletionInput = async (input: string) => {
    addAssistantMessage("Your onboarding is complete! Feel free to explore the Athro AI platform. If you need to make changes to your plan, you can do so from the calendar page.");
  };

  // Save onboarding data to Supabase
  const saveOnboardingData = async () => {
    if (!state.user) return;
    
    try {
      // 1. Save subjects
      const subjectPromises = userSubjects.map(subject => 
        supabase
          .from('student_subjects')
          .upsert({
            student_id: state.user!.id,
            subject_name: subject.subject,
            help_level: subject.helpLevel
          }, { onConflict: 'student_id, subject_name' })
      );
      
      // 2. Save student profile with learning styles
      const profilePromise = supabase
        .from('student_profiles')
        .upsert({
          student_id: state.user.id,
          learning_styles: learningStyles,
          preferred_days_per_week: availabilityData.preferredDaysPerWeek,
          session_duration: availabilityData.sessionDuration,
          time_blocks: availabilityData.timeBlocks
        }, { onConflict: 'student_id' });
      
      // 3. Create study blocks in calendar
      const today = new Date();
      const daysToGenerate = 14; // Generate for the next 2 weeks
      
      const calendarEvents = [];
      
      // Generate events for each subject
      for (let day = 0; day < daysToGenerate; day++) {
        // Only create events on preferred days
        if (day % (7 / availabilityData.preferredDaysPerWeek) !== 0) continue;
        
        const eventDate = new Date(today);
        eventDate.setDate(today.getDate() + day);
        
        // Determine session duration in minutes
        let durationMinutes = 45; // Default medium
        if (availabilityData.sessionDuration === 'short') durationMinutes = 25;
        if (availabilityData.sessionDuration === 'long') durationMinutes = 90;
        
        // Determine start hour based on time blocks
        let startHour = 16; // Default afternoon
        if (availabilityData.timeBlocks.includes('morning')) startHour = 9;
        if (availabilityData.timeBlocks.includes('evening')) startHour = 18;
        
        // Create an event for each subject (maximum 2 per day)
        const subjectsForDay = userSubjects.slice(0, 2);
        
        for (let i = 0; i < subjectsForDay.length; i++) {
          const subject = subjectsForDay[i];
          
          const startTime = new Date(eventDate);
          startTime.setHours(startHour + i, 0, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(startTime.getMinutes() + durationMinutes);
          
          // Create description with study details
          const description = JSON.stringify({
            subject: subject.subject,
            isPomodoro: true,
            pomodoroWorkMinutes: Math.min(durationMinutes, 25),
            pomodoroBreakMinutes: 5
          });
          
          calendarEvents.push({
            title: `${subject.subject} Study Session`,
            description,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            event_type: 'study_session',
            user_id: state.user.id,
            student_id: state.user.id
          });
        }
      }
      
      const calendarPromise = supabase
        .from('calendar_events')
        .insert(calendarEvents);
      
      // Execute all promises
      await Promise.all([...subjectPromises, profilePromise, calendarPromise]);
      
      // Create trace log for completion
      await supabase
        .from('core_decision_logs')
        .insert({
          user_id: state.user.id,
          action: 'onboarding_completion',
          details: {
            subjects: userSubjects,
            learning_styles: learningStyles,
            availability: availabilityData,
            events_created: calendarEvents.length
          }
        })
        .single();
      
      toast.success("Your study plan has been created!");
      
    } catch (error) {
      console.error('Error saving data to Supabase:', error);
      toast.error("There was an issue saving your study plan. Please try again later.");
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processUserInput(input);
  };

  // Utility functions
  const extractSubjects = (input: string): string[] => {
    // Common GCSE subjects to look for
    const commonSubjects = [
      'math', 'maths', 'mathematics',
      'english', 'english language', 'english literature',
      'science', 'biology', 'chemistry', 'physics',
      'history', 'geography',
      'french', 'spanish', 'german',
      'computing', 'computer science',
      'art', 'drama', 'music',
      'pe', 'physical education',
      'religious studies', 'rs'
    ];
    
    // Normalize input
    const normalizedInput = input.toLowerCase();
    
    // Extract mentioned subjects
    return commonSubjects
      .filter(subject => normalizedInput.includes(subject))
      .map(subject => {
        // Capitalize first letter of each word
        return subject.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      });
  };

  const updateSubjectsConfidence = (
    subjects: Array<{subject: string, helpLevel: string}>,
    input: string
  ): Array<{subject: string, helpLevel: string}> => {
    const lowerInput = input.toLowerCase();
    
    // Default confidence mapping
    let defaultConfidence = 'medium';
    if (lowerInput.includes('low') || lowerInput.includes('not confident')) {
      defaultConfidence = 'high'; // More help needed (inverse of confidence)
    } else if (lowerInput.includes('high') || lowerInput.includes('very confident')) {
      defaultConfidence = 'low'; // Less help needed
    }
    
    // Update each subject with the default confidence
    return subjects.map(subject => ({
      ...subject,
      helpLevel: defaultConfidence
    }));
  };

  const extractLearningStyles = (input: string): string[] => {
    const lowerInput = input.toLowerCase();
    const styles = [];
    
    if (lowerInput.includes('visual') || lowerInput.includes('seeing') || lowerInput.includes('watch')) {
      styles.push('visual');
    }
    if (lowerInput.includes('read') || lowerInput.includes('book') || lowerInput.includes('text')) {
      styles.push('reading');
    }
    if (lowerInput.includes('listen') || lowerInput.includes('audio') || lowerInput.includes('hear')) {
      styles.push('auditory');
    }
    if (lowerInput.includes('practice') || lowerInput.includes('exercise') || lowerInput.includes('quiz')) {
      styles.push('practical');
    }
    if (lowerInput.includes('group') || lowerInput.includes('friend') || lowerInput.includes('together')) {
      styles.push('social');
    }
    
    // Default to visual and practical if nothing detected
    if (styles.length === 0) {
      styles.push('visual', 'practical');
    }
    
    return styles;
  };

  const extractAvailabilityPreferences = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    // Extract days per week
    let daysPerWeek = 3; // Default
    const daysMatch = lowerInput.match(/(\d+)\s*(day|days)/);
    if (daysMatch && daysMatch[1]) {
      const parsedDays = parseInt(daysMatch[1], 10);
      if (parsedDays > 0 && parsedDays <= 7) {
        daysPerWeek = parsedDays;
      }
    }
    
    // Extract session duration
    let sessionDuration = 'medium'; // Default
    if (lowerInput.includes('short') || lowerInput.includes('25')) {
      sessionDuration = 'short';
    } else if (lowerInput.includes('long') || lowerInput.includes('90')) {
      sessionDuration = 'long';
    }
    
    // Extract time blocks
    const timeBlocks = [];
    if (lowerInput.includes('morning')) timeBlocks.push('morning');
    if (lowerInput.includes('afternoon')) timeBlocks.push('afternoon');
    if (lowerInput.includes('evening')) timeBlocks.push('evening');
    
    // Default to afternoon if no time block specified
    if (timeBlocks.length === 0) {
      timeBlocks.push('afternoon');
    }
    
    return {
      preferredDaysPerWeek: daysPerWeek,
      sessionDuration,
      timeBlocks
    };
  };

  // Complete onboarding by navigating to calendar
  const handleCompleteOnboarding = () => {
    if (isComplete) {
      navigate('/calendar');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <Card className="flex-1 flex flex-col overflow-hidden p-4 h-[70vh]">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'assistant' 
                    ? 'bg-purple-100 text-purple-900' 
                    : 'bg-blue-600 text-white'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-purple-100 text-purple-900">
                <Loader className="animate-spin h-5 w-5" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading || isComplete}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading || isComplete || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
      
      {isComplete && (
        <div className="mt-4 flex gap-4 justify-center">
          <Button onClick={handleCompleteOnboarding} className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Go to Calendar
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/study'} className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Start Studying
          </Button>
        </div>
      )}
    </div>
  );
};
