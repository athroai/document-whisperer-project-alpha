
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
