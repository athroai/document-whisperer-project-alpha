
import { toast } from "@/components/ui/use-toast";

export interface FeedbackInput {
  studentAnswer: string;
  modelAnswer?: string;
  subject: string;
  topic?: string;
  examBoard?: string;
  tone?: 'encouraging' | 'detailed' | 'headline-only';
}

export interface AIFeedbackResult {
  comment: string;
  score?: number;
  outOf?: number;
}

// Mock data for AI feedback model responses
const mockFeedback: Record<string, Record<string, string[]>> = {
  mathematics: {
    "algebra": [
      "Good work showing your steps in solving this equation. You correctly applied the distributive property, but be careful with the sign when moving terms between sides. Remember that subtracting a negative is the same as adding a positive.",
      "Excellent use of algebraic techniques! Your solution is methodical and shows deep understanding. To make your work even stronger, consider adding a brief explanation of why you chose your approach.",
      "Your work shows some understanding of the concept, but there are calculation errors. Double-check your arithmetic when combining like terms, and remember to apply operations to all terms inside parentheses."
    ],
    "geometry": [
      "Your proof demonstrates good understanding of triangle congruence. Be sure to explicitly state which congruence criterion (SSS, SAS, ASA, AAS) you're using at each step.",
      "Well done calculating the area of this complex shape by breaking it down! Your approach of dividing the shape into familiar parts shows good problem-solving skills. For clarity, include units in your final answer.",
      "Your construction shows some understanding of geometric principles. Pay attention to precision when measuring angles, and remember that parallel lines maintain the same distance from each other throughout."
    ]
  },
  science: {
    "chemistry": [
      "Your explanation of chemical bonding is clear and accurate. You correctly identified the type of bond formed and why. To strengthen your answer, consider how electronegativity affects the bond characteristics.",
      "Good work balancing this chemical equation! You've preserved mass correctly. To improve, explain the reaction type (e.g., synthesis, decomposition) and what observations might indicate this reaction is occurring.",
      "Your description of the periodic table trends shows understanding. To enhance your answer, explain why these trends occur in terms of atomic structure and electron configuration."
    ],
    "biology": [
      "Excellent explanation of cellular respiration! You clearly outlined the stages and energy transfers. Consider adding how this process relates to the organism's overall energy needs.",
      "Your diagram of the heart is well-labeled with good attention to detail. To improve, consider adding the direction of blood flow and oxygenation states to show the full circulatory function.",
      "Your explanation of natural selection includes key concepts like variation and survival advantage. To strengthen your answer, include a specific example of how this process has been observed in a species."
    ]
  },
  english: {
    "literature": [
      "Your analysis of the character's motivation is thoughtful and supported by evidence from the text. To enhance this further, consider how the author's word choice emphasizes these traits.",
      "Good identification of the poem's themes. Your examples support your interpretation well. To develop this answer further, explore how the structure and form of the poem reinforce these themes.",
      "Your comparison between the two texts shows understanding of their similarities. To make this more balanced, also consider significant differences in how the authors approach similar themes."
    ],
    "writing": [
      "Your essay has a clear structure with a strong introduction and conclusion. Your arguments are logical and build upon each other. To improve, add more specific examples to support each point.",
      "Your creative writing piece creates a vivid setting with good use of descriptive language. To enhance the narrative, develop the characters' personalities more through their actions and dialogue.",
      "Your persuasive writing makes your position clear. You've included several good reasons for your stance. To strengthen your argument, acknowledge and refute potential counter-arguments."
    ]
  }
};

