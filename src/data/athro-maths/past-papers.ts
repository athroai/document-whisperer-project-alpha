
export interface PastPaperQuestion {
  id: string;
  number: number;
  text: string;
  marks: number;
  topic: string;
  subtopic: string; 
  difficulty: number;
}

export interface PastPaper {
  id: string;
  subject: string;
  examBoard: string;
  year: number;
  season: string;
  unit: number;
  title: string;
  questions: PastPaperQuestion[];
}

export const pastPapers: PastPaper[] = [
  {
    id: "wjec-2022-summer-1",
    subject: "Mathematics",
    examBoard: "wjec",
    year: 2022,
    season: "summer",
    unit: 1,
    title: "WJEC GCSE Mathematics Unit 1 (Summer 2022)",
    questions: [
      {
        id: "wjec-2022-summer-1-q1",
        number: 1,
        text: "Simplify 3x² + 2x - 5x² + 4x - 7",
        topic: "Algebra",
        subtopic: "Simplification",
        difficulty: 3,
        marks: 3
      },
      {
        id: "wjec-2022-summer-1-q2",
        number: 2,
        text: "Solve the equation 2(x + 3) = 5x - 4",
        topic: "Algebra",
        subtopic: "Equations",
        difficulty: 4,
        marks: 4
      },
      {
        id: "wjec-2022-summer-1-q3",
        number: 3,
        text: "Calculate the area of a circle with radius 7cm. Give your answer to 1 decimal place.",
        topic: "Geometry",
        subtopic: "Circle Geometry",
        difficulty: 3,
        marks: 3
      },
      {
        id: "wjec-2022-summer-1-q4",
        number: 4,
        text: "The angles in a triangle are in the ratio 2:3:4. Find the size of each angle.",
        topic: "Geometry",
        subtopic: "Angles",
        difficulty: 4,
        marks: 4
      },
      {
        id: "wjec-2022-summer-1-q5",
        number: 5,
        text: "Factorise completely x² - 16",
        topic: "Algebra",
        subtopic: "Factorization",
        difficulty: 2,
        marks: 2
      }
    ]
  },
  {
    id: "aqa-2022-summer-1",
    subject: "Mathematics",
    examBoard: "aqa",
    year: 2022,
    season: "summer",
    unit: 1,
    title: "AQA GCSE Mathematics Paper 1 (Summer 2022)",
    questions: [
      {
        id: "aqa-2022-summer-1-q1",
        number: 1,
        text: "Work out the value of 3/4 of 480",
        topic: "Number Theory",
        subtopic: "Fractions",
        difficulty: 2,
        marks: 2
      },
      {
        id: "aqa-2022-summer-1-q2",
        number: 2,
        text: "Solve the simultaneous equations: 3x + 2y = 7 and 5x - 2y = 13",
        topic: "Algebra",
        subtopic: "Simultaneous Equations",
        difficulty: 5,
        marks: 5
      },
      {
        id: "aqa-2022-summer-1-q3",
        number: 3,
        text: "Find the equation of the straight line that passes through the points (2, 3) and (4, 7)",
        topic: "Algebra",
        subtopic: "Linear Functions",
        difficulty: 4,
        marks: 4
      }
    ]
  }
];

export default pastPapers;
