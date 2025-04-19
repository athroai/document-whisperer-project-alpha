
import { ConfidenceLabel } from '@/types/confidence';

export const getConfidenceColor = (confidence: string): string => {
  switch (confidence.toLowerCase()) {
    case 'very low':
      return 'bg-red-100 text-red-800';
    case 'low':
      return 'bg-orange-100 text-orange-800';
    case 'neutral':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-green-100 text-green-800';
    case 'very high':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getConfidenceChange = (oldValue: string | number, newValue: string | number): string => {
  const scores = {
    'very low': 1,
    'low': 2,
    'neutral': 3,
    'high': 4,
    'very high': 5
  };

  // Convert numeric values to strings if needed
  const oldValueStr = typeof oldValue === 'number' ? valueToConfidenceLabel(oldValue) : oldValue;
  const newValueStr = typeof newValue === 'number' ? valueToConfidenceLabel(newValue) : newValue;
  
  // Default values if not found
  const oldScore = scores[oldValueStr.toLowerCase() as keyof typeof scores] || 3;
  const newScore = scores[newValueStr.toLowerCase() as keyof typeof scores] || 3;
  
  const difference = newScore - oldScore;

  if (difference === 0) {
    return 'No change';
  } else if (difference > 0) {
    return `+${difference} improvement`;
  } else {
    return `${difference} decrease`;
  }
};

export const confidenceLabelToValue = (label: ConfidenceLabel): number => {
  switch (label) {
    case 'Very Low': return 1;
    case 'Low': return 2;
    case 'Neutral': return 3;
    case 'High': return 4;
    case 'Very High': return 5;
    default: return 3;
  }
};

export const valueToConfidenceLabel = (value: number): ConfidenceLabel => {
  if (value <= 1) return 'Very Low';
  if (value <= 2) return 'Low';
  if (value <= 3) return 'Neutral';
  if (value <= 4) return 'High';
  return 'Very High';
};

export const parseConfidence = (value: string | number): ConfidenceLabel => {
  // Handle numeric values
  if (typeof value === 'number') {
    return valueToConfidenceLabel(value);
  }
  
  // Handle string values
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
