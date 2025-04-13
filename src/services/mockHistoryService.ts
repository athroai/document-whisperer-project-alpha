
import { HistoryEntry } from "@/types/history";

export function getMockStudentHistory(): HistoryEntry[] {
  return [
    {
      id: "1",
      type: "goal",
      subject: "Mathematics",
      topic: "Quadratics",
      dateCompleted: "2025-04-12",
      score: 80,
      feedback: "Good effort! Your method was sound.",
      encouragement: "Let's build on this!",
      activityName: "Quadratic Equations Goal",
      activityId: "goal1"
    },
    {
      id: "2",
      type: "assignment",
      subject: "Science",
      topic: "Cell Structure",
      dateCompleted: "2025-04-10",
      score: 75,
      feedback: "Good understanding of cell components. Work on explaining functions more clearly.",
      encouragement: "Your diagrams were excellent!",
      activityName: "Cell Structure Essay",
      activityId: "assignment_2"
    },
    {
      id: "3",
      type: "quiz",
      subject: "English",
      topic: "Shakespeare",
      dateCompleted: "2025-04-08",
      score: 90,
      feedback: "Excellent analysis of character motivations.",
      encouragement: "Your literary criticism skills are developing nicely!",
      activityName: "Macbeth Character Quiz",
      activityId: "quiz1"
    },
    {
      id: "4",
      type: "session",
      subject: "Geography",
      topic: "River Systems",
      dateCompleted: "2025-04-05",
      feedback: "Good questions about erosion processes.",
      encouragement: "Keep exploring these concepts!",
      activityName: "River Systems Study Session",
      activityId: "session1"
    },
    {
      id: "5",
      type: "assignment",
      subject: "Mathematics",
      topic: "Percentages",
      dateCompleted: "2025-04-15",
      score: 85,
      feedback: "Good work on calculating percentage changes.",
      encouragement: "You've made great progress with percentages!",
      activityName: "Percentage Quiz Practice",
      activityId: "assignment_1"
    },
    {
      id: "6",
      type: "quiz",
      subject: "Welsh",
      topic: "Vocabulary",
      dateCompleted: "2025-04-02",
      score: 70,
      feedback: "Good vocabulary knowledge, but work on sentence structures.",
      encouragement: "Keep practicing your conversations!",
      activityName: "Welsh Vocabulary Quiz",
      activityId: "quiz2"
    },
    {
      id: "7",
      type: "goal",
      subject: "History",
      topic: "Tudor England",
      dateCompleted: "2025-03-28",
      score: 100,
      feedback: "Excellent understanding of the political climate of Tudor England.",
      encouragement: "Your historical analysis is outstanding!",
      activityName: "Tudor Period Research Goal",
      activityId: "goal2"
    },
    {
      id: "8",
      type: "session",
      subject: "Science",
      topic: "Chemical Reactions",
      dateCompleted: "2025-03-25",
      feedback: "Engaged well with the balancing equations exercise.",
      encouragement: "Your systematic approach will help with future chemistry work!",
      activityName: "Chemistry Study Session",
      activityId: "session2"
    }
  ];
}

export function getHistoryByType(type: 'goal' | 'assignment' | 'quiz' | 'session'): HistoryEntry[] {
  return getMockStudentHistory().filter(entry => entry.type === type);
}

export function getHistoryBySubject(subject: string): HistoryEntry[] {
  return getMockStudentHistory().filter(entry => 
    entry.subject.toLowerCase() === subject.toLowerCase()
  );
}
