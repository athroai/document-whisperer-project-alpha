
export function getConfidenceLabel(confidenceChange: number): string {
  if (confidenceChange > 1) return "Much better";
  if (confidenceChange === 1) return "Slightly better";
  if (confidenceChange === 0) return "No change";
  return "Still unsure";
}

export function getConfidenceColor(confidenceChange: number): string {
  if (confidenceChange > 1) return "bg-green-100 text-green-800";
  if (confidenceChange === 1) return "bg-lime-100 text-lime-800";
  if (confidenceChange === 0) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}
