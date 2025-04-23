// Define confidence level types
export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type ConfidenceLabel = 'low' | 'medium' | 'high';

// Helper functions for converting between level and label
export const mapConfidenceToLabel = (level: ConfidenceLevel): ConfidenceLabel => {
  if (level <= 3) return 'low';
  if (level <= 7) return 'medium';
  return 'high';
};

export const mapLabelToConfidence = (label: ConfidenceLabel): ConfidenceLevel => {
  switch (label) {
    case 'low': return 2;
    case 'medium': return 5;
    case 'high': return 8;
    default: return 5;
  }
};

export const confidenceOptions: ConfidenceLabel[] = ["low", "medium", "high"];

// For compatibility with old code
export const getConfidenceColor = (level: ConfidenceLevel | ConfidenceLabel): string => {
  const label = typeof level === 'string' ? level : mapConfidenceToLabel(level);
  
  switch (label) {
    case 'low': return 'bg-red-100 text-red-700 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'high': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export { ConfidenceLabel, ConfidenceLevel };
