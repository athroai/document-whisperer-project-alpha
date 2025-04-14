import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StudyGoal } from '@/types/goals';
import { Calendar, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';
import GoalsService from '@/services/goalsService';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GoalCardProps {
  goal: StudyGoal;
  onEdit: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onStatusChange: (goalId: string, newStatus: 'active' | 'completed' | 'abandoned' | 'expired') => void;
}

export function GoalCard({ goal, onEdit, onDelete, onStatusChange }: GoalCardProps) {
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [encouragement, setEncouragement] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Calculate days left and get encouragement message
  useEffect(() => {
    const calculateDaysLeft = () => {
      const targetDate = new Date(goal.targetDate);
      const today = new Date();
      
      // Set time to midnight for accurate day calculation
      targetDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysLeft(diffDays);
    };
    
    calculateDaysLeft();
    setEncouragement(GoalsService.generateEncouragementMessage(
      goal.subject,
      goal.completionRate || 0,
      daysLeft
    ));
  }, [goal, daysLeft]);
  
  const handleMarkComplete = () => {
    onStatusChange(goal.id, 'completed');
    toast({
      title: "Goal completed!",
      description: "Congratulations on achieving your study goal.",
    });
  };
  
  const getStatusBadge = () => {
    if (goal.status === 'completed') {
      return <Badge className="bg-green-500">Completed</Badge>;
    } else if (goal.status === 'expired') {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (goal.status === 'abandoned') {
      return <Badge variant="outline" className="text-red-500 border-red-500">Abandoned</Badge>;
    } else if (daysLeft < 0) {
      return <Badge variant="outline" className="text-red-500 border-red-500">Overdue</Badge>;
    } else if (daysLeft <= 3) {
      return <Badge variant="outline" className="text-amber-500 border-amber-500">Due soon</Badge>;
    } else {
      return <Badge variant="outline">Active</Badge>;
    }
  };
  
  const getSubjectColor = () => {
    const subjectLower = goal.subject.toLowerCase();
    
    if (subjectLower.includes('math')) return 'bg-purple-50 text-purple-800';
    if (subjectLower.includes('science')) return 'bg-green-50 text-green-800';
    if (subjectLower.includes('english')) return 'bg-blue-50 text-blue-800';
    if (subjectLower.includes('history')) return 'bg-amber-50 text-amber-800';
    if (subjectLower.includes('geography')) return 'bg-emerald-50 text-emerald-800';
    if (subjectLower.includes('language')) return 'bg-pink-50 text-pink-800';
    if (subjectLower.includes('welsh')) return 'bg-red-50 text-red-800';
    if (subjectLower.includes('re')) return 'bg-indigo-50 text-indigo-800';
    
    return 'bg-gray-50 text-gray-800';
  };
  
  const getProgressColor = () => {
    const completion = goal.completionRate || 0;
    
    if (completion >= 80) return "bg-green-500";
    if (completion >= 50) return "bg-emerald-500";
    if (completion >= 25) return "bg-amber-500";
    return "bg-blue-500";
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <Badge className={`mb-2 ${getSubjectColor()}`}>{goal.subject}</Badge>
            <CardTitle className="text-lg">{goal.title}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-4">
          <p className="text-sm text-gray-600">{goal.description}</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
            </div>
            {goal.status === 'active' && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span className={daysLeft < 0 ? "text-red-500" : daysLeft <= 3 ? "text-amber-500" : ""}>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : 
                    daysLeft === 0 ? "Due today" : 
                    `${daysLeft} days left`}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{goal.completionRate || 0}%</span>
            </div>
            <Progress 
              value={goal.completionRate || 0} 
              indicatorClassName={getProgressColor()}
              className="h-2"
            />
          </div>
          
          {encouragement && (
            <p className="text-sm italic border-l-2 border-blue-200 pl-2 py-1 bg-blue-50 rounded">
              {encouragement}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        <div>
          {goal.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={handleMarkComplete}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(goal.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this study goal and all associated progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(goal.id);
                setDeleteDialogOpen(false);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default GoalCard;
