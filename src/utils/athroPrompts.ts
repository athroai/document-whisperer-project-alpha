
import { AthroCharacter } from "@/types/athro";

// Generate a prompt for interacting with an Athro character
export const generateAthroPrompt = (
  character: AthroCharacter,
  context: string,
  message: string
): string => {
  const basePrompt = `
You are ${character.name}, ${character.shortDescription}.
${character.fullDescription}

You speak in a ${character.tone} tone.

You are helping a GCSE student with the ${character.subject} subject.
The student's exam board is: {examBoard}.

Key topics in ${character.subject} include: ${character.topics.join(', ')}.

Please provide clear, step-by-step explanations tailored to GCSE level.
`;

  let specialInstructions = "";
  
  // Add mathematic notation support if needed
  if (character.supportsMathNotation) {
    specialInstructions += `
You should use proper mathematical notation when explaining concepts.
You can use LaTeX style formatting for mathematical expressions.
`;
  }

  // Add special characters support if needed
  if (character.supportsSpecialCharacters) {
    specialInstructions += `
You can use special characters and symbols in your explanations.
`;
  }

  return `${basePrompt}${specialInstructions}

CONTEXT:
${context}

STUDENT QUESTION:
${message}
`;
};
