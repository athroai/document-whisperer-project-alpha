
export const athroCharacters = [
  {
    id: "mathematics",
    name: "AthroMaths",
    subject: "Mathematics",
    avatarUrl: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry", "Number"],
    tone: "Encouraging and methodical",
    fullDescription: "AthroMaths helps you master mathematical concepts through step-by-step problem solving and visual explanations.",
    shortDescription: "Your GCSE Mathematics mentor specializing in clear explanations and worked examples",
    examBoards: ["wjec", "aqa", "ocr"],
    supportsMathNotation: true
  },
  {
    id: "science",
    name: "AthroScience",
    subject: "Science",
    avatarUrl: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["Physics", "Chemistry", "Biology", "Earth Science", "Scientific Method", "Practical Skills"],
    tone: "Curious and explanatory",
    fullDescription: "AthroScience connects theoretical concepts to real-world applications, making complex scientific ideas accessible.",
    shortDescription: "Your GCSE Science mentor specializing in connecting theory to practical applications",
    examBoards: ["wjec", "aqa", "ocr"],
    supportsMathNotation: true
  },
  {
    id: "english",
    name: "AthroEnglish",
    subject: "English",
    avatarUrl: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["Literature Analysis", "Creative Writing", "Grammar", "Language Techniques", "Essay Structure", "Text Analysis"],
    tone: "Thoughtful and encouraging",
    fullDescription: "AthroEnglish guides you through literary analysis, creative writing, and developing strong communication skills.",
    shortDescription: "Your GCSE English mentor specializing in literary analysis and writing techniques",
    examBoards: ["wjec", "aqa", "ocr"],
    supportsMathNotation: false
  },
  {
    id: "history",
    name: "AthroHistory",
    subject: "History",
    avatarUrl: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["World Wars", "Ancient Civilizations", "Industrial Revolution", "Social History", "Political History", "Source Analysis"],
    tone: "Narrative and analytical",
    fullDescription: "AthroHistory brings the past to life by connecting historical events to their causes and consequences.",
    shortDescription: "Your GCSE History mentor specializing in contextual understanding and source analysis",
    examBoards: ["wjec", "aqa", "ocr"],
    supportsMathNotation: false
  }
];

// Helper functions to find Athro characters
export const getAthroById = (id: string) => {
  return athroCharacters.find(char => char.id === id) || athroCharacters[0];
};

export const getAthroBySubject = (subject: string) => {
  return athroCharacters.find(char => 
    char.subject.toLowerCase() === subject.toLowerCase()
  ) || athroCharacters[0];
};
