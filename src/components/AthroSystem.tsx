
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, ArrowRight } from 'lucide-react';
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

// Mock student data for subject tracking
interface SubjectData {
  confidence: number;
  lastStudied: string | null;
  sessionsThisWeek: number;
  quizScores: number[];
  averageScore: number;
}

interface StudentSubjectRecord {
  maths: SubjectData;
  science: SubjectData;
  english: SubjectData;
  history: SubjectData;
}

const defaultSubjectData: SubjectData = {
  confidence: 5,
  lastStudied: null,
  sessionsThisWeek: 0,
  quizScores: [],
  averageScore: 0
};

// Mock initial data
const mockStudentRecord: StudentSubjectRecord = {
  maths: { ...defaultSubjectData, sessionsThisWeek: 3, confidence: 7, lastStudied: '2025-04-10' },
  science: { ...defaultSubjectData, sessionsThisWeek: 0, confidence: 6, lastStudied: '2025-04-05' },
  english: { ...defaultSubjectData, sessionsThisWeek: 2, confidence: 8, lastStudied: '2025-04-09' },
  history: { ...defaultSubjectData, sessionsThisWeek: 1, confidence: 4, lastStudied: '2025-04-07' }
};

// Generate suggestions based on student data
const generateSuggestions = (data: StudentSubjectRecord): string[] => {
  const suggestions: string[] = [];
  
  // Check for study balance
  const highestSessions = Math.max(...Object.values(data).map(subject => subject.sessionsThisWeek));
  const lowestSessions = Math.min(...Object.values(data).map(subject => subject.sessionsThisWeek));
  
  if (highestSessions >= 3 && lowestSessions === 0) {
    const neglectedSubjects = Object.entries(data)
      .filter(([_, subject]) => subject.sessionsThisWeek === 0)
      .map(([name, _]) => name);
      
    if (neglectedSubjects.length > 0) {
      suggestions.push(`You've had ${highestSessions} sessions in some subjects but none in ${neglectedSubjects.join(', ')} this week. Shall we balance your study time?`);
    }
  }
  
  // Check for low confidence
  const lowConfidenceSubjects = Object.entries(data)
    .filter(([_, subject]) => subject.confidence < 5)
    .map(([name, _]) => name);
    
  if (lowConfidenceSubjects.length > 0) {
    suggestions.push(`Your confidence in ${lowConfidenceSubjects.join(', ')} seems lower than other subjects. Would you like to review these topics?`);
  }
  
  // Check for inactive subjects (not studied in the last 7 days)
  const currentDate = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(currentDate.getDate() - 7);
  
  const inactiveSubjects = Object.entries(data)
    .filter(([_, subject]) => {
      if (!subject.lastStudied) return true;
      const lastStudyDate = new Date(subject.lastStudied);
      return lastStudyDate < sevenDaysAgo;
    })
    .map(([name, _]) => name);
    
  if (inactiveSubjects.length > 0) {
    suggestions.push(`It's been over a week since you studied ${inactiveSubjects.join(', ')}. A quick revision session could be helpful!`);
  }
  
  // If no specific suggestions, add a general one
  if (suggestions.length === 0) {
    suggestions.push("Your study pattern looks well-balanced! Keep up the good work.");
  }
  
  return suggestions;
};

const AthroSystem: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const { toast } = useToast();
  
  // Initialize suggestions
  useEffect(() => {
    const newSuggestions = generateSuggestions(mockStudentRecord);
    setSuggestions(newSuggestions);
    
    // Show a notification after a delay to simulate proactive behavior
    const timer = setTimeout(() => {
      if (newSuggestions.length > 0) {
        toast({
          title: "AthroSystem has a suggestion",
          description: "Click on the AthroSystem icon to view",
          duration: 5000,
        });
      }
    }, 30000); // 30 seconds delay
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  const handleNextSuggestion = () => {
    setCurrentSuggestionIndex((prev) => 
      prev < suggestions.length - 1 ? prev + 1 : 0
    );
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
                    {currentSuggestion}
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
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Dismiss
              </Button>
              <Button size="sm">
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
