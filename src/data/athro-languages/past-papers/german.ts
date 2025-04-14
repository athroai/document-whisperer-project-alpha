
import { PastPaper } from '@/types/athro';

export const germanPastPapers: PastPaper[] = [
  {
    id: 'g22-3850u10-1',
    subject: 'Languages',  // Changed from 'German' to match our AthroSubject type
    unit: '1',
    title: 'Speaking and Writing',
    examBoard: 'WJEC',  // Changed from lowercase to uppercase
    year: 2022,
    season: 'Summer',  // Changed from lowercase to uppercase
    questions: [
      {
        id: 'g22-3850u10-1-q1',
        topic: 'Personal Information',
        subtopic: 'Family',
        text: 'Beschreiben Sie Ihre Familie und was Sie zusammen machen.',
        marks: 10,
        difficulty: 'easy'
      },
      {
        id: 'g22-3850u10-1-q2',
        topic: 'Travel',
        subtopic: 'Holiday',
        text: 'Schreiben Sie über Ihren letzten Urlaub. Wohin sind Sie gefahren und was haben Sie dort gemacht?',
        marks: 15,
        difficulty: 'medium'
      },
      {
        id: 'g22-3850u10-1-q3',
        topic: 'Environment',
        subtopic: 'Climate Change',
        text: 'Was können wir tun, um die Umwelt zu schützen? Geben Sie Ihre Meinung.',
        marks: 15,
        difficulty: 'hard'
      }
    ],
    fileUrl: '/papers/german/g22-3850u10-1.pdf',
    markSchemeUrl: '/papers/german/g22-3850u10-1-ms.pdf'
  },
  {
    id: 'g21-3850u20-1',
    subject: 'Languages',  // Changed from 'German' to match our AthroSubject type
    unit: '2',
    title: 'Reading and Listening',
    examBoard: 'WJEC',  // Changed from lowercase to uppercase
    year: 2021,
    season: 'Summer',  // Changed from lowercase to uppercase
    questions: [
      {
        id: 'g21-3850u20-1-q1',
        topic: 'Comprehension',
        subtopic: 'Daily Life',
        text: 'Lesen Sie den Text über das tägliche Leben in Deutschland und beantworten Sie die folgenden Fragen.',
        marks: 15,
        difficulty: 'medium'
      },
      {
        id: 'g21-3850u20-1-q2',
        topic: 'Grammar',
        subtopic: 'Cases',
        text: 'Ergänzen Sie den Text mit den richtigen Artikeln im Dativ oder Akkusativ.',
        marks: 10,
        difficulty: 'hard'
      }
    ],
    fileUrl: '/papers/german/g21-3850u20-1.pdf',
    markSchemeUrl: '/papers/german/g21-3850u20-1-ms.pdf'
  }
];

export default germanPastPapers;
