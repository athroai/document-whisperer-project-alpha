
import { ConfidenceLabel } from '@/types/confidence';

export function getConfidenceLabel(confidenceBefore: ConfidenceLabel, confidenceAfter: ConfidenceLabel): string {
  const confidenceOrder = [
    "Very unsure",
    "Slightly unsure",
    "Neutral",
    "Slightly confident",
    "Very confident"
  ];
  
  const beforeIndex = confidenceOrder.indexOf(confidenceBefore);
  const afterIndex = confidenceOrder.indexOf(confidenceAfter);
  
  if (afterIndex > beforeIndex) return "Much better";
  if (afterIndex === beforeIndex + 1) return "Slightly better";
  if (afterIndex === beforeIndex) return "No change";
  return "Still unsure";
}

// Overloaded version to handle number differences for backward compatibility
export function getConfidenceChange(change: number): string {
  if (change >= 2) return "Much better";
  if (change === 1) return "Slightly better";
  if (change === 0) return "No change";
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
export function parseConfidence(value: string): ConfidenceLabel {
  if (typeof value !== 'string') return "Neutral";
  
  const validLabels: ConfidenceLabel[] = [
    "Very confident",
    "Slightly confident",
    "Neutral",
    "Slightly unsure",
    "Very unsure"
  ];
  
  return validLabels.includes(value as ConfidenceLabel) 
    ? value as ConfidenceLabel 
    : "Neutral";
}
