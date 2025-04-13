
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StudyGoal } from '@/types/goals';
import { CalendarDays, Flag, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoalEncouragementProps {
  goals: StudyGoal[];
  onNavigateToGoal?: () => void;
}

export function GoalEncouragement({ goals, onNavigateToGoal }: GoalEncouragementProps) {
  const [message, setMessage] = useState<string>("");
  const [activeGoal, setActiveGoal] = useState<StudyGoal | null>(null);
  
  useEffect(() => {
    // Select a goal to highlight based on urgency or progress
    if (goals.length === 0) {
      setMessage("You don't have any study goals yet. Create one to track your progress!");
      setActiveGoal(null);
      return;
    }
    
    // Find goals that are active
    const activeGoals = goals.filter(goal => goal.status === 'active');
    
    if (activeGoals.length === 0) {
      setMessage("All your study goals are completed. Great job! Want to set a new challenge?");
      setActiveGoal(null);
      return;
    }
    
    // Check for urgent goals (less than 7 days left)
    const today = new Date();
    const urgentGoals = activeGoals.filter(goal => {
      const targetDate = new Date(goal.targetDate);
      const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7 && daysLeft >= 0;
    });
    
    // Check for goals with low progress (less than 40%)
    const lowProgressGoals = activeGoals.filter(goal => 
      (goal.completionRate || 0) < 40
    );
    
    // Prioritize urgent goals, then low progress, then random active goal
    const selectedGoal = urgentGoals.length > 0 
      ? urgentGoals[0] 
      : lowProgressGoals.length > 0
        ? lowProgressGoals[0]
        : activeGoals[0];
    
    setActiveGoal(selectedGoal);
    
    // Create appropriate message
    const targetDate = new Date(selectedGoal.targetDate);
    const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 3 && daysLeft >= 0) {
      setMessage(`Your "${selectedGoal.title}" goal is due soon! Only ${daysLeft} days left to complete it.`);
    } else if (daysLeft < 0) {
      setMessage(`Your "${selectedGoal.title}" goal is overdue. Consider updating the target date or marking it complete.`);
    } else if ((selectedGoal.completionRate || 0) < 30) {
      setMessage(`Your "${selectedGoal.title}" goal needs attention! You're at ${selectedGoal.completionRate || 0}% progress.`);
    } else if ((selectedGoal.completionRate || 0) > 80) {
      setMessage(`You're making excellent progress on "${selectedGoal.title}"! Just a final push needed.`);
    } else {
      setMessage(`Keep working on your "${selectedGoal.title}" goal. Consistent effort leads to success!`);
    }
    
  }, [goals]);
  
  if (!activeGoal && goals.length === 0) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <Target className="h-5 w-5 text-blue-700" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-800">{message}</p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-700" 
              onClick={onNavigateToGoal}
            >
              Create your first goal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!activeGoal) {
    return null;
  }
  
  const getCardStyles = () => {
    const targetDate = new Date(activeGoal.targetDate);
    const today = new Date();
    const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return "bg-red-50 border-red-200";
    } else if (daysLeft <= 3) {
      return "bg-amber-50 border-amber-200";
    } else if ((activeGoal.completionRate || 0) > 80) {
      return "bg-green-50 border-green-200";
    } else {
      return "bg-blue-50 border-blue-200";
    }
  };
  
  const getIconStyles = () => {
    const targetDate = new Date(activeGoal.targetDate);
    const today = new Date();
    const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return "bg-red-100 text-red-700";
    } else if (daysLeft <= 3) {
      return "bg-amber-100 text-amber-700";
    } else if ((activeGoal.completionRate || 0) > 80) {
      return "bg-green-100 text-green-700";
    } else {
      return "bg-blue-100 text-blue-700";
    }
  };
  
  const getButtonStyles = () => {
    const targetDate = new Date(activeGoal.targetDate);
    const today = new Date();
    const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return "text-red-700";
    } else if (daysLeft <= 3) {
      return "text-amber-700";
    } else if ((activeGoal.completionRate || 0) > 80) {
      return "text-green-700";
    } else {
      return "text-blue-700";
    }
  };
  
  return (
    <Card className={getCardStyles()}>
      <CardContent className="p-4 flex items-center space-x-4">
        <div className={`p-2 rounded-full ${getIconStyles()}`}>
          <Flag className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{message}</p>
          <Button 
            variant="link" 
            className={`p-0 h-auto ${getButtonStyles()}`} 
            onClick={onNavigateToGoal}
          >
            View goal details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default GoalEncouragement;
