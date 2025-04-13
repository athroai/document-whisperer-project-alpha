
import { toast } from "@/components/ui/use-toast";
import { generateAIFeedback, FeedbackInput } from "./aiFeedback";

// Types for marking engine
export interface MarkingRequest {
  prompt: string;
  answer: string;
  subject: string;
  topic?: string;
  examBoard?: string;
  sourceType?: 'quiz' | 'task' | 'athro_chat';
  userId?: string;
  teacherId?: string;
}

export interface MarkingResult {
  score: number;
  outOf: number;
  explanation: string;
  suggestedImprovement?: string;
  timestamp: string;
}

export interface MarkingRecord {
  id: string;
  submittedBy: string;
  assignedBy: string | null;
  subject: string;
  topic: string | null;
  source: 'quiz' | 'task' | 'athro_chat';
  originalPrompt: string;
  studentAnswer: string;
  aiMark: {
    score: number;
    outOf: number;
    comment: string;
  };
  teacherMark: {
    score: number | null;
    outOf: number;
    comment: string | null;
    override: boolean;
  } | null;
  finalFeedback: string;
  visibility: 'student' | 'teacher' | 'admin';
  timestamp: string;
}

// Mock data for subject keywords and model answers
const subjectKeywords: Record<string, Record<string, string[]>> = {
  mathematics: {
    "percentages": ["percent", "proportion", "fraction", "decimal", "hundredth"],
    "algebra": ["equation", "variable", "solve", "expression", "unknown"],
    "geometry": ["shape", "angle", "triangle", "circle", "area", "perimeter"]
  },
  science: {
    "cells": ["mitochondria", "nucleus", "membrane", "organelle", "cytoplasm"],
    "photosynthesis": ["chlorophyll", "sunlight", "carbon dioxide", "oxygen", "glucose"],
    "respiration": ["energy", "oxygen", "glucose", "mitochondria", "ATP"]
  }
};

// Detect topic from answer using keywords
const detectTopic = (answer: string, subject: string): string | null => {
  const subjectLower = subject.toLowerCase();
  const answerLower = answer.toLowerCase();
  
  if (!subjectKeywords[subjectLower]) return null;
  
  let bestMatch = { topic: null as string | null, count: 0 };
  
  for (const [topic, keywords] of Object.entries(subjectKeywords[subjectLower])) {
    const matchCount = keywords.filter(word => answerLower.includes(word)).length;
    if (matchCount > bestMatch.count) {
      bestMatch = { topic, count: matchCount };
    }
  }
  
  return bestMatch.topic;
};

// Generate mock AI scoring based on answer content and topic
const generateAIScoring = (answer: string, prompt: string, subject: string, topic: string | null): MarkingResult => {
  // This is a simplified mock of what would be an AI model call
  
  // Simple length check
  const answerLength = answer.trim().length;
  const promptKeywords = prompt.toLowerCase().split(/\s+/);
  const answerKeywords = answer.toLowerCase().split(/\s+/);
  
  // Calculate keyword overlap
  const overlap = promptKeywords.filter(word => 
    answerKeywords.includes(word) && word.length > 3
  ).length;
  
  // Determine score based on simple heuristics
  let score = 0;
  const outOf = 5; // Default scale
  
  // Add points based on answer length (basic proxy for completeness)
  if (answerLength > 100) score += 2;
  else if (answerLength > 50) score += 1;
  
  // Add points based on keyword overlap with prompt
  score += Math.min(overlap, 2);
  
  // Topic relevance bonus
  if (topic && answer.toLowerCase().includes(topic)) {
    score += 1;
  }
  
  // Cap the score to outOf
  score = Math.min(score, outOf);
  
  // Generate explanation
  let explanation = "";
  let improvement = "";
  
  if (score >= 4) {
    explanation = `Strong answer covering the key concepts. Good use of relevant terminology.`;
  } else if (score >= 2) {
    explanation = `Partial answer with some key points. Some important elements are addressed.`;
    improvement = `Consider expanding on the ${topic || 'main'} concepts and using more specific terminology.`;
  } else {
    explanation = `Limited answer that needs development. Few key points addressed.`;
    improvement = `Review the ${topic || 'topic'} material and try to include more specific information in your answer.`;
  }
  
  return {
    score,
    outOf,
    explanation,
    suggestedImprovement: improvement,
    timestamp: new Date().toISOString()
  };
};

