import { AthroCharacter, ExamBoard } from "@/types/athro";
import { standardizeAthroCharacter } from "@/utils/athroHelpers";

const rawCharacters = [
  {
    id: "mathematics",
    name: "AthroMaths",
    subject: "Mathematics",
    avatar_url: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry", "Number"],
    tone: "Encouraging and methodical",
    full_description: "AthroMaths helps you master mathematical concepts through step-by-step problem solving and visual explanations.",
    short_description: "Your GCSE Mathematics mentor specializing in clear explanations and worked examples",
    exam_boards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supports_math_notation: true,
    supports_special_characters: false,
    supported_languages: ["en"]
  },
  {
    id: "science",
    name: "AthroScience",
    subject: "Science",
    avatar_url: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["Physics", "Chemistry", "Biology", "Earth Science", "Scientific Method", "Practical Skills"],
    tone: "Curious and explanatory",
    full_description: "AthroScience connects theoretical concepts to real-world applications, making complex scientific ideas accessible.",
    short_description: "Your GCSE Science mentor specializing in connecting theory to practical applications",
    exam_boards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supports_math_notation: true,
    supports_special_characters: true,
    supported_languages: ["en"]
  },
  {
    id: "english",
    name: "AthroEnglish",
    subject: "English",
    avatar_url: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["Literature Analysis", "Creative Writing", "Grammar", "Language Techniques", "Essay Structure", "Text Analysis"],
    tone: "Thoughtful and encouraging",
    full_description: "AthroEnglish guides you through literary analysis, creative writing, and developing strong communication skills.",
    short_description: "Your GCSE English mentor specializing in literary analysis and writing techniques",
    exam_boards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supports_math_notation: false,
    supports_special_characters: false,
    supported_languages: ["en"]
  },
  {
    id: "history",
    name: "AthroHistory",
    subject: "History",
    avatar_url: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["World Wars", "Ancient Civilizations", "Industrial Revolution", "Social History", "Political History", "Source Analysis"],
    tone: "Narrative and analytical",
    full_description: "AthroHistory brings the past to life by connecting historical events to their causes and consequences.",
    short_description: "Your GCSE History mentor specializing in contextual understanding and source analysis",
    exam_boards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supports_math_notation: false,
    supports_special_characters: false,
    supported_languages: ["en"]
  },
  {
    id: "geography",
    name: "AthroGeography",
    subject: "Geography",
    avatar_url: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["Physical Geography", "Human Geography", "Environmental Geography", "Map Skills", "Fieldwork", "Sustainable Development"],
    tone: "Explorative and observant",
    full_description: "AthroGeography helps you understand the relationships between people, places, and the environment through spatial analysis.",
    short_description: "Your GCSE Geography mentor specializing in physical and human geography concepts",
    exam_boards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supports_math_notation: false,
    supports_special_characters: false,
    supported_languages: ["en"]
  },
  {
    id: "welsh",
    name: "AthroWelsh",
    subject: "Welsh",
    avatar_url: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["Speaking", "Listening", "Reading", "Writing", "Welsh Culture", "Grammar"],
    tone: "Supportive and culturally engaged",
    full_description: "AthroWelsh guides you through Welsh language learning with a focus on practical communication skills and cultural context.",
    short_description: "Your GCSE Welsh mentor specializing in language skills and cultural understanding",
    exam_boards: ["WJEC"] as ExamBoard[],
    supports_math_notation: false,
    supports_special_characters: false,
    supported_languages: ["en", "cy"]
  },
  {
    id: "languages",
    name: "AthroLanguages",
    subject: "Languages",
    avatar_url: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["Vocabulary", "Grammar", "Reading Comprehension", "Listening", "Speaking", "Writing", "Cultural Context"],
    tone: "Patient and conversational",
    full_description: "AthroLanguages helps you develop proficiency in foreign languages through practice and cultural context.",
    short_description: "Your GCSE Modern Languages mentor specializing in language acquisition and practical communication",
    exam_boards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supports_math_notation: false,
    supports_special_characters: true,
    supported_languages: ["en", "fr", "es", "de"]
  },
  {
    id: "religious-education",
    name: "AthroReligiousStudies",
    subject: "Religious Education",
    avatar_url: "/lovable-uploads/9bf71cf0-e802-43c5-97f7-6d22d1049f95.png",
    topics: ["World Religions", "Ethics", "Philosophy", "Sacred Texts", "Religious Practices", "Belief Systems"],
    tone: "Respectful and informative",
    full_description: "AthroReligiousStudies explores world religions, ethics, and philosophical questions with respect and critical thinking.",
    short_description: "Your GCSE Religious Studies mentor specializing in world religions and ethical frameworks",
    exam_boards: ["WJEC", "AQA", "OCR", "EDEXCEL"] as ExamBoard[],
    supports_math_notation: false,
    supports_special_characters: false,
    supported_languages: ["en"]
  }
];

export const athroCharacters: AthroCharacter[] = rawCharacters.map(standardizeAthroCharacter);

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
