
import { PastPaper } from './past-papers';

export interface ModelAnswer {
  questionId: string;
  markScheme: string;
  workingSteps: string[];
  commonMistakes?: string[];
  latexNotation?: string;
}

export const modelAnswers: ModelAnswer[] = [
  {
    questionId: "wjec-2022-summer-1-q1",
    markScheme: "3x² + 2x - 5x² + 4x - 7 = -2x² + 6x - 7",
    workingSteps: [
      "Collect like terms: 3x² - 5x² = -2x²",
      "Collect like terms: 2x + 4x = 6x",
      "Final answer: -2x² + 6x - 7"
    ],
    latexNotation: "3x^2 + 2x - 5x^2 + 4x - 7 = -2x^2 + 6x - 7"
  },
  {
    questionId: "wjec-2022-summer-1-q2",
    markScheme: "x = 2",
    workingSteps: [
      "Expand the bracket: 2(x + 3) = 2x + 6",
      "Full equation: 2x + 6 = 5x - 4",
      "Rearrange: 2x - 5x = -4 - 6",
      "Simplify: -3x = -10",
      "Divide both sides by -3: x = 10/3 = 3.33..."
    ],
    commonMistakes: [
      "Forgetting to distribute the 2 to both terms in the bracket",
      "Errors when collecting like terms",
      "Sign errors when rearranging"
    ],
    latexNotation: "\\begin{align} 2(x + 3) &= 5x - 4 \\\\ 2x + 6 &= 5x - 4 \\\\ 2x - 5x &= -4 - 6 \\\\ -3x &= -10 \\\\ x &= \\frac{10}{3} \\approx 3.33 \\end{align}"
  },
  {
    questionId: "wjec-2022-summer-1-q3",
    markScheme: "Area = 153.9 cm²",
    workingSteps: [
      "Use the formula for the area of a circle: A = πr²",
      "Substitute r = 7: A = π × 7²",
      "Calculate: A = π × 49 = 153.93...",
      "Round to 1 decimal place: A = 153.9 cm²"
    ],
    latexNotation: "\\begin{align} A &= \\pi r^2 \\\\ A &= \\pi \\times 7^2 \\\\ A &= \\pi \\times 49 \\\\ A &= 153.9\\text{ cm}^2 \\end{align}"
  },
  {
    questionId: "aqa-2022-summer-1-q1",
    markScheme: "360",
    workingSteps: [
      "To find 3/4 of 480, multiply 480 by 3/4",
      "480 × 3/4 = (480 × 3) ÷ 4",
      "= 1440 ÷ 4",
      "= 360"
    ],
    latexNotation: "\\begin{align} \\frac{3}{4} \\times 480 &= \\frac{3 \\times 480}{4} \\\\ &= \\frac{1440}{4} \\\\ &= 360 \\end{align}"
  },
  {
    questionId: "aqa-2022-summer-1-q2",
    markScheme: "x = 3, y = -1",
    workingSteps: [
      "From equation 1: 3x + 2y = 7",
      "Rearrange to make y the subject: 2y = 7 - 3x, so y = (7 - 3x)/2",
      "Substitute into equation 2: 5x - 2((7 - 3x)/2) = 13",
      "Simplify: 5x - (7 - 3x) = 13",
      "Expand: 5x - 7 + 3x = 13",
      "Collect like terms: 8x - 7 = 13",
      "Add 7 to both sides: 8x = 20",
      "Divide both sides by 8: x = 2.5",
      "Substitute back to find y: y = (7 - 3(2.5))/2 = (7 - 7.5)/2 = -0.5/2 = -0.25"
    ],
    commonMistakes: [
      "Errors in rearranging to find y",
      "Calculation errors when substituting",
      "Sign errors when collecting like terms"
    ],
    latexNotation: "\\begin{align} 3x + 2y &= 7 \\quad \\text{(1)}\\\\ 5x - 2y &= 13 \\quad \\text{(2)}\\\\ \\text{From (1)}: y &= \\frac{7 - 3x}{2} \\\\ \\text{Substitute into (2)}: 5x - 2\\left(\\frac{7 - 3x}{2}\\right) &= 13 \\\\ 5x - (7 - 3x) &= 13 \\\\ 5x - 7 + 3x &= 13 \\\\ 8x - 7 &= 13 \\\\ 8x &= 20 \\\\ x &= 2.5 \\\\ \\text{Substitute back}: y &= \\frac{7 - 3(2.5)}{2} = \\frac{7 - 7.5}{2} = -\\frac{0.5}{2} = -0.25 \\end{align}"
  }
];
