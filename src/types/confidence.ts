
export type ConfidenceLabel = 'Very Low' | 'Low' | 'Neutral' | 'High' | 'Very High';

export const confidenceOptions: ConfidenceLabel[] = [
  'Very Low',
  'Low', 
  'Neutral', 
  'High', 
  'Very High'
];

export const getConfidenceColor = (confidence: ConfidenceLabel): string => {
  switch (confidence) {
    case 'Very Low':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Low':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Neutral':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'High':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Very High':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return '';
  }
};

// Helper function to map numeric confidence scores to labels
export const mapScoreToConfidence = (score: number): ConfidenceLabel => {
  if (score >= 8) return 'Very High';
  if (score >= 6) return 'High';
  if (score >= 4) return 'Neutral';
  if (score >= 2) return 'Low';
  return 'Very Low';
};

// Helper function to map between old and new confidence label formats
export const mapLegacyConfidence = (oldLabel: string): ConfidenceLabel => {
  switch (oldLabel) {
    case 'Very confident': return 'Very High';
    case 'Slightly confident': return 'High';
    case 'Neutral': return 'Neutral';
    case 'Slightly unsure': return 'Low';
    case 'Very unsure': return 'Very Low';
    default: return 'Neutral';
  }
};
