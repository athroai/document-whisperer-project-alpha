
import { Question, Answer, QuizResult, mockQuestions } from '@/types/quiz';

// Toggle this to false when connecting to Firestore
const useMock = true;

// Mock implementation
const mockImplementation = {
  getQuestionsBySubject: async (
    subject: string, 
    difficulty: number, 
    count: number = 5
  ): Promise<Question[]> => {
    console.log(`Fetching ${count} questions for ${subject} at difficulty ${difficulty}`);
    
    // Filter by subject
    let filteredQuestions = mockQuestions.filter(q => q.subject === subject);
    
    // Try to match exact difficulty
    let questions = filteredQuestions.filter(q => q.difficulty === difficulty);
    
    // Fallback 1: Use difficulty ±1
    if (questions.length < count) {
      console.log(`Not enough questions at difficulty ${difficulty}, trying ±1`);
      const expandedQuestions = filteredQuestions.filter(
        q => q.difficulty === difficulty - 1 || q.difficulty === difficulty + 1
      );
      questions = [...questions, ...expandedQuestions];
    }
    
    // Fallback 2: Use any available questions
    if (questions.length < count) {
      console.log('Still not enough questions, using any available difficulty');
      questions = filteredQuestions;
    }
    
    // Randomize and select requested number
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },
  
  saveQuizResult: async (result: QuizResult): Promise<string> => {
    console.log('Saving quiz result to localStorage:', result);
    
    try {
      // Get existing results
      const savedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
      
      // Add new result with generated ID
      const newResult = { 
        ...result, 
        id: `mock-${Date.now()}` 
      };
      
      savedResults.push(newResult);
      
      // Save back to localStorage
      localStorage.setItem('quizResults', JSON.stringify(savedResults));
      
      return newResult.id;
    } catch (error) {
      console.error('Error saving quiz result:', error);
      return '';
    }
  },
  
  getQuizResults: async (userId?: string): Promise<QuizResult[]> => {
    console.log('Fetching quiz results for', userId || 'all users');
    
    try {
      const savedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
      
      if (userId) {
        return savedResults.filter((result: QuizResult) => result.userId === userId);
      }
      
      return savedResults;
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      return [];
    }
  },
  
  updateUserConfidenceScores: async (
    userId: string, 
    subject: string, 
    confidence: number
  ): Promise<boolean> => {
    console.log(`Updating confidence score for user ${userId} in ${subject} to ${confidence}`);
    
    try {
      // For mock, we'll save this in a different localStorage key
      const confidenceScores = JSON.parse(localStorage.getItem('confidenceScores') || '{}');
      
      if (!confidenceScores[userId]) {
        confidenceScores[userId] = {};
      }
      
      confidenceScores[userId][subject] = confidence;
      localStorage.setItem('confidenceScores', JSON.stringify(confidenceScores));
      
      return true;
    } catch (error) {
      console.error('Error updating confidence score:', error);
      return false;
    }
  }
};

// Firestore implementation - placeholder for future implementation
const firestoreImplementation = {
  getQuestionsBySubject: async (
    subject: string, 
    difficulty: number, 
    count: number = 5
  ): Promise<Question[]> => {
    // TODO: Implement Firestore query
    console.log('Firestore: getQuestionsBySubject not yet implemented');
    
    // For now, fall back to mock
    return mockImplementation.getQuestionsBySubject(subject, difficulty, count);
  },
  
  saveQuizResult: async (result: QuizResult): Promise<string> => {
    // TODO: Implement Firestore save
    console.log('Firestore: saveQuizResult not yet implemented');
    
    // For now, fall back to mock
    return mockImplementation.saveQuizResult(result);
  },
  
  getQuizResults: async (userId?: string): Promise<QuizResult[]> => {
    // TODO: Implement Firestore query
    console.log('Firestore: getQuizResults not yet implemented');
    
    // For now, fall back to mock
    return mockImplementation.getQuizResults(userId);
  },
  
  updateUserConfidenceScores: async (
    userId: string, 
    subject: string, 
    confidence: number
  ): Promise<boolean> => {
    // TODO: Implement Firestore update
    console.log('Firestore: updateUserConfidenceScores not yet implemented');
    
    // For now, fall back to mock
    return mockImplementation.updateUserConfidenceScores(userId, subject, confidence);
  }
};

// Export the appropriate implementation based on useMock flag
export const quizService = useMock ? mockImplementation : firestoreImplementation;
