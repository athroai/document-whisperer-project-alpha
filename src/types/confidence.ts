
export type ConfidenceLabel = 
  | "Very confident" 
  | "Slightly confident" 
  | "Neutral" 
  | "Slightly unsure" 
  | "Very unsure";

export const confidenceOptions: ConfidenceLabel[] = [
  "Very confident",
  "Slightly confident", 
  "Neutral",
  "Slightly unsure",
  "Very unsure"
];

// Convert confidence label to difficulty (1-3)
export const getDifficultyFromConfidence = (label: ConfidenceLabel): number => {
  switch (label) {
    case "Very confident":
      return 1;
    case "Slightly confident":
      return 1;
    case "Neutral":
      return 2;
    case "Slightly unsure":
      return 3;
    case "Very unsure":
      return 3;
    default:
      return 2;
  }
};

// Add the missing function to convert between string and number representations
export const confidenceToNumber = (label: ConfidenceLabel): number => {
  const index = confidenceOptions.indexOf(label);
  return index >= 0 ? index + 1 : 3; // Default to middle (Neutral)
};

// Convert a number back to a confidence label
export const numberToConfidenceLabel = (value: number): ConfidenceLabel => {
  const index = Math.min(Math.max(Math.round(value) - 1, 0), confidenceOptions.length - 1);
  return confidenceOptions[index];
};
