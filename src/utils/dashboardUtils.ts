
import { Student } from '@/types/dashboard';

export const getSubjectColor = (subject: string) => {
  switch (subject.toLowerCase()) {
    case 'maths': return '#8884d8';
    case 'science': return '#82ca9d';
    case 'english': return '#ffc658';
    case 'history': return '#ff8042';
    default: return '#8884d8';
  }
};

export const calculateClassAverages = (students: Student[]) => {
  const classAverages = students.reduce((acc, student) => {
    Object.entries(student.subjects).forEach(([subject, data]) => {
      if (!acc[subject]) {
        acc[subject] = { confidenceSum: 0, scoreSum: 0, count: 0 };
      }
      acc[subject].confidenceSum += data.confidence;
      acc[subject].scoreSum += data.averageScore;
      acc[subject].count += 1;
    });
    return acc;
  }, {} as Record<string, { confidenceSum: number, scoreSum: number, count: number }>);

  return Object.entries(classAverages).map(([subject, data]) => ({
    subject: subject.charAt(0).toUpperCase() + subject.slice(1),
    confidence: parseFloat((data.confidenceSum / data.count).toFixed(1)),
    score: parseFloat((data.scoreSum / data.count).toFixed(1)),
  }));
};
