
import { supabase } from '@/integrations/supabase/client';
import { StudyGoal, NewGoalData, GoalUpdateData } from '@/types/goals';
import { v4 as uuidv4 } from 'uuid';

// TODO: Create a goals table in Supabase when possible
// For now, this service will use local storage as fallback

export class GoalsService {
  // Get all goals for a user
  static async getGoalsForUser(userId: string): Promise<StudyGoal[]> {
    try {
      // TODO: Replace with actual Supabase table query when goals table is created
      // For now, return mock data from localStorage
      return this.getLocalMockGoals(userId);
    } catch (error) {
      console.error("Error getting goals:", error);
      return [];
    }
  }
  
  // Create a new goal
  static async createGoal(userId: string, goalData: NewGoalData): Promise<string | null> {
    try {
      // TODO: Replace with actual Supabase table insert when goals table is created
      // For now, create a local mock goal
      const goal = this.createLocalMockGoal(userId, goalData);
      return goal.id;
    } catch (error) {
      console.error("Error creating goal:", error);
      return null;
    }
  }
  
  // Update an existing goal
  static async updateGoal(goalId: string, updateData: GoalUpdateData): Promise<boolean> {
    try {
      // TODO: Replace with actual Supabase table update when goals table is created
      // For now, update local storage
      return this.updateLocalMockGoal(goalId, updateData);
    } catch (error) {
      console.error("Error updating goal:", error);
      return false;
    }
  }
  
  // Delete a goal
  static async deleteGoal(goalId: string): Promise<boolean> {
    try {
      // TODO: Replace with actual Supabase table delete when goals table is created
      // For now, delete from local storage
      const allGoals = JSON.parse(localStorage.getItem('athro_goals') || '[]');
      const filteredGoals = allGoals.filter((goal: StudyGoal) => goal.id !== goalId);
      localStorage.setItem('athro_goals', JSON.stringify(filteredGoals));
      return true;
    } catch (error) {
      console.error("Error deleting goal:", error);
      return false;
    }
  }
  
  // Get a single goal by id
  static async getGoal(goalId: string): Promise<StudyGoal | null> {
    try {
      // TODO: Replace with actual Supabase table query when goals table is created
      // For now, get from local storage
      const allGoals = JSON.parse(localStorage.getItem('athro_goals') || '[]');
      const goal = allGoals.find((goal: StudyGoal) => goal.id === goalId);
      return goal || null;
    } catch (error) {
      console.error("Error getting goal:", error);
      return null;
    }
  }
  
  // Create a mock goal (for testing or when Supabase is unavailable)
  static createLocalMockGoal(userId: string, goalData: NewGoalData): StudyGoal {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const goal: StudyGoal = {
      id,
      userId,
      ...goalData,
      createdAt: now,
      status: 'active',
      completionRate: 0
    };
    
    // Store in localStorage for persistence
    const existingGoals = JSON.parse(localStorage.getItem('athro_goals') || '[]');
    existingGoals.push(goal);
    localStorage.setItem('athro_goals', JSON.stringify(existingGoals));
    
    return goal;
  }
  
  // Get mock goals from localStorage
  static getLocalMockGoals(userId: string): StudyGoal[] {
    const allGoals = JSON.parse(localStorage.getItem('athro_goals') || '[]');
    return allGoals.filter((goal: StudyGoal) => goal.userId === userId);
  }
  
  // Update a mock goal in localStorage
  static updateLocalMockGoal(goalId: string, updateData: GoalUpdateData): boolean {
    const allGoals = JSON.parse(localStorage.getItem('athro_goals') || '[]');
    const goalIndex = allGoals.findIndex((goal: StudyGoal) => goal.id === goalId);
    
    if (goalIndex === -1) return false;
    
    allGoals[goalIndex] = {
      ...allGoals[goalIndex],
      ...updateData
    };
    
    localStorage.setItem('athro_goals', JSON.stringify(allGoals));
    return true;
  }
  
  // Generate AI-based goal suggestions based on user preferences
  static generateGoalSuggestions(
    subject: string, 
    examDate: string, 
    weakAreas: string[], 
    pace: 'slow' | 'medium' | 'fast'
  ): NewGoalData[] {
    // This would ideally call an AI service, but for now we'll mock it
    const weekInMillis = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();
    
    // Calculate target dates based on pace and exam date
    const examDateObj = new Date(examDate);
    const timeUntilExam = examDateObj.getTime() - now.getTime();
    const weeksUntilExam = Math.max(1, Math.floor(timeUntilExam / weekInMillis));
    
    // Number of goals to generate depends on pace
    const goalsCount = pace === 'slow' ? 2 : pace === 'medium' ? 3 : 4;
    
    // For each weak area, generate a goal
    return weakAreas.slice(0, goalsCount).map((area, index) => {
      // Distribute goals evenly until exam date
      const targetWeek = Math.max(1, Math.floor(weeksUntilExam / (goalsCount + 1) * (index + 1)));
      const targetDate = new Date(now.getTime() + (targetWeek * weekInMillis)).toISOString().split('T')[0];
      
      return {
        subject,
        title: `Master ${area} by ${new Date(targetDate).toLocaleDateString()}`,
        description: `Focus on improving your understanding and application of ${area} concepts.`,
        targetDate,
        motivation: `This goal will help you strengthen one of your weak areas before the ${subject} exam.`
      };
    });
  }
  
  // Calculate progress for a goal based on user activity
  static async calculateGoalProgress(goalId: string, userId: string): Promise<number> {
    try {
      const goal = await this.getGoal(goalId);
      if (!goal) return 0;
      
      // This would normally query user activity records related to the goal subject
      // For now, we'll just simulate progress
      const today = new Date();
      const targetDate = new Date(goal.targetDate);
      const createdAt = new Date(goal.createdAt);
      
      // If target date is in the past, return 100% if completed, or current %
      if (today > targetDate) {
        return goal.status === 'completed' ? 100 : goal.completionRate || 0;
      }
      
      // Calculate progress based on time elapsed
      const totalDuration = targetDate.getTime() - createdAt.getTime();
      const elapsed = today.getTime() - createdAt.getTime();
      
      // Cap at 95% until marked as completed
      let timeBasedProgress = Math.min(95, Math.round((elapsed / totalDuration) * 100));
      
      // In a real system, we'd adjust this based on:
      // - Completed assignments in the subject
      // - Quiz scores
      // - Study session time
      // etc.
      
      return timeBasedProgress;
    } catch (error) {
      console.error("Error calculating goal progress:", error);
      return 0;
    }
  }
  
  // Generate an encouragement message based on progress and subject
  static generateEncouragementMessage(
    subject: string, 
    completionRate: number, 
    daysLeft: number
  ): string {
    if (completionRate >= 100) {
      return `Great job completing your ${subject} goal! Would you like to create a new goal?`;
    }
    
    if (daysLeft <= 0) {
      return `Your ${subject} goal deadline has passed. Consider updating your timeline or marking it completed.`;
    }
    
    if (completionRate < 10) {
      return `You're just getting started with your ${subject} goal. Let's work on it together!`;
    } else if (completionRate < 40) {
      return `You're making progress on your ${subject} goal. Keep up the good work!`;
    } else if (completionRate < 70) {
      return `You're over halfway to completing your ${subject} goal. Impressive dedication!`;
    } else if (completionRate < 90) {
      return `You're nearly there with your ${subject} goal! Just a final push needed.`;
    } else {
      return `You're so close to finishing your ${subject} goal! Let's complete it together.`;
    }
  }
}

export default GoalsService;
