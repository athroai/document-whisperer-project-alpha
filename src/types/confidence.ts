
export type ConfidenceLabel = "Very confident" | "Slightly confident" | "Neutral" | "Slightly unsure" | "Very unsure";

export const confidenceOptions: ConfidenceLabel[] = [
  "Very confident",
  "Slightly confident", 
  "Neutral",
  "Slightly unsure",
  "Very unsure"
];

export const confidenceToNumber = (label: ConfidenceLabel): number => {
  const confidenceMap: Record<ConfidenceLabel, number> = {
    "Very confident": 10,
    "Slightly confident": 8,
    "Neutral": 6,
    "Slightly unsure": 4,
    "Very unsure": 2
  };
  return confidenceMap[label];
};

// Convert number to string for database storage
export const numberToConfidenceString = (value: number): string => {
  return String(value);
};
