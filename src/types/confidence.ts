
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
