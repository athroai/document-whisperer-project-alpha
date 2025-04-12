
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentRecord } from '@/contexts/StudentRecordContext';

const AthroSystem: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    text: string;
    subject?: string;
    topic?: string;
    actionType: 'study' | 'quiz' | 'review' | 'info';
  }>>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { state } = useAuth();
  const { 
    studentRecord, 
    getRecommendedSubject, 
    recordSuggestionDismissal,
    recordSuggestionAction 
  } = useStudentRecord();
  
  // Generate suggestions based on real student data
  const generateSuggestions = () => {
    const newSuggestions = [];
    
    // Check if we have actual student data
    if (Object.keys(studentRecord).length === 0) {
      newSuggestions.push({
        text: "Welcome to Athro AI! Start by taking a quiz or study session to get personalized suggestions.",
        actionType: 'info'
      });
      return newSuggestions;
    }
    
    // Get the recommended subject based on confidence and last studied date
    const recommendedSubject = getRecommendedSubject();
    
    // Check for low confidence subjects
    const lowConfidenceSubjects = Object.entries(studentRecord)
      .filter(([_, subject]) => subject.confidence < 5)
      .map(([name, _]) => name);
      
    if (lowConfidenceSubjects.length > 0) {
      const subject = lowConfidenceSubjects[0];
      newSuggestions.push({
        text: `Your confidence in ${subject} seems lower than other subjects. Would you like to review these topics?`,
        subject: subject,
        actionType: 'study'
      });
    }
    
    // Check for study balance
    const highestSessions = Math.max(...Object.values(studentRecord).map(subject => subject.sessionsThisWeek));
    const lowestSessions = Math.min(...Object.values(studentRecord).map(subject => subject.sessionsThisWeek));
    
    if (highestSessions >= 3 && lowestSessions === 0) {
      const neglectedSubjects = Object.entries(studentRecord)
        .filter(([_, subject]) => subject.sessionsThisWeek === 0)
        .map(([name, _]) => name);
        
      if (neglectedSubjects.length > 0) {
        const subject = neglectedSubjects[0];
        newSuggestions.push({
          text: `You've had ${highestSessions} sessions in some subjects but none in ${subject} this week. Shall we balance your study time?`,
          subject: subject,
          actionType: 'study'
        });
      }
    }
    
    // Check for inactive subjects (not studied in the last 7 days)
    const currentDate = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(currentDate.getDate() - 7);
    
    const inactiveSubjects = Object.entries(studentRecord)
      .filter(([_, subject]) => {
        if (!subject.lastStudied) return true;
        const lastStudyDate = new Date(subject.lastStudied);
        return lastStudyDate < sevenDaysAgo;
      })
      .map(([name, _]) => name);
      
    if (inactiveSubjects.length > 0) {
      const subject = inactiveSubjects[0];
      newSuggestions.push({
        text: `It's been over a week since you studied ${subject}. A quick revision session could be helpful!`,
        subject: subject,
        actionType: 'review'
      });
    }
    
    // Check if any subject has low quiz scores
    const lowScoreSubjects = Object.entries(studentRecord)
      .filter(([_, subject]) => subject.averageScore < 60 && subject.quizScores.length > 0)
      .map(([name, _]) => name);
      
    if (lowScoreSubjects.length > 0) {
      const subject = lowScoreSubjects[0];
      newSuggestions.push({
        text: `Your quiz scores in ${subject} could use some improvement. Would you like to take a practice quiz?`,
        subject: subject,
        actionType: 'quiz'
      });
    }
    
    // If no specific suggestions, add a general one based on the recommended subject
    if (newSuggestions.length === 0 && recommendedSubject) {
      newSuggestions.push({
        text: `Based on your study patterns, now might be a good time to focus on ${recommendedSubject}. Would you like to start a session?`,
        subject: recommendedSubject,
        actionType: 'study'
      });
    }
    
    // If still no suggestions, add a general encouragement
    if (newSuggestions.length === 0) {
      newSuggestions.push({
        text: "Your study pattern looks well-balanced! Keep up the good work.",
        actionType: 'info'
      });
    }
    
    return newSuggestions;
  };
  
  // Initialize suggestions
  useEffect(() => {
    const newSuggestions = generateSuggestions();
    setSuggestions(newSuggestions);
    
    // Show a notification after a delay to simulate proactive behavior
    const timer = setTimeout(() => {
      if (newSuggestions.length > 0 && state.user) {
        toast({
          title: "AthroSystem has a suggestion",
          description: "Click on the AthroSystem icon to view",
          duration: 5000,
        });
      }
    }, 30000); // 30 seconds delay
    
    return () => clearTimeout(timer);
  }, [studentRecord, toast, state.user]);
  
  const handleNextSuggestion = () => {
    setCurrentSuggestionIndex((prev) => 
      prev < suggestions.length - 1 ? prev + 1 : 0
    );
  };
  
  const handleDismiss = () => {
    const currentSuggestion = suggestions[currentSuggestionIndex];
    
    // Log the dismissal for analytics
    if (currentSuggestion.subject && state.user) {
      recordSuggestionDismissal(currentSuggestion.subject);
    }
    
    setIsOpen(false);
    
    // If the user has dismissed 3+ targeted suggestions, notify the teacher
    // (This would require tracking dismissals count in the StudentRecordContext)
  };
  
  const handleTakeAction = () => {
    const currentSuggestion = suggestions[currentSuggestionIndex];
    
    // Log the action for analytics
    if (currentSuggestion.subject && state.user) {
      recordSuggestionAction(currentSuggestion.subject, currentSuggestion.actionType);
    }
    
    // Take action based on the suggestion type
    if (currentSuggestion.actionType === 'study' || currentSuggestion.actionType === 'review') {
      // Navigate to study session with the suggested subject
      navigate('/study', { 
        state: { 
          subject: currentSuggestion.subject,
          topic: currentSuggestion.topic 
        } 
      });
    } else if (currentSuggestion.actionType === 'quiz') {
      // Navigate to quiz with the suggested subject
      navigate(`/quiz?subject=${currentSuggestion.subject}`);
    }
    
    // Close the suggestion box
    setIsOpen(false);
  };
  
  const currentSuggestion = suggestions[currentSuggestionIndex];
  
  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            className="rounded-full h-12 w-12 bg-purple-700 hover:bg-purple-800 text-white p-0 shadow-lg"
            onClick={() => setIsOpen(!isOpen)}
          >
            <HoverCard>
              <HoverCardTrigger asChild>
                <MessageSquare className="h-6 w-6" />
              </HoverCardTrigger>
              <HoverCardContent className="w-fit">
                <p className="text-sm">AthroSystem</p>
              </HoverCardContent>
            </HoverCard>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" side="left" sideOffset={5}>
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">AthroSystem</CardTitle>
                  <CardDescription className="text-purple-100">Your study companion</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm">
                    {currentSuggestion?.text || "Welcome to Athro AI!"}
                  </p>
                </div>
                {suggestions.length > 1 && (
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs flex items-center gap-1 text-purple-700"
                      onClick={handleNextSuggestion}
                    >
                      Next suggestion <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" size="sm" onClick={handleDismiss}>
                Dismiss
              </Button>
              <Button 
                size="sm"
                onClick={handleTakeAction}
                disabled={currentSuggestion?.actionType === 'info'}
              >
                Take action
              </Button>
            </CardFooter>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AthroSystem;
