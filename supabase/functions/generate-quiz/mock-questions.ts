
export const generateMockQuestions = () => {
  return [
    {
      id: `mock-math-1`,
      text: "What is the value of x in the equation 3x + 7 = 22?",
      options: ["3", "5", "7", "15"],
      correctAnswer: "5",
      difficulty: "medium",
      topic: "algebra",
      subject: "Mathematics"
    },
    {
      id: `mock-math-2`,
      text: "What is the area of a circle with radius 4 units?",
      options: ["16π square units", "8π square units", "4π square units", "π square units"],
      correctAnswer: "16π square units",
      difficulty: "medium",
      topic: "geometry",
      subject: "Mathematics"
    },
    {
      id: `mock-sci-1`,
      text: "Which of these is a noble gas?",
      options: ["Oxygen", "Chlorine", "Neon", "Sodium"],
      correctAnswer: "Neon",
      difficulty: "medium",
      topic: "periodic table",
      subject: "Science"
    },
    {
      id: `mock-eng-1`,
      text: "Which literary device involves giving human qualities to non-human things?",
      options: ["Metaphor", "Personification", "Simile", "Alliteration"],
      correctAnswer: "Personification",
      difficulty: "medium",
      topic: "literary devices",
      subject: "English"
    },
    {
      id: `mock-hist-1`,
      text: "Which event marked the start of World War I?",
      options: ["The invasion of Poland", "The bombing of Pearl Harbor", "The assassination of Archduke Franz Ferdinand", "The sinking of the Lusitania"],
      correctAnswer: "The assassination of Archduke Franz Ferdinand",
      difficulty: "medium",
      topic: "world wars",
      subject: "History"
    }
  ];
}
