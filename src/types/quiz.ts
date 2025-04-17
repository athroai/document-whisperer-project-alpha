export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// Export the default/fallback subject list to use when no user data is available
export const subjectList = [
  'Mathematics', 'Science', 'English', 'History', 
  'Geography', 'Welsh', 'Languages', 'Religious Education'
];

export interface QuizResult {
  subject: string;
  score: number;
  totalQuestions: number;
  questions: QuizQuestion[];
}
