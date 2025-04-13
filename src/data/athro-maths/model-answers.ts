// Define the type for model answers
export interface ModelAnswer {
  questionId: string;
  workingSteps: string[];
  markScheme: string;
  marks: number;
}

// Keep the existing modelAnswers data
export const modelAnswers: ModelAnswer[] = [
  {
    questionId: 'm22-c300u10-1-q1',
    workingSteps: [
      'Identify the quadratic equation: 2x² - 5x - 3 = 0',
      'Use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a',
      'Substitute a=2, b=-5, c=-3',
      'Calculate the discriminant: b² - 4ac = (-5)² - 4(2)(-3) = 25 + 24 = 49',
      'Calculate the solutions: x = (5 ± √49) / 4 = (5 ± 7) / 4'
    ],
    markScheme: 'x = 3 or x = -1/2',
    marks: 4
  },
  {
    questionId: 'm22-c300u10-1-q2',
    workingSteps: [
      'Recall the formula for the area of a circle: A = πr²',
      'Given area = 50cm², so 50 = πr²',
      'Rearrange to find r: r² = 50/π',
      'Take the square root: r = √(50/π)',
      'Calculate the circumference using C = 2πr',
      'Substitute the radius: C = 2π × √(50/π)'
    ],
    markScheme: 'C = 2π√(50/π) = 2√(50π) ≈ 25.1 cm',
    marks: 3
  },
  {
    questionId: 'm22-c300u10-1-q3',
    workingSteps: [
      'Identify the sequence: 3, 7, 11, 15, ...',
      'Calculate the common difference: d = 7 - 3 = 4',
      'Use the formula for the nth term of an arithmetic sequence: Un = a + (n-1)d',
      'Substitute a=3, d=4: Un = 3 + (n-1)4 = 3 + 4n - 4 = 4n - 1',
      'To find the 50th term, substitute n=50: U50 = 4(50) - 1 = 200 - 1 = 199'
    ],
    markScheme: 'The 50th term is 199',
    marks: 3
  },
  {
    questionId: 'm21-c300u20-1-q1',
    workingSteps: [
      'Identify the function: f(x) = 2x² - 3x + 1',
      'To find f(4), substitute x=4 into the function',
      'f(4) = 2(4)² - 3(4) + 1',
      'f(4) = 2(16) - 12 + 1',
      'f(4) = 32 - 12 + 1'
    ],
    markScheme: 'f(4) = 21',
    marks: 2
  },
  {
    questionId: 'm21-c300u20-1-q2',
    workingSteps: [
      'Identify the simultaneous equations: 3x + 2y = 7 and 5x - y = 8',
      'Rearrange the second equation to make y the subject: y = 5x - 8',
      'Substitute this into the first equation: 3x + 2(5x - 8) = 7',
      'Expand: 3x + 10x - 16 = 7',
      'Simplify: 13x - 16 = 7',
      'Add 16 to both sides: 13x = 23',
      'Divide both sides by 13: x = 23/13',
      'Substitute back to find y: y = 5(23/13) - 8 = 115/13 - 8 = 115/13 - 104/13 = 11/13'
    ],
    markScheme: 'x = 23/13, y = 11/13',
    marks: 5
  },
  {
    questionId: 'm21-c300u20-1-q3',
    workingSteps: [
      'Identify the expression to be factorized: 6x² - 13x - 5',
      'Look for two numbers that multiply to give 6 × (-5) = -30 and add to give -13',
      'The numbers are -15 and 2, since (-15) × 2 = -30 and (-15) + 2 = -13',
      'Rewrite the middle term: 6x² - 15x + 2x - 5',
      'Group the terms: (6x² - 15x) + (2x - 5)',
      'Factor out common factors from each group: 3x(2x - 5) + 1(2x - 5)',
      'Factor out the common binomial: (3x + 1)(2x - 5)'
    ],
    markScheme: '6x² - 13x - 5 = (3x + 1)(2x - 5)',
    marks: 3
  }
];

export default modelAnswers;
