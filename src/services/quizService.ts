import { Question, Answer, QuizResult, mockQuestions } from '@/types/quiz';

// Toggle this to false when connecting to Firestore
const useMock = true;

// Mock implementation
const mockImplementation = {
  getQuestionsBySubject: async (
    subject: string, 
    difficulty: number,
    count: number = 5,
    examBoard?: string
  ): Promise<Question[]> => {
    console.log(`Fetching ${count} questions for ${subject} at difficulty ${difficulty} for exam board ${examBoard || 'any'}`);
    
    // Filter by subject
    let filteredQuestions = mockQuestions.filter(q => q.subject === subject);
    
    // Filter by exam board if specified and not 'none'
    if (examBoard && examBoard !== 'none') {
      const examBoardQuestions = filteredQuestions.filter(q => 
        q.examBoard && q.examBoard.toLowerCase() === examBoard.toLowerCase()
      );
      
      // If we have enough questions with the specified exam board, use those
      if (examBoardQuestions.length >= count) {
        filteredQuestions = examBoardQuestions;
      }
      // Otherwise, we'll fall back to all questions but prioritize the requested exam board
      else {
        // Sort to prioritize matching exam board questions
        filteredQuestions.sort((a, b) => {
          const aMatch = a.examBoard && a.examBoard.toLowerCase() === examBoard.toLowerCase();
          const bMatch = b.examBoard && b.examBoard.toLowerCase() === examBoard.toLowerCase();
          
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
      }
    }
    
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
      
      // Update user object if available
      const savedUser = localStorage.getItem('athro_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        
        if (!user.confidenceScores) {
          user.confidenceScores = {};
        }
        
        user.confidenceScores[subject] = confidence;
        localStorage.setItem('athro_user', JSON.stringify(user));
      }
      
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
    count: number = 5,
    examBoard?: string
  ): Promise<Question[]> => {
    // TODO: Implement Firestore query with exam board filter
    console.log('Firestore: getQuestionsBySubject not yet implemented');
    
    // For now, fall back to mock
    return mockImplementation.getQuestionsBySubject(subject, difficulty, count, examBoard);
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
