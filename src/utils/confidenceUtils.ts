
import { ConfidenceLabel, mapLegacyConfidence } from '@/types/confidence';

export function getConfidenceChange(beforeLabel: string | number | ConfidenceLabel, afterLabel: string | number | ConfidenceLabel): string {
  const before = parseConfidence(beforeLabel);
  const after = parseConfidence(afterLabel);
  
  const confidenceOrder = [
    "Very Low",
    "Low",
    "Neutral",
    "High", 
    "Very High"
  ];
  
  const beforeIndex = confidenceOrder.indexOf(before);
  const afterIndex = confidenceOrder.indexOf(after);
  
  if (afterIndex > beforeIndex + 1) return "Much better";
  if (afterIndex > beforeIndex) return "Slightly better";
  if (afterIndex === beforeIndex) return "No change";
  return "Still unsure";
}

export function getConfidenceColor(label: string): string {
  switch (label) {
    case "Much better":
      return "bg-green-100 text-green-800";
    case "Slightly better":
      return "bg-lime-100 text-lime-800";
    case "No change":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-red-100 text-red-800";
  }
}

// Helper to ensure confidence value is a valid label
export function parseConfidence(value: string | number | undefined | null): ConfidenceLabel {
  if (value === undefined || value === null) return "Neutral";
  
  // Handle number to string conversion (legacy support)
  if (typeof value === 'number') {
    if (value >= 8) return "Very High";
    if (value >= 6) return "High";
    if (value >= 4) return "Neutral";
    if (value >= 2) return "Low";
    return "Very Low";
  }
  
  // Handle legacy confidence labels
  if (typeof value === 'string' && 
      ['Very confident', 'Slightly confident', 'Slightly unsure', 'Very unsure'].includes(value)) {
    return mapLegacyConfidence(value);
  }
  
  // For string values
  const validLabels: ConfidenceLabel[] = [
    "Very High",
    "High",
    "Neutral",
    "Low",
    "Very Low"
  ];
  
  return validLabels.includes(value as ConfidenceLabel) 
    ? value as ConfidenceLabel 
    : "Neutral";
}
