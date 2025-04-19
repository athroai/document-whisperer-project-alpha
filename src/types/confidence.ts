
export type ConfidenceLabel = 
  | "Very confident" 
  | "Slightly confident" 
  | "Neutral" 
  | "Slightly unsure" 
  | "Very unsure"
  | "Very Low"
  | "Low" 
  | "Neutral"
  | "High"
  | "Very High";

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
    case "Very High":
      return 1;
    case "Slightly confident":
    case "High":
      return 1;
    case "Neutral":
      return 2;
    case "Slightly unsure":
    case "Low":
      return 3;
    case "Very unsure":
    case "Very Low":
      return 3;
    default:
      return 2;
  }
};
