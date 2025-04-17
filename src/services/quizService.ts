import { Question, Answer, QuizResult, mockQuestions } from '@/types/quiz';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Toggle this to false since we're implementing real API
const useMock = false;

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

// Real implementation with OpenAI integration
const realImplementation = {
  getQuestionsBySubject: async (
    subject: string, 
    difficulty: number,
    count: number = 5,
    examBoard?: string
  ): Promise<Question[]> => {
    console.log(`Fetching ${count} questions for ${subject} at difficulty ${difficulty}`);
    
    try {
      // Display a loading toast
      const loadingToast = toast.loading(`Generating ${subject} questions...`);
      
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          subject,
          difficulty,
          count,
          examBoard
        }
      });
      
      // Dismiss the loading toast
      toast.dismiss(loadingToast);
      
      if (error) {
        console.error("Error from edge function:", error);
        toast.error(`Could not generate ${subject} questions`);
        return [];
      }
      
      if (!data || !data.questions) {
        console.error("Invalid response format from edge function:", data);
        toast.error(`Could not generate ${subject} questions`);
        return [];
      }

      // Log which API key was used (for monitoring)
      if (data.usedKey) {
        console.log("Quiz generated using:", data.usedKey);
      }

      // If using mock questions, show a warning toast
      if (data.fromMock) {
        toast.warning(`Using sample ${subject} questions - quiz generation service unavailable`);
      } else {
        toast.success(`${subject} questions ready!`);
      }
      
      // Process the questions to ensure they have the right format
      const processedQuestions = data.questions.map((q: any, index: number) => {
        // Use the question's id if available, otherwise generate one
        const questionId = q.id || `question-${index}-${Date.now()}`;
        
        // Ensure we have answers in the correct format
        let answers;
        if (q.answers && Array.isArray(q.answers)) {
          // If answers already in the right format, use them
          answers = q.answers;
        } else if (q.options && Array.isArray(q.options)) {
          // Convert options array to answers array
          answers = q.options.map((option: string, i: number) => ({
            id: `answer-${questionId}-${i}`,
            text: option,
            isCorrect: option === q.correctAnswer
          }));
        } else {
          // Fallback empty answers
          answers = [];
        }
        
        return {
          id: questionId,
          text: q.text || q.question || `Question ${index + 1}`,
          answers: answers,
          difficulty: q.difficulty || difficulty,
          subject: subject,
          topic: q.topic || subject,
          hint: q.hint || "Think carefully about the question."
        };
      });
      
      return processedQuestions;
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error(`Could not generate ${subject} questions`);
      return mockQuestions.filter(q => q.subject === subject).slice(0, count);
    }
  },
  
  saveQuizResult: async (result: QuizResult): Promise<string> => {
    console.log('Saving quiz result to database:', result);
    
    try {
      // Save to diagnostic_quiz_results table
      const { data: quizData, error: quizError } = await supabase
        .from('diagnostic_quiz_results')
        .insert({
          student_id: result.userId,
          subject: result.subject,
          score: result.score,
          total_questions: result.totalQuestions
        })
        .select('id')
        .single();
        
      if (quizError) {
        console.error("Error saving to diagnostic_quiz_results:", quizError);
        throw quizError;
      }
        
      // Save to diagnostic_results table
      const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);
      const { data: diagData, error: diagError } = await supabase
        .from('diagnostic_results')
        .insert({
          student_id: result.userId,
          subject_name: result.subject,
          percentage_accuracy: scorePercentage
        })
        .select('id')
        .single();
        
      if (diagError) {
        console.error("Error saving to diagnostic_results:", diagError);
        throw diagError;
      }
      
      return quizData?.id || diagData?.id || '';
    } catch (error) {
      console.error('Error saving quiz result:', error);
      
      // Fall back to mock implementation if database save fails
      console.warn("Falling back to localStorage due to database error");
      return mockImplementation.saveQuizResult(result);
    }
  },
  
  getQuizResults: async (userId?: string): Promise<QuizResult[]> => {
    if (!userId) {
      console.warn('No userId provided for getQuizResults');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('diagnostic_quiz_results')
        .select('*')
        .eq('student_id', userId);
        
      if (error) {
        console.error('Error fetching quiz results:', error);
        throw error;
      }
      
      return data.map((row: any) => ({
        id: row.id,
        userId: row.student_id,
        subject: row.subject,
        score: row.score,
        totalQuestions: row.total_questions,
        questionsAsked: [],
        answers: [],
        confidenceBefore: 0,
        confidenceAfter: 0,
        timestamp: row.completed_at
      }));
    } catch (error) {
      console.error('Error getting quiz results:', error);
      
      // Fall back to mock implementation
      console.warn("Falling back to localStorage due to database error");
      return mockImplementation.getQuizResults(userId);
    }
  },
  
  updateUserConfidenceScores: async (
    userId: string, 
    subject: string, 
    confidence: number
  ): Promise<boolean> => {
    console.log(`Updating confidence score for user ${userId} in ${subject} to ${confidence}`);
    
    try {
      // Update confidence scores in student_subject_preferences
      const { error } = await supabase
        .from('student_subject_preferences')
        .update({ confidence_level: confidence })
        .eq('student_id', userId)
        .eq('subject', subject);
        
      if (error) {
        console.error('Error updating confidence score:', error);
        throw error;
      }
      
      // Also update profiles.confidence_scores JSON field
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('confidence_scores')
        .eq('id', userId)
        .single();
        
      if (profilesErrors) {
        console.error('Error fetching user profile:', profilesErrors);
      } else if (profiles) {
        const confidenceScores = profiles.confidence_scores || {};
        confidenceScores[subject] = confidence;
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ confidence_scores: confidenceScores })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating profile confidence scores:', updateError);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating confidence scores:', error);
      
      // Fall back to mock implementation
      console.warn("Falling back to localStorage due to database error");
      return mockImplementation.updateUserConfidenceScores(userId, subject, confidence);
    }
  }
};

// Export the appropriate implementation based on useMock flag
export const quizService = useMock ? mockImplementation : realImplementation;
