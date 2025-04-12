
export interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: number;
  question: string;
  answer: string;
  options?: string[];
  hint: string;
  type: "multiple-choice" | "short-answer";
}

export interface Answer {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  topic: string;
}

export interface QuizResult {
  userId: string;
  subject: string;
  questionsAsked: string[];
  answers: Answer[];
  confidenceBefore: number;
  confidenceAfter: number;
  score: number;
  timestamp: string;
}

export const mockQuestions: Question[] = [
  {
    id: "q1",
    subject: "maths",
    topic: "percentages",
    difficulty: 2,
    question: "What is 24% of 300?",
    answer: "72",
    options: ["64", "72", "84", "96"],
    hint: "Find 10%, then double and add 4%",
    type: "multiple-choice"
  },
  {
    id: "q2",
    subject: "maths",
    topic: "fractions",
    difficulty: 1,
    question: "What is 1/4 of 20?",
    answer: "5",
    options: ["4", "5", "6", "10"],
    hint: "Divide 20 by 4",
    type: "multiple-choice"
  },
  {
    id: "q3",
    subject: "maths",
    topic: "algebra",
    difficulty: 3,
    question: "Solve for x: 3x + 7 = 22",
    answer: "5",
    hint: "Subtract 7 from both sides, then divide by 3",
    type: "short-answer"
  },
  {
    id: "q4",
    subject: "maths",
    topic: "geometry",
    difficulty: 4,
    question: "What is the formula for the area of a circle?",
    answer: "πr²",
    options: ["πr²", "2πr", "πd", "πr²/2"],
    hint: "It involves π multiplied by the square of the radius",
    type: "multiple-choice"
  },
  {
    id: "q5",
    subject: "maths",
    topic: "statistics",
    difficulty: 5,
    question: "If the mean of 5 numbers is 8, and 4 of those numbers are 6, 7, 9, and 12, what is the fifth number?",
    answer: "6",
    hint: "The sum of all numbers divided by the count gives the mean",
    type: "short-answer"
  },
  {
    id: "q6",
    subject: "english",
    topic: "grammar",
    difficulty: 2,
    question: "Which word is an adverb in the sentence: 'She quickly ran to the store'?",
    answer: "quickly",
    options: ["she", "quickly", "ran", "store"],
    hint: "Adverbs often describe how an action is performed",
    type: "multiple-choice"
  },
  {
    id: "q7",
    subject: "english",
    topic: "punctuation",
    difficulty: 3,
    question: "Which of these sentences uses a semicolon correctly?",
    answer: "I have a big test tomorrow; I can't go out tonight.",
    options: [
      "I have a big test tomorrow; I can't go out tonight.",
      "I have a big test tomorrow, I can't go out tonight.",
      "I have a big test tomorrow; and I can't go out tonight.",
      "I have a big test; tomorrow I can't go out tonight."
    ],
    hint: "Semicolons connect closely related independent clauses",
    type: "multiple-choice"
  },
  {
    id: "q8",
    subject: "english",
    topic: "literature",
    difficulty: 5,
    question: "What literary device is used in 'The wind whispered through the trees'?",
    answer: "personification",
    options: ["simile", "metaphor", "personification", "alliteration"],
    hint: "This device gives human qualities to non-human things",
    type: "multiple-choice"
  },
  {
    id: "q9",
    subject: "science",
    topic: "biology",
    difficulty: 2,
    question: "What is the process called when plants make their own food using sunlight?",
    answer: "photosynthesis",
    options: ["respiration", "photosynthesis", "germination", "transpiration"],
    hint: "The process uses light energy to convert water and carbon dioxide into glucose",
    type: "multiple-choice"
  },
  {
    id: "q10",
    subject: "science",
    topic: "chemistry",
    difficulty: 4,
    question: "What is the chemical symbol for gold?",
    answer: "Au",
    options: ["Go", "Au", "Ag", "Gd"],
    hint: "It comes from the Latin word 'aurum'",
    type: "multiple-choice"
  }
];

export const subjectList = [
  "maths",
  "english",
  "science",
  "welsh",
  "french",
  "geography",
  "history",
  "religious studies"
];
