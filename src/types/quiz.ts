
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// Question interface for the quiz system
export interface Question {
  id: string;
  question: string;
  answer: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  difficulty: number;
  subject: string;
  topic: string;
  hint: string;
  examBoard?: string;
}

// Answer interface for user responses
export interface Answer {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  topic: string;
}

// Export the default/fallback subject list to use when no user data is available
export const subjectList = [
  'Mathematics', 'Science', 'English', 'History', 
  'Geography', 'Welsh', 'Languages', 'Religious Education'
];

// Quiz result interface with all required properties
export interface QuizResult {
  id?: string;
  subject: string;
  score: number;
  totalQuestions: number;
  questions?: QuizQuestion[];
  // New properties for extended quiz functionality
  userId?: string;
  questionsAsked: string[];
  answers: Answer[];
  confidenceBefore: number;
  confidenceAfter: number;
  timestamp: string;
}

// Mock questions for development
export const mockQuestions: Question[] = [
  {
    id: "m1",
    question: "What is 35 + 27?",
    answer: "62",
    type: "short-answer",
    difficulty: 2,
    subject: "Mathematics",
    topic: "addition",
    hint: "Break it down: 30 + 20 = 50, then 5 + 7 = 12, so 50 + 12 = 62"
  },
  {
    id: "m2",
    question: "What is 78 - 23?",
    answer: "55",
    type: "short-answer",
    difficulty: 2,
    subject: "Mathematics",
    topic: "subtraction",
    hint: "70 - 20 = 50, then 8 - 3 = 5, so 50 + 5 = 55"
  },
  {
    id: "m3",
    question: "What is 1/2 + 3/10?",
    answer: "4/5",
    type: "short-answer",
    difficulty: 3,
    subject: "Mathematics",
    topic: "fractions",
    hint: "Convert to the same denominator: 5/10 + 3/10 = 8/10 = 4/5"
  },
  {
    id: "s1",
    question: "Which gas do plants absorb from the atmosphere?",
    answer: "Carbon dioxide",
    type: "multiple-choice",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
    difficulty: 2,
    subject: "Science",
    topic: "biology",
    hint: "Plants use this gas during photosynthesis"
  },
  {
    id: "s2",
    question: "The process by which plants make their own food is called:",
    answer: "photosynthesis",
    type: "multiple-choice",
    options: ["respiration", "photosynthesis", "digestion", "excretion"],
    difficulty: 2,
    subject: "Science", 
    topic: "biology",
    hint: "Photo- means light, and synthesis means making"
  },
  {
    id: "s3",
    question: "What force pulls objects toward the center of the Earth?",
    answer: "gravity",
    type: "short-answer",
    difficulty: 1,
    subject: "Science",
    topic: "physics",
    hint: "This force keeps your feet on the ground"
  },
  {
    id: "e1",
    question: "Which of these words is spelled correctly?",
    answer: "beautiful",
    type: "multiple-choice",
    options: ["beautifull", "beutiful", "beautiful", "beautifull"],
    difficulty: 2,
    subject: "English",
    topic: "spelling",
    hint: "Remember: b-e-a-u-tiful"
  },
  {
    id: "e2",
    question: "Which of these is a proper noun?",
    answer: "London",
    type: "multiple-choice",
    options: ["city", "building", "London", "country"],
    difficulty: 2, 
    subject: "English",
    topic: "nouns",
    hint: "Proper nouns are specific names of people, places, or things"
  },
  {
    id: "e3",
    question: "Which word is a verb?",
    answer: "run",
    type: "multiple-choice",
    options: ["happy", "run", "beautiful", "quick"],
    difficulty: 1,
    subject: "English",
    topic: "verbs",
    hint: "Verbs are action words"
  }
];
