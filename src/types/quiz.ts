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
  examBoard?: string;
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
  // Mathematics - Difficulty 1-2 (Easy)
  {
    id: "m1",
    subject: "maths",
    topic: "addition",
    difficulty: 1,
    question: "What is 25 + 37?",
    answer: "62",
    options: ["52", "62", "72", "82"],
    hint: "Add the ones column first, then the tens column",
    type: "multiple-choice",
    examBoard: "wjec"
  },
  {
    id: "m2",
    subject: "maths",
    topic: "subtraction",
    difficulty: 1,
    question: "What is 89 - 34?",
    answer: "55",
    options: ["45", "55", "65", "75"],
    hint: "Subtract the ones column first, then the tens column",
    type: "multiple-choice",
    examBoard: "aqa"
  },
  {
    id: "m3",
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
    id: "m4",
    subject: "maths",
    topic: "multiplication",
    difficulty: 1,
    question: "What is 7 × 8?",
    answer: "56",
    options: ["48", "54", "56", "64"],
    hint: "7 × 8 = 56",
    type: "multiple-choice"
  },
  {
    id: "m5",
    subject: "maths",
    topic: "percentages",
    difficulty: 2,
    question: "What is 10% of 120?",
    answer: "12",
    options: ["10", "12", "14", "20"],
    hint: "Move the decimal point one place to the left",
    type: "multiple-choice"
  },
  {
    id: "m6",
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
    id: "m7",
    subject: "maths",
    topic: "division",
    difficulty: 2,
    question: "What is 125 ÷ 5?",
    answer: "25",
    options: ["20", "25", "30", "35"],
    hint: "Think about 5 × ? = 125",
    type: "multiple-choice"
  },
  {
    id: "m8",
    subject: "maths",
    topic: "shapes",
    difficulty: 2,
    question: "How many sides does a hexagon have?",
    answer: "6",
    options: ["5", "6", "7", "8"],
    hint: "'Hex' means six",
    type: "multiple-choice"
  },
  
  // Mathematics - Difficulty 3 (Medium)
  {
    id: "m9",
    subject: "maths",
    topic: "algebra",
    difficulty: 3,
    question: "Solve for x: 3x + 7 = 22",
    answer: "5",
    hint: "Subtract 7 from both sides, then divide by 3",
    type: "short-answer"
  },
  {
    id: "m10",
    subject: "maths",
    topic: "algebra",
    difficulty: 3,
    question: "Solve for y: 2y - 9 = 15",
    answer: "12",
    hint: "Add 9 to both sides, then divide by 2",
    type: "short-answer"
  },
  {
    id: "m11",
    subject: "maths",
    topic: "geometry",
    difficulty: 3,
    question: "What is the area of a rectangle with length 8 cm and width 5 cm?",
    answer: "40",
    options: ["26", "30", "40", "45"],
    hint: "Area = length × width",
    type: "multiple-choice"
  },
  {
    id: "m12",
    subject: "maths",
    topic: "decimals",
    difficulty: 3,
    question: "Calculate 3.6 × 2.5",
    answer: "9",
    options: ["7.5", "8.1", "9", "10.5"],
    hint: "Multiply as normal, then count decimal places",
    type: "multiple-choice"
  },
  {
    id: "m13",
    subject: "maths",
    topic: "percentages",
    difficulty: 3,
    question: "If an item costs £80 after a 20% discount, what was the original price?",
    answer: "100",
    hint: "£80 is 80% of the original price. So original price = £80 ÷ 0.8",
    type: "short-answer"
  },
  
  // Mathematics - Difficulty 4-5 (Hard)
  {
    id: "m14",
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
    id: "m15",
    subject: "maths",
    topic: "algebra",
    difficulty: 4,
    question: "Solve for x: 2(x - 3) = x + 5",
    answer: "11",
    hint: "Expand the bracket first, then collect like terms",
    type: "short-answer"
  },
  {
    id: "m16",
    subject: "maths",
    topic: "trigonometry",
    difficulty: 4,
    question: "In a right triangle, if sin(θ) = 0.6, what is cos(θ)?",
    answer: "0.8",
    options: ["0.6", "0.8", "1.2", "1.6"],
    hint: "Use sin²(θ) + cos²(θ) = 1",
    type: "multiple-choice"
  },
  {
    id: "m17",
    subject: "maths",
    topic: "probability",
    difficulty: 4,
    question: "If you flip a fair coin 3 times, what is the probability of getting exactly 2 heads?",
    answer: "3/8",
    options: ["1/8", "1/4", "3/8", "1/2"],
    hint: "Find the number of ways to get exactly 2 heads out of 3 flips",
    type: "multiple-choice"
  },
  {
    id: "m18",
    subject: "maths",
    topic: "statistics",
    difficulty: 5,
    question: "If the mean of 5 numbers is 8, and 4 of those numbers are 6, 7, 9, and 12, what is the fifth number?",
    answer: "6",
    hint: "The sum of all numbers divided by the count gives the mean",
    type: "short-answer"
  },
  {
    id: "m19",
    subject: "maths",
    topic: "calculus",
    difficulty: 5,
    question: "What is the derivative of f(x) = x²?",
    answer: "2x",
    options: ["x", "2x", "x²", "2"],
    hint: "Use the power rule: the derivative of x^n is n × x^(n-1)",
    type: "multiple-choice"
  },
  {
    id: "m20",
    subject: "maths",
    topic: "sequences",
    difficulty: 5,
    question: "Find the next term in the sequence: 2, 6, 12, 20, ...",
    answer: "30",
    hint: "Look at the differences between consecutive terms",
    type: "short-answer"
  },
  
  // English - Difficulty 1-2 (Easy)
  {
    id: "e1",
    subject: "english",
    topic: "spelling",
    difficulty: 1,
    question: "Which word is spelled correctly?",
    answer: "beautiful",
    options: ["beautifull", "beutiful", "beautyfull", "beautiful"],
    hint: "Think about the vowels in the middle of the word",
    type: "multiple-choice"
  },
  {
    id: "e2",
    subject: "english",
    topic: "nouns",
    difficulty: 1,
    question: "Which of these is a proper noun?",
    answer: "London",
    options: ["city", "building", "London", "street"],
    hint: "Proper nouns name specific people, places, or things",
    type: "multiple-choice"
  },
  {
    id: "e3",
    subject: "english",
    topic: "verbs",
    difficulty: 1,
    question: "Which word is a verb?",
    answer: "run",
    options: ["happy", "book", "run", "blue"],
    hint: "A verb is an action word",
    type: "multiple-choice"
  },
  {
    id: "e4",
    subject: "english",
    topic: "punctuation",
    difficulty: 2,
    question: "Where should the apostrophe go in this sentence? The girls coat was wet.",
    answer: "girl's",
    options: ["girls'", "girl's", "girls", "girl s"],
    hint: "The coat belongs to one girl",
    type: "multiple-choice"
  },
  {
    id: "e5",
    subject: "english",
    topic: "synonyms",
    difficulty: 2,
    question: "Which word means the same as 'happy'?",
    answer: "joyful",
    options: ["sad", "angry", "joyful", "tired"],
    hint: "Look for a word with a similar positive emotion",
    type: "multiple-choice"
  },
  {
    id: "e6",
    subject: "english",
    topic: "grammar",
    difficulty: 2,
    question: "Which word is an adverb in the sentence: 'She quickly ran to the store'?",
    answer: "quickly",
    options: ["she", "quickly", "ran", "store"],
    hint: "Adverbs often describe how an action is performed",
    type: "multiple-choice"
  },
  
  // English - Difficulty 3 (Medium)
  {
    id: "e7",
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
    id: "e8",
    subject: "english",
    topic: "comprehension",
    difficulty: 3,
    question: "What is the main idea of a text?",
    answer: "The central point the author is trying to make",
    options: [
      "The longest paragraph",
      "The first sentence",
      "The central point the author is trying to make",
      "The most interesting detail"
    ],
    hint: "It's the message or point that ties together all parts of the text",
    type: "multiple-choice"
  },
  {
    id: "e9",
    subject: "english",
    topic: "tenses",
    difficulty: 3,
    question: "Which sentence is written in the past perfect tense?",
    answer: "I had finished my homework before dinner.",
    options: [
      "I finished my homework before dinner.",
      "I had finished my homework before dinner.",
      "I will finish my homework before dinner.",
      "I am finishing my homework before dinner."
    ],
    hint: "Past perfect uses 'had' plus the past participle",
    type: "multiple-choice"
  },
  {
    id: "e10",
    subject: "english",
    topic: "parts of speech",
    difficulty: 3,
    question: "In the sentence 'The old man walked slowly', what part of speech is 'old'?",
    answer: "adjective",
    options: ["noun", "verb", "adverb", "adjective"],
    hint: "It describes the man",
    type: "multiple-choice"
  },
  
  // English - Difficulty 4-5 (Hard)
  {
    id: "e11",
    subject: "english",
    topic: "literature",
    difficulty: 4,
    question: "Who wrote 'Romeo and Juliet'?",
    answer: "William Shakespeare",
    options: ["Charles Dickens", "Jane Austen", "William Shakespeare", "George Orwell"],
    hint: "Famous English playwright from the 16th century",
    type: "multiple-choice"
  },
  {
    id: "e12",
    subject: "english",
    topic: "grammar",
    difficulty: 4,
    question: "What is a dangling modifier?",
    answer: "A modifying phrase that doesn't clearly relate to what it's supposed to modify",
    options: [
      "A missing word in a sentence",
      "A modifying phrase that doesn't clearly relate to what it's supposed to modify",
      "An extra word in a sentence",
      "A type of punctuation mark"
    ],
    hint: "It's a problem with the structure of a sentence",
    type: "multiple-choice"
  },
  {
    id: "e13",
    subject: "english",
    topic: "literature",
    difficulty: 4,
    question: "What literary device is used in 'The wind whispered through the trees'?",
    answer: "personification",
    options: ["simile", "metaphor", "personification", "alliteration"],
    hint: "This device gives human qualities to non-human things",
    type: "multiple-choice"
  },
  {
    id: "e14",
    subject: "english",
    topic: "poetry",
    difficulty: 5,
    question: "What is a sonnet?",
    answer: "A 14-line poem with a specific rhyme scheme",
    options: [
      "A poem that doesn't rhyme",
      "A 14-line poem with a specific rhyme scheme",
      "A Japanese form of poetry with 17 syllables",
      "A long narrative poem about heroic deeds"
    ],
    hint: "Shakespeare wrote many of these 14-line poems",
    type: "multiple-choice"
  },
  {
    id: "e15",
    subject: "english",
    topic: "rhetoric",
    difficulty: 5,
    question: "What is anaphora in writing?",
    answer: "The repetition of a word or phrase at the beginning of successive clauses",
    options: [
      "The repetition of a word or phrase at the beginning of successive clauses",
      "The use of words that imitate sounds",
      "A direct comparison using 'like' or 'as'",
      "The use of exaggeration for emphasis"
    ],
    hint: "Martin Luther King Jr.'s 'I Have a Dream' speech uses this device",
    type: "multiple-choice"
  },
  
  // Science - Difficulty 1-2 (Easy)
  {
    id: "s1",
    subject: "science",
    topic: "biology",
    difficulty: 1,
    question: "Which gas do plants absorb from the atmosphere?",
    answer: "Carbon dioxide",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
    hint: "Plants use this gas for photosynthesis",
    type: "multiple-choice"
  },
  {
    id: "s2",
    subject: "science",
    topic: "biology",
    difficulty: 1,
    question: "What is the process called when plants make their own food using sunlight?",
    answer: "photosynthesis",
    options: ["respiration", "photosynthesis", "germination", "transpiration"],
    hint: "The process uses light energy to convert water and carbon dioxide into glucose",
    type: "multiple-choice"
  },
  {
    id: "s3",
    subject: "science",
    topic: "physics",
    difficulty: 2,
    question: "Which force pulls objects toward the center of the Earth?",
    answer: "gravity",
    options: ["friction", "gravity", "magnetism", "tension"],
    hint: "This force keeps us on the ground",
    type: "multiple-choice"
  },
  {
    id: "s4",
    subject: "science",
    topic: "chemistry",
    difficulty: 2,
    question: "What is the chemical formula for water?",
    answer: "H₂O",
    options: ["CO₂", "H₂O", "O₂", "NaCl"],
    hint: "It contains hydrogen and oxygen",
    type: "multiple-choice"
  },
  
  // Science - Difficulty 3 (Medium)
  {
    id: "s5",
    subject: "science",
    topic: "biology",
    difficulty: 3,
    question: "Which organ produces insulin?",
    answer: "pancreas",
    options: ["liver", "kidney", "pancreas", "heart"],
    hint: "This organ helps regulate blood sugar levels",
    type: "multiple-choice"
  },
  {
    id: "s6",
    subject: "science",
    topic: "chemistry",
    difficulty: 3,
    question: "What is the periodic table organized by?",
    answer: "atomic number",
    options: ["atomic weight", "atomic number", "discovery date", "reactivity"],
    hint: "It's related to the number of protons in an atom",
    type: "multiple-choice"
  },
  {
    id: "s7",
    subject: "science",
    topic: "physics",
    difficulty: 3,
    question: "What is the unit of electrical resistance?",
    answer: "ohm",
    options: ["watt", "volt", "ampere", "ohm"],
    hint: "It's represented by the Greek letter Ω (omega)",
    type: "multiple-choice"
  },
  {
    id: "s8",
    subject: "science",
    topic: "earth science",
    difficulty: 3,
    question: "What causes the seasons on Earth?",
    answer: "The tilt of Earth's axis",
    options: ["The distance from the Sun", "The tilt of Earth's axis", "The rotation of Earth", "The moon's gravity"],
    hint: "It's not about distance from the Sun, but about the angle of sunlight",
    type: "multiple-choice"
  },
  
  // Science - Difficulty 4-5 (Hard)
  {
    id: "s9",
    subject: "science",
    topic: "chemistry",
    difficulty: 4,
    question: "What is the chemical symbol for gold?",
    answer: "Au",
    options: ["Go", "Au", "Ag", "Gd"],
    hint: "It comes from the Latin word 'aurum'",
    type: "multiple-choice"
  },
  {
    id: "s10",
    subject: "science",
    topic: "physics",
    difficulty: 4,
    question: "What is the formula for Newton's second law of motion?",
    answer: "F = ma",
    options: ["E = mc²", "F = ma", "a = F/m", "p = mv"],
    hint: "Force equals mass times acceleration",
    type: "multiple-choice"
  },
  {
    id: "s11",
    subject: "science",
    topic: "biology",
    difficulty: 4,
    question: "What process converts glucose and oxygen into energy in cells?",
    answer: "cellular respiration",
    hint: "It's the opposite of photosynthesis",
    type: "short-answer"
  },
  {
    id: "s12",
    subject: "science",
    topic: "astronomy",
    difficulty: 5,
    question: "Which planet has the Great Red Spot?",
    answer: "Jupiter",
    options: ["Mars", "Venus", "Jupiter", "Saturn"],
    hint: "It's the largest planet in our solar system",
    type: "multiple-choice"
  },
  {
    id: "s13",
    subject: "science",
    topic: "genetics",
    difficulty: 5,
    question: "What are the nitrogenous bases in DNA?",
    answer: "Adenine, Thymine, Cytosine, Guanine",
    hint: "Often abbreviated as A, T, C, and G",
    type: "short-answer"
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
