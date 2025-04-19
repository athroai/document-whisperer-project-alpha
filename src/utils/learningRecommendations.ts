
import { ConfidenceLabel } from '@/types/confidence';

interface LearningStyle {
  visual: number;
  auditory: number;
  reading: number;
  kinesthetic: number;
}

interface StudyTool {
  name: string;
  description: string;
  url: string;
  learningStyles: (keyof LearningStyle)[];
  confidenceLevels: ConfidenceLabel[];
}

export const studyTools: StudyTool[] = [
  {
    name: "Quizlet",
    description: "Create and share flashcards for effective revision",
    url: "https://quizlet.com",
    learningStyles: ["visual", "reading"],
    confidenceLevels: ["Low", "Neutral", "High"]
  },
  {
    name: "Khan Academy",
    description: "Free video lessons and practice exercises",
    url: "https://www.khanacademy.org",
    learningStyles: ["visual", "auditory"],
    confidenceLevels: ["Very Low", "Low", "Neutral"]
  },
  {
    name: "BBC Bitesize",
    description: "Comprehensive GCSE revision materials",
    url: "https://www.bbc.co.uk/bitesize/levels/z98jmp3",
    learningStyles: ["visual", "reading", "auditory"],
    confidenceLevels: ["Very Low", "Low", "Neutral", "High", "Very High"]
  },
  {
    name: "Seneca Learning",
    description: "Interactive revision with smart algorithms",
    url: "https://senecalearning.com",
    learningStyles: ["visual", "kinesthetic", "reading"],
    confidenceLevels: ["Low", "Neutral", "High"]
  },
  {
    name: "Corbett Maths",
    description: "Math videos, worksheets and practice questions",
    url: "https://corbettmaths.com",
    learningStyles: ["visual", "kinesthetic"],
    confidenceLevels: ["Very Low", "Low", "Neutral", "High"]
  },
  {
    name: "Physics & Maths Tutor",
    description: "Past papers and revision resources",
    url: "https://www.physicsandmathstutor.com",
    learningStyles: ["reading", "kinesthetic"],
    confidenceLevels: ["Neutral", "High", "Very High"]
  },
  {
    name: "Memrise",
    description: "Language learning with spaced repetition",
    url: "https://www.memrise.com",
    learningStyles: ["auditory", "visual", "reading"],
    confidenceLevels: ["Low", "Neutral", "High"]
  },
  {
    name: "GCSEPod",
    description: "Curriculum-based podcasts and videos",
    url: "https://www.gcsepod.com",
    learningStyles: ["auditory", "visual"],
    confidenceLevels: ["Low", "Neutral", "High"]
  },
  {
    name: "Mind Maps App",
    description: "Create visual mind maps for effective revision",
    url: "https://www.mindmaps.app",
    learningStyles: ["visual", "kinesthetic"],
    confidenceLevels: ["Neutral", "High", "Very High"]
  },
  {
    name: "Pomodoro Timer",
    description: "Time management technique for focused study",
    url: "https://pomofocus.io",
    learningStyles: ["kinesthetic"],
    confidenceLevels: ["Very Low", "Low", "Neutral", "High", "Very High"]
  }
];

export const getRecommendedTools = (
  learningStyle: LearningStyle,
  confidence: ConfidenceLabel,
  limit: number = 3
): StudyTool[] => {
  // Find the dominant learning style
  const dominantStyle = Object.entries(learningStyle)
    .sort((a, b) => b[1] - a[1])[0][0] as keyof LearningStyle;
  
  // Filter tools that match the dominant style and confidence level
  const matchingTools = studyTools.filter(tool => 
    tool.learningStyles.includes(dominantStyle) && 
    tool.confidenceLevels.includes(confidence)
  );
  
  // If we don't have enough matching tools, add some that match just the learning style
  let recommendedTools = [...matchingTools];
  
  if (recommendedTools.length < limit) {
    const additionalTools = studyTools.filter(tool => 
      tool.learningStyles.includes(dominantStyle) && 
      !recommendedTools.includes(tool)
    );
    recommendedTools = [...recommendedTools, ...additionalTools];
  }
  
  // If we still don't have enough, add some general tools
  if (recommendedTools.length < limit) {
    const generalTools = studyTools.filter(tool => 
      !recommendedTools.includes(tool)
    );
    recommendedTools = [...recommendedTools, ...generalTools];
  }
  
  // Return limited number of tools
  return recommendedTools.slice(0, limit);
};

export const getLearningStyleDescription = (learningStyle: LearningStyle): string => {
  const dominantStyle = Object.entries(learningStyle)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  switch(dominantStyle) {
    case 'visual':
      return "You learn best through visual aids like diagrams, charts, and videos. Try using color-coding, mind maps, and watching educational videos.";
    case 'auditory':
      return "You learn best by listening. Try recording yourself reading notes, discussing topics with others, or using educational podcasts.";
    case 'reading':
      return "You learn best through reading and writing. Taking detailed notes, summarizing content in your own words, and reading textbooks work well for you.";
    case 'kinesthetic':
      return "You learn best through hands-on activities. Try using flashcards, conducting experiments, and taking regular breaks to move around.";
    default:
      return "You have a balanced learning style. Try a mix of different study methods to find what works best for you.";
  }
};
