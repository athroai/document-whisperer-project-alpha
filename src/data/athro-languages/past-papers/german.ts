
import { PastPaper } from '@/types/athro';

export const germanPastPapers: PastPaper[] = [
  {
    id: 'g22-3850u10-1',
    subject: 'German',
    unit: '1',
    title: 'Speaking and Writing',
    examBoard: 'wjec',
    year: '2022',
    season: 'Summer',
    questions: [
      {
        id: 'g22-3850u10-1-q1',
        topic: 'Personal Information',
        subtopic: 'Family',
        text: 'Beschreiben Sie Ihre Familie und was Sie zusammen machen.',
        marks: 10,
        difficulty: 2
      },
      {
        id: 'g22-3850u10-1-q2',
        topic: 'Travel',
        subtopic: 'Holiday',
        text: 'Schreiben Sie über Ihren letzten Urlaub. Wohin sind Sie gefahren und was haben Sie dort gemacht?',
        marks: 15,
        difficulty: 3
      },
      {
        id: 'g22-3850u10-1-q3',
        topic: 'Environment',
        subtopic: 'Climate Change',
        text: 'Was können wir tun, um die Umwelt zu schützen? Geben Sie Ihre Meinung.',
        marks: 15,
        difficulty: 4
      }
    ]
  },
  {
    id: 'g21-3850u20-1',
    subject: 'German',
    unit: '2',
    title: 'Reading and Listening',
    examBoard: 'wjec',
    year: '2021',
    season: 'Summer',
    questions: [
      {
        id: 'g21-3850u20-1-q1',
        topic: 'Comprehension',
        subtopic: 'Daily Life',
        text: 'Lesen Sie den Text über das tägliche Leben in Deutschland und beantworten Sie die folgenden Fragen.',
        marks: 15,
        difficulty: 3
      },
      {
        id: 'g21-3850u20-1-q2',
        topic: 'Grammar',
        subtopic: 'Cases',
        text: 'Ergänzen Sie den Text mit den richtigen Artikeln im Dativ oder Akkusativ.',
        marks: 10,
        difficulty: 4
      }
    ]
  }
];
