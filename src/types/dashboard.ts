
export interface Student {
  id: string;
  name: string;
  email: string;
  confidenceTrend: Array<{
    date: string;
    confidence: number;
  }>;
  lastStudy: string;
  lastQuiz: {
    date: string;
    score: number;
    subject: string;
  };
  subjects: {
    [key: string]: SubjectData;
  };
}

export interface SubjectData {
  confidence: number;
  averageScore: number;
  sessionsThisWeek: number;
}
