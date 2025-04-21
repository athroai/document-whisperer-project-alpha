
export type ConfidenceLabel = 'low' | 'medium' | 'high';

export const confidenceOptions: ConfidenceLabel[] = [
  "low", 
  "medium", 
  "high"
];

export function mapLegacyConfidence(value: string): ConfidenceLabel {
  switch(value) {
    case 'Very confident':
      return 'high';
    case 'Slightly confident':
      return 'medium';
    case 'Slightly unsure':
      return 'medium';
    case 'Very unsure':
      return 'low';
    default:
      return 'medium';
  }
}

export function mapScoreToConfidence(score: number): ConfidenceLabel {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}
