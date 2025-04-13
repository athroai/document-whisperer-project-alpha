
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, query, 
  where, getDocs, orderBy, serverTimestamp, Timestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { StudyGoal } from '@/types/goals';
import { v4 as uuidv4 } from 'uuid';

export class GoalService {
  private static COLLECTION = 'goals';

  // Create a new study goal
  static async createGoal(
    userId: string, 
    goalData: Omit<StudyGoal, 'id' | 'userId' | 'createdAt' | 'status' | 'completionRate'>
  ): Promise<StudyGoal> {
    try {
      const newGoal: Omit<StudyGoal, 'id'> = {
        userId,
        ...goalData,
        createdAt: new Date().toISOString(),
        status: 'active',
        completionRate: 0,
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...newGoal,
        createdAt: serverTimestamp(),
      });
      
      return {
        id: docRef.id,
        ...newGoal
      };
    } catch (error) {
      console.error('Error creating goal:', error);
      // For offline/mock support, create a local goal with UUID
      const id = uuidv4();
      const newGoal: StudyGoal = {
        id,
        userId,
        ...goalData,
        createdAt: new Date().toISOString(),
        status: 'active',
        completionRate: 0,
      };
      
      // Store in localStorage for persistence
      const existingGoals = JSON.parse(localStorage.getItem('study_goals') || '[]');
      localStorage.setItem('study_goals', JSON.stringify([...existingGoals, newGoal]));
      
      return newGoal;
    }
  }

  // Get all goals for a user
  static async getUserGoals(userId: string): Promise<StudyGoal[]> {
    try {
      const goalsQuery = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(goalsQuery);
      const goals: StudyGoal[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Convert Firestore timestamp to ISO string
        const createdAt = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString()
          : data.createdAt;
          
        goals.push({
          id: doc.id,
          ...data,
          createdAt
        } as StudyGoal);
      });
      
      return goals;
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Fallback to localStorage for offline mode
      const localGoals = JSON.parse(localStorage.getItem('study_goals') || '[]');
      return localGoals.filter((goal: StudyGoal) => goal.userId === userId);
    }
  }

  // Update a goal
  static async updateGoal(goalId: string, updates: Partial<StudyGoal>): Promise<void> {
    try {
      const goalRef = doc(db, this.COLLECTION, goalId);
      await updateDoc(goalRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      // Update in localStorage for offline mode
      const localGoals = JSON.parse(localStorage.getItem('study_goals') || '[]');
      const updatedGoals = localGoals.map((goal: StudyGoal) => {
        if (goal.id === goalId) {
          return { ...goal, ...updates };
        }
        return goal;
      });
      localStorage.setItem('study_goals', JSON.stringify(updatedGoals));
    }
  }

  // Delete a goal
  static async deleteGoal(goalId: string): Promise<void> {
    try {
      const goalRef = doc(db, this.COLLECTION, goalId);
      await deleteDoc(goalRef);
    } catch (error) {
      console.error('Error deleting goal:', error);
      // Delete from localStorage for offline mode
      const localGoals = JSON.parse(localStorage.getItem('study_goals') || '[]');
      const filteredGoals = localGoals.filter((goal: StudyGoal) => goal.id !== goalId);
      localStorage.setItem('study_goals', JSON.stringify(filteredGoals));
    }
  }

  // Mark a goal as complete
  static async completeGoal(goalId: string): Promise<void> {
    return this.updateGoal(goalId, {
      status: 'completed',
      completionRate: 100
    });
  }

  // Update goal progress
  static async updateGoalProgress(goalId: string, completionRate: number): Promise<void> {
    return this.updateGoal(goalId, {
      completionRate
    });
  }

  // Get AI suggestions for a goal
  static async getGoalSuggestions(subject: string, title: string): Promise<string[]> {
    // In a real app, this would call an AI service
    // For now, we'll return mock suggestions
    const suggestions = [
      `Break down your "${title}" goal into smaller weekly tasks`,
      `Try daily 15-minute focused study sessions on this topic`,
      `Review related past papers to measure your progress`,
      `Connect with AthroAI for personalized help with this goal`,
    ];
    
    return suggestions;
  }

  // Generate goal suggestions based on user data
  static generateGoalSuggestions(
    subjects: string[], 
    examDate?: string
  ): Omit<StudyGoal, 'id' | 'userId' | 'createdAt' | 'status' | 'completionRate'>[] {
    const now = new Date();
    const targetDate = examDate ? new Date(examDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    return subjects.map(subject => {
      const suggestions: Omit<StudyGoal, 'id' | 'userId' | 'createdAt' | 'status' | 'completionRate'> = {
        subject,
        title: this.generateGoalTitle(subject),
        description: this.generateGoalDescription(subject),
        targetDate: targetDate.toISOString().split('T')[0],
        aiSuggestions: this.generateMockSuggestions(subject)
      };
      
      return suggestions;
    });
  }
  
  // Helper method to generate a goal title based on subject
  private static generateGoalTitle(subject: string): string {
    const subjectTitles: Record<string, string[]> = {
      'maths': [
        'Master Algebra Fundamentals',
        'Improve Geometry Problem Solving',
        'Boost Trigonometry Understanding',
        'Excel in Statistics and Probability'
      ],
      'science': [
        'Master Chemical Reactions',
        'Understand Physics Formulas',
        'Improve Biology Diagrams',
        'Become Confident with Scientific Method'
      ],
      'english': [
        'Improve Essay Structure',
        'Master Literary Analysis',
        'Develop Persuasive Writing Skills',
        'Enhance Reading Comprehension'
      ],
      'history': [
        'Master Historical Timeline Analysis',
        'Improve Source Evaluation Skills',
        'Develop Historical Argument Writing',
        'Understand Cause and Effect in History'
      ]
    };
    
    const titles = subjectTitles[subject.toLowerCase()] || [
      'Master Key Concepts',
      'Improve Problem Solving',
      'Boost Exam Confidence',
      'Develop Advanced Understanding'
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  }
  
  // Helper method to generate a goal description based on subject
  private static generateGoalDescription(subject: string): string {
    const subjectDescriptions: Record<string, string[]> = {
      'maths': [
        'Focus on practicing and mastering key formulas and their applications in different scenarios.',
        'Improve problem-solving speed while maintaining accuracy for exam conditions.',
        'Work through progressively challenging problems to build confidence and skills.'
      ],
      'science': [
        'Practice explaining scientific principles using proper terminology and examples.',
        'Master diagrams and visual explanations of key processes.',
        'Connect theoretical concepts with practical applications and experiments.'
      ],
      'english': [
        'Develop structured analysis techniques for different text types.',
        'Improve critical thinking and interpretation skills across various genres.',
        'Build vocabulary and expression to enhance writing quality.'
      ],
      'history': [
        'Focus on analyzing historical sources and understanding their context.',
        'Develop clear arguments supported by historical evidence.',
        'Master the chronology and connections between key historical events.'
      ]
    };
    
    const descriptions = subjectDescriptions[subject.toLowerCase()] || [
      'Focus on mastering the core concepts through regular practice.',
      'Build confidence by tackling progressively more challenging examples.',
      'Prepare systematically for assessments with targeted revision.'
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
  
  // Helper method to generate mock suggestions
  private static generateMockSuggestions(subject: string): string[] {
    const commonSuggestions = [
      'Break your study sessions into 25-minute focused blocks with short breaks',
      'Create flashcards for key concepts and review them daily',
      'Teach concepts to someone else to solidify your understanding',
      'Practice past exam questions under timed conditions'
    ];
    
    const subjectSuggestions: Record<string, string[]> = {
      'maths': [
        'Work through problem sets with increasing difficulty',
        'Focus on understanding underlying principles rather than memorizing',
        'Create a formula sheet in your own words and examples'
      ],
      'science': [
        'Draw diagrams to visualize complex processes',
        'Connect theories to real-world applications',
        'Create concept maps showing relationships between ideas'
      ],
      'english': [
        'Practice analyzing unseen texts using the PEE/PEEL method',
        'Build a personal vocabulary bank of powerful analytical terms',
        'Practice timed essay writing focusing on structure'
      ],
      'history': [
        'Create timelines for key periods with major events',
        'Practice source analysis with a focus on reliability and utility',
        'Develop argument frameworks for common essay questions'
      ]
    };
    
    // Combine common suggestions with subject-specific ones
    const specificSuggestions = subjectSuggestions[subject.toLowerCase()] || [];
    const allSuggestions = [...commonSuggestions, ...specificSuggestions];
    
    // Return 2-3 random suggestions
    const count = 2 + Math.floor(Math.random() * 2);
    const shuffled = allSuggestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

export default GoalService;
