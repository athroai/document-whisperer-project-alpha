import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Sparkles } from 'lucide-react';
import { StudyGoal } from '@/types/goals';
import { GoalCard } from './GoalCard';
import { CreateGoalModal } from './CreateGoalModal';
import SuggestGoalsModal from './SuggestGoalsModal';
import GoalsService from '@/services/goalsService';
import { useAuth } from '@/contexts/AuthContext';
import { NewGoalData, GoalUpdateData } from '@/types/goals';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

export function MyGoalsTab() {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeGoals, setActiveGoals] = useState<StudyGoal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<StudyGoal[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [suggestModalOpen, setSuggestModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<StudyGoal | null>(null);
  const { state } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchGoals = async () => {
      if (state.user) {
        setIsLoading(true);
        try {
          let userGoals = await GoalsService.getGoalsForUser(state.user.id);
          
          if (userGoals.length === 0) {
            userGoals = GoalsService.getLocalMockGoals(state.user.id);
          }
          
          const updatedGoals = await Promise.all(
            userGoals.map(async (goal) => {
              if (goal.status !== 'completed') {
                const progress = await GoalsService.calculateGoalProgress(goal.id, state.user!.id);
                return { ...goal, completionRate: progress };
              }
              return goal;
            })
          );
          
          setGoals(updatedGoals);
        } catch (error) {
          console.error("Error fetching goals:", error);
          const mockGoals = GoalsService.getLocalMockGoals(state.user.id);
          setGoals(mockGoals);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchGoals();
  }, [state.user]);
  
  useEffect(() => {
    setActiveGoals(goals.filter(goal => goal.status === 'active'));
    setCompletedGoals(goals.filter(goal => goal.status === 'completed'));
  }, [goals]);
  
  const handleCreateGoal = async (goalData: NewGoalData) => {
    if (!state.user) return;
    
    try {
      let goalId = await GoalsService.createGoal(state.user.id, goalData);
      
      if (!goalId) {
        const mockGoal = GoalsService.createLocalMockGoal(state.user.id, goalData);
        setGoals(prev => [mockGoal, ...prev]);
        return;
      }
      
      const userGoals = await GoalsService.getGoalsForUser(state.user.id);
      setGoals(userGoals);
      
      toast({
        title: "Goal Created",
        description: "Your study goal has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your goal. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateGoal = async (goalId: string, goalData: NewGoalData) => {
    try {
      const success = await GoalsService.updateGoal(goalId, goalData as GoalUpdateData);
      
      if (!success) {
        GoalsService.updateLocalMockGoal(goalId, goalData as GoalUpdateData);
      }
      
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, ...goalData } : goal
      ));
      
      setEditingGoal(null);
      
      toast({
        title: "Goal Updated",
        description: "Your study goal has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your goal. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteGoal = async (goalId: string) => {
    try {
      const success = await GoalsService.deleteGoal(goalId);
      
      if (!success) {
        const localGoals = JSON.parse(localStorage.getItem('athro_goals') || '[]');
        const updatedLocalGoals = localGoals.filter((goal: StudyGoal) => goal.id !== goalId);
        localStorage.setItem('athro_goals', JSON.stringify(updatedLocalGoals));
      }
      
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      
      toast({
        title: "Goal Deleted",
        description: "Your study goal has been removed.",
      });
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting your goal. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleStatusChange = async (goalId: string, newStatus: 'active' | 'completed' | 'abandoned' | 'expired') => {
    try {
      const updateData: GoalUpdateData = { status: newStatus };
      if (newStatus === 'completed') updateData.completionRate = 100;
      
      const success = await GoalsService.updateGoal(goalId, updateData);
      
      if (!success) {
        GoalsService.updateLocalMockGoal(goalId, updateData);
      }
      
      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, status: newStatus, completionRate: newStatus === 'completed' ? 100 : goal.completionRate } 
          : goal
      ) as StudyGoal[]);
      
      toast({
        title: newStatus === 'completed' ? "Goal Completed!" : "Status Updated",
        description: newStatus === 'completed' 
          ? "Congratulations on achieving your study goal!" 
          : "Your goal status has been updated.",
      });
    } catch (error) {
      console.error("Error updating goal status:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the goal status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setEditingGoal(goal);
      setCreateModalOpen(true);
    }
  };
  
  const renderSkeletons = (count: number) => {
    return Array(count)
      .fill(0)
      .map((_, idx) => (
        <div key={idx} className="space-y-3">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-8 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      ));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center pb-2">
        <div>
          <h2 className="text-xl font-semibold">My Study Goals</h2>
          <p className="text-sm text-muted-foreground">Track your progress towards your study targets</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <Button 
            variant="outline"
            className="gap-1"
            onClick={() => setSuggestModalOpen(true)}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Suggest Goals</span>
            <span className="sm:hidden">Suggest</span>
          </Button>
          <Button 
            className="gap-1"
            onClick={() => {
              setEditingGoal(null);
              setCreateModalOpen(true);
            }}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Create New Goal</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active Goals
            {!isLoading && activeGoals.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {activeGoals.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {!isLoading && completedGoals.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {completedGoals.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="pt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderSkeletons(3)}
            </div>
          ) : activeGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.map((goal) => (
                <GoalCard 
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="font-medium mb-1">No active goals</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a study goal to start tracking your progress
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingGoal(null);
                  setCreateModalOpen(true);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create your first goal
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="pt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderSkeletons(2)}
            </div>
          ) : completedGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGoals.map((goal) => (
                <GoalCard 
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <h3 className="font-medium mb-1">No completed goals yet</h3>
              <p className="text-sm text-muted-foreground">
                Your completed goals will appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <CreateGoalModal
        onCreateGoal={handleCreateGoal}
        onUpdateGoal={handleUpdateGoal}
        editingGoal={editingGoal}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      
      <SuggestGoalsModal
        open={suggestModalOpen}
        onOpenChange={setSuggestModalOpen}
        onGoalSuggestionAccept={handleCreateGoal}
      />
    </div>
  );
}

export default MyGoalsTab;
