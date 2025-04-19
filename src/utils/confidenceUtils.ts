
import { ConfidenceLabel } from '@/types/confidence';

export const parseConfidence = (input: string): ConfidenceLabel => {
  const normalized = input.trim().toLowerCase();
  
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

export const getConfidenceDescription = (confidence: ConfidenceLabel): string => {
  switch(confidence) {
    case 'Very Low':
      return "You're finding this subject quite challenging and need extra support.";
    case 'Low':
      return "You have some understanding but could use more guidance in this subject.";
    case 'Neutral':
      return "You have a moderate understanding of this subject.";
    case 'High':
      return "You have a good grasp of this subject but there's still room to improve.";
    case 'Very High':
      return "You're confident and doing well in this subject.";
    default:
      return "You have a moderate understanding of this subject.";
  }
};

export const recommendedResourceTypes = (confidence: ConfidenceLabel, visualLearner: boolean = false): string[] => {
  const resources: string[] = [];
  
  switch(confidence) {
    case 'Very Low':
    case 'Low':
      resources.push(visualLearner ? 'Beginner tutorial videos' : 'Simplified study guides');
      resources.push('Step-by-step examples');
      resources.push('Foundation level practice questions');
      break;
    case 'Neutral':
      resources.push('Mixed practice questions');
      resources.push(visualLearner ? 'Visual summaries' : 'Comprehensive notes');
      resources.push('Interactive quizzes');
      break;
    case 'High':
    case 'Very High':
      resources.push('Advanced practice papers');
      resources.push('Complex problem-solving exercises');
      resources.push(visualLearner ? 'Detailed concept maps' : 'Academic articles');
      break;
  }
  
  return resources;
};