// Mock AI scoring based on keywords in the student answer
const generateMockScore = (answer: string, subject: string): number => {
  // Simple scoring logic based on answer length and keyword presence
  const baseScore = Math.min(Math.floor(answer.length / 50), 5); // Up to 5 points for length
  
  // Subject-specific keywords that would indicate understanding
  const keywordsBySubject: Record<string, string[]> = {
    "mathematics": ["equation", "formula", "calculate", "solve", "proof", "theorem"],
    "science": ["experiment", "hypothesis", "evidence", "observation", "theory", "data"],
    "english": ["analysis", "character", "theme", "metaphor", "structure", "evidence"]
  };
  
  // Count keywords present in the answer
  const subjectKeywords = keywordsBySubject[subject.toLowerCase()] || [];
  let keywordCount = 0;
  
  subjectKeywords.forEach(keyword => {
    if (answer.toLowerCase().includes(keyword)) {
      keywordCount++;
    }
  });
  
  // Add up to 5 additional points for subject-specific keywords
  const keywordScore = Math.min(keywordCount, 5);
  
  return baseScore + keywordScore;
};

// Mock implementation of AI feedback generation
export const generateAIFeedback = async (
  input: FeedbackInput
): Promise<AIFeedbackResult> => {
  try {
    // In a real implementation, this would call OpenAI or similar
    // For now, we'll simulate a delay and return mock feedback
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { studentAnswer, subject, topic, tone } = input;
    const lowerSubject = subject.toLowerCase();
    const lowerTopic = topic?.toLowerCase() || "";
    
    // Find relevant feedback examples
    let feedbackPool: string[] = [];
    
    if (mockFeedback[lowerSubject]) {
      // Try to match by topic first
      if (lowerTopic && mockFeedback[lowerSubject][lowerTopic]) {
        feedbackPool = mockFeedback[lowerSubject][lowerTopic];
      } 
      // If no topic match or no specific topic provided, use all feedback for the subject
      else {
        feedbackPool = Object.values(mockFeedback[lowerSubject]).flat();
      }
    }
    
    if (feedbackPool.length === 0) {
      // Fallback if no matching feedback found
      feedbackPool = [
        "Your answer shows understanding of the core concepts. To improve, add more specific examples to support your points.",
        "Good attempt at answering the question. Consider reviewing the key terminology to make your explanation more precise.",
        "You've made some valid points in your response. To strengthen your answer, connect these ideas more explicitly to the question."
      ];
    }
    
    // Select a random piece of feedback
    const randomFeedback = feedbackPool[Math.floor(Math.random() * feedbackPool.length)];
    
    // Generate a mock score
    const score = generateMockScore(studentAnswer, subject);
    
    // Modify tone based on preference
    let finalFeedback = randomFeedback;
    
    if (tone === 'encouraging') {
      finalFeedback = `Great effort on this question! ${finalFeedback} Keep up the good work!`;
    } else if (tone === 'headline-only') {
      // Extract just the first sentence as a headline
      finalFeedback = finalFeedback.split('.')[0] + '.';
    }
    
    return {
      comment: finalFeedback,
      score: score,
      outOf: 10
    };
  } catch (error) {
    console.error('Error generating AI feedback:', error);
    toast({
      title: "AI Feedback Generation Failed",
      description: "Could not generate feedback at this time.",
      variant: "destructive",
    });
    
    return {
      comment: "Feedback not available — manual review required",
      score: undefined,
      outOf: 10
    };
  }
};

// Real implementation would include these functions
export const callOpenAI = async (systemPrompt: string, studentAnswer: string, modelAnswer?: string) => {
  // This would make an actual API call to OpenAI
  console.log("Would call OpenAI with:", { systemPrompt, studentAnswer, modelAnswer });
  return "OpenAI API not configured. Please add your API key in the settings.";
};

export const getModelAnswer = async (subject: string, topic: string, questionId?: string) => {
  // This would fetch model answers from a database or file system
  console.log("Would fetch model answer for:", { subject, topic, questionId });
  return null;
};

export const saveFeedbackToFirestore = async (submissionId: string, feedback: AIFeedbackResult) => {
  // This would save the feedback to Firestore
  console.log("Would save feedback to Firestore:", { submissionId, feedback });
  return true;
};