// Mark an answer and generate a marking record
export const markAnswer = async (request: MarkingRequest): Promise<MarkingRecord> => {
  try {
    // Detect topic if not provided
    const topic = request.topic || detectTopic(request.answer, request.subject);
    
    // Generate AI feedback using the aiFeedback service
    const aiFeedbackInput: FeedbackInput = {
      studentAnswer: request.answer,
      subject: request.subject,
      topic: topic || undefined,
      examBoard: request.examBoard,
      tone: 'encouraging', // Default tone, could be made configurable
    };
    
    const aiFeedbackResult = await generateAIFeedback(aiFeedbackInput);
    
    // Create marking record
    const record: MarkingRecord = {
      id: `mark_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      submittedBy: request.userId || 'anonymous',
      assignedBy: request.teacherId || null,
      subject: request.subject,
      topic: topic,
      source: request.sourceType || 'quiz',
      originalPrompt: request.prompt,
      studentAnswer: request.answer,
      aiMark: {
        score: aiFeedbackResult.score || 0,
        outOf: aiFeedbackResult.outOf || 10,
        comment: aiFeedbackResult.comment
      },
      teacherMark: null,
      finalFeedback: aiFeedbackResult.comment,
      visibility: 'student',
      timestamp: new Date().toISOString()
    };
    
    // In a real implementation, save to Firestore
    // For now, store in localStorage as a mock
    const existingRecords = JSON.parse(localStorage.getItem('marking_records') || '[]');
    existingRecords.push(record);
    localStorage.setItem('marking_records', JSON.stringify(existingRecords));
    
    return record;
  } catch (error) {
    console.error('Error in marking engine:', error);
    toast({
      title: "Marking Failed",
      description: "There was an error processing your answer.",
      variant: "destructive",
    });
    
    throw error;
  }
};

// Get all marking records (mock implementation)
export const getMarkingRecords = async (filters?: {
  teacherId?: string;
  studentId?: string;
  subject?: string;
  status?: 'ai_only' | 'teacher_reviewed';
}): Promise<MarkingRecord[]> => {
  try {
    // Retrieve mock data from localStorage
    const records: MarkingRecord[] = JSON.parse(localStorage.getItem('marking_records') || '[]');
    
    // Apply filters if specified
    if (filters) {
      return records.filter(record => {
        let match = true;
        
        if (filters.teacherId && record.assignedBy !== filters.teacherId) {
          match = false;
        }
        
        if (filters.studentId && record.submittedBy !== filters.studentId) {
          match = false;
        }
        
        if (filters.subject && record.subject !== filters.subject) {
          match = false;
        }
        
        if (filters.status === 'ai_only' && record.teacherMark !== null) {
          match = false;
        }
        
        if (filters.status === 'teacher_reviewed' && record.teacherMark === null) {
          match = false;
        }
        
        return match;
      });
    }
    
    return records;
  } catch (error) {
    console.error('Error fetching marking records:', error);
    return [];
  }
};

// Update a marking record with teacher feedback
export const updateMarkingRecord = async (recordId: string, teacherUpdate: {
  score?: number;
  comment?: string;
  override?: boolean;
  finalFeedback?: string;
}): Promise<MarkingRecord | null> => {
  try {
    const records: MarkingRecord[] = JSON.parse(localStorage.getItem('marking_records') || '[]');
    const recordIndex = records.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) return null;
    
    const record = records[recordIndex];
    
    // Update teacher mark
    if (!record.teacherMark) {
      record.teacherMark = {
        score: null,
        outOf: record.aiMark.outOf,
        comment: null,
        override: false
      };
    }
    
    if (teacherUpdate.score !== undefined) {
      record.teacherMark.score = teacherUpdate.score;
    }
    
    if (teacherUpdate.comment !== undefined) {
      record.teacherMark.comment = teacherUpdate.comment;
    }
    
    if (teacherUpdate.override !== undefined) {
      record.teacherMark.override = teacherUpdate.override;
    }
    
    // Update final feedback if provided
    if (teacherUpdate.finalFeedback) {
      record.finalFeedback = teacherUpdate.finalFeedback;
    } else if (record.teacherMark.override && record.teacherMark.comment) {
      // Update final feedback based on teacher override
      record.finalFeedback = record.teacherMark.comment;
    }
    
    // Save updated records
    records[recordIndex] = record;
    localStorage.setItem('marking_records', JSON.stringify(records));
    
    toast({
      title: "Marking Updated",
      description: "The marking record has been updated successfully.",
    });
    
    return record;
  } catch (error) {
    console.error('Error updating marking record:', error);
    toast({
      title: "Update Failed",
      description: "There was an error updating the marking.",
      variant: "destructive",
    });
    return null;
  }
};

// API hooks for future integration
export const createExternalMarking = async () => {
  // Placeholder for OpenAI integration
  console.log('OpenAI marking integration would be implemented here');
};

export const checkPlagiarism = async () => {
  // Placeholder for Turnitin integration
  console.log('Plagiarism check would be implemented here');
};

export const getExamBoardMarking = async () => {
  // Placeholder for exam board specific marking
  console.log('Exam board specific marking would be implemented here');
};

// Get teacher marking style preference
export const getTeacherMarkingStyle = async (teacherId: string): Promise<"encouraging" | "detailed" | "headline-only"> => {
  try {
    // In a real implementation, fetch from Firestore
    // For now, return a default value or check localStorage
    const preferences = JSON.parse(localStorage.getItem('teacher_preferences') || '{}');
    return preferences[teacherId]?.markingStyle || "detailed";
  } catch (error) {
    console.error('Error fetching teacher marking style:', error);
    return "detailed";
  }
};

// Save teacher marking style preference
export const saveTeacherMarkingStyle = async (
  teacherId: string, 
  style: "encouraging" | "detailed" | "headline-only"
): Promise<boolean> => {
  try {
    // In a real implementation, save to Firestore
    // For now, save to localStorage
    const preferences = JSON.parse(localStorage.getItem('teacher_preferences') || '{}');
    
    if (!preferences[teacherId]) {
      preferences[teacherId] = {};
    }
    
    preferences[teacherId].markingStyle = style;
    localStorage.setItem('teacher_preferences', JSON.stringify(preferences));
    
    return true;
  } catch (error) {
    console.error('Error saving teacher marking style:', error);
    return false;
  }
};
