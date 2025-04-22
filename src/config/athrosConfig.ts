
import { ExamBoard } from "@/types/athro";

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
    examBoards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supportsMathNotation: true,
    supportsSpecialCharacters: false,
    supportedLanguages: ["en"]
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
    examBoards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supportsMathNotation: true,
    supportsSpecialCharacters: true,
    supportedLanguages: ["en"]
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
    examBoards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supportsMathNotation: false,
    supportsSpecialCharacters: false,
    supportedLanguages: ["en"]
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
    examBoards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supportsMathNotation: false,
    supportsSpecialCharacters: false,
    supportedLanguages: ["en"]
  },
  {
    id: "geography",
    name: "AthroGeography",
    subject: "Geography",
    avatarUrl: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["Physical Geography", "Human Geography", "Environmental Geography", "Map Skills", "Fieldwork", "Sustainable Development"],
    tone: "Explorative and observant",
    fullDescription: "AthroGeography helps you understand the relationships between people, places, and the environment through spatial analysis.",
    shortDescription: "Your GCSE Geography mentor specializing in physical and human geography concepts",
    examBoards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supportsMathNotation: false,
    supportsSpecialCharacters: false,
    supportedLanguages: ["en"]
  },
  {
    id: "welsh",
    name: "AthroWelsh",
    subject: "Welsh",
    avatarUrl: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["Speaking", "Listening", "Reading", "Writing", "Welsh Culture", "Grammar"],
    tone: "Supportive and culturally engaged",
    fullDescription: "AthroWelsh guides you through Welsh language learning with a focus on practical communication skills and cultural context.",
    shortDescription: "Your GCSE Welsh mentor specializing in language skills and cultural understanding",
    examBoards: ["WJEC"] as ExamBoard[],
    supportsMathNotation: false,
    supportsSpecialCharacters: false,
    supportedLanguages: ["en", "cy"]
  },
  {
    id: "languages",
    name: "AthroLanguages",
    subject: "Languages",
    avatarUrl: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["Vocabulary", "Grammar", "Reading Comprehension", "Listening", "Speaking", "Writing", "Cultural Context"],
    tone: "Patient and conversational",
    fullDescription: "AthroLanguages helps you develop proficiency in foreign languages through practice and cultural context.",
    shortDescription: "Your GCSE Modern Languages mentor specializing in language acquisition and practical communication",
    examBoards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supportsMathNotation: false,
    supportsSpecialCharacters: true,
    supportedLanguages: ["en", "fr", "es", "de"]
  },
  {
    id: "religious-education",
    name: "AthroReligiousStudies",
    subject: "Religious Education",
    avatarUrl: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["World Religions", "Ethics", "Philosophy", "Sacred Texts", "Religious Practices", "Belief Systems"],
    tone: "Respectful and informative",
    fullDescription: "AthroReligiousStudies explores world religions, ethics, and philosophical questions with respect and critical thinking.",
    shortDescription: "Your GCSE Religious Studies mentor specializing in world religions and ethical frameworks",
    examBoards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supportsMathNotation: false,
    supportsSpecialCharacters: false,
    supportedLanguages: ["en"]
  }
];

export const getAthroById = (id: string) => {
  return athroCharacters.find(char => char.id === id) || athroCharacters[0];
};

export const getAthroBySubject = (subject: string) => {
  // Direct match first
  let character = athroCharacters.find(char => 
    char.subject.toLowerCase() === subject.toLowerCase()
  );
  
  if (!character) {
    // Handle specific science subjects
    if (['Biology', 'Chemistry', 'Physics'].includes(subject)) {
      character = athroCharacters.find(char => char.id === 'science');
    } else if (subject.toLowerCase().includes('religious')) {
      character = athroCharacters.find(char => char.id === 'religious-education');
    } else if (subject.toLowerCase().includes('language') || 
               ['french', 'german', 'spanish'].includes(subject.toLowerCase())) {
      character = athroCharacters.find(char => char.id === 'languages');
    }
  }
  
  return character || athroCharacters[0];
};
