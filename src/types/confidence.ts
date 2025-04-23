
/**
 * Confidence level mapping and utilities
 */

import { ConfidenceLabel, ConfidenceLevel } from './study';

export const CONFIDENCE_LEVELS: Record<ConfidenceLabel, ConfidenceLevel[]> = {
  'low': [1, 2, 3],
  'medium': [4, 5, 6, 7],
  'high': [8, 9, 10]
};

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
  }
};

export const getConfidenceColor = (confidence: ConfidenceLabel | ConfidenceLevel): string => {
  const label = typeof confidence === 'number' 
    ? mapConfidenceToLabel(confidence as ConfidenceLevel) 
    : confidence;
    
  switch (label) {
    case 'low': return 'text-red-500';
    case 'medium': return 'text-yellow-500';
    case 'high': return 'text-green-500';
    default: return 'text-gray-500';
  }
};
