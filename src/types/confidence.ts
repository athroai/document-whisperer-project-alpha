
export type ConfidenceLabel = 'Very Low' | 'Low' | 'Neutral' | 'High' | 'Very High';

export const confidenceOptions: ConfidenceLabel[] = ['Very Low', 'Low', 'Neutral', 'High', 'Very High'];

export const parseConfidence = (value: string): ConfidenceLabel => {
  const normalized = value.trim().toLowerCase();
  
  if (normalized.includes('very') && normalized.includes('low')) {
    return 'Very Low';
  }
  if (normalized.includes('low')) {
    return 'Low';
  }
  if (normalized.includes('neutral') || normalized.includes('medium') || normalized.includes('ok')) {
    return 'Neutral';
  }
  if (normalized.includes('very') && normalized.includes('high')) {
    return 'Very High';
  }
  if (normalized.includes('high') || normalized.includes('good')) {
    return 'High';
  }
  
  return 'Neutral'; // Default
};

export const confidenceToValue = (confidence: ConfidenceLabel): number => {
  switch (confidence) {
    case 'Very Low': return 1;
    case 'Low': return 2;
    case 'Neutral': return 3;
    case 'High': return 4;
    case 'Very High': return 5;
    default: return 3;
  }
};
