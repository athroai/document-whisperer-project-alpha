
import { PastPaper } from '@/types/athro';

export const spanishPastPapers: PastPaper[] = [
  {
    id: 's22-3810u10-1',
    subject: 'Languages',
    unit: '1',
    title: 'Speaking and Writing',
    examBoard: 'WJEC',
    year: 2022,
    season: 'Summer',
    questions: [
      {
        id: 's22-3810u10-1-q1',
        topic: 'Personal Information',
        subtopic: 'Family',
        text: 'Describe a tu familia y habla de tus relaciones con los diferentes miembros.',
        marks: 10,
        difficulty: 'easy' 
      },
      {
        id: 's22-3810u10-1-q2',
        topic: 'Lifestyle',
        subtopic: 'Daily Routine',
        text: '¿Cómo es tu rutina diaria? ¿Qué haces normalmente durante la semana?',
        marks: 12,
        difficulty: 'easy'
      },
      {
        id: 's22-3810u10-1-q3',
        topic: 'Culture',
        subtopic: 'Festivals',
        text: 'Describe una fiesta o celebración importante en España o Latinoamérica. ¿Por qué es importante?',
        marks: 15,
        difficulty: 'hard'
      }
    ],
    fileUrl: '/papers/spanish/s22-3810u10-1.pdf',
    markSchemeUrl: '/papers/spanish/s22-3810u10-1-ms.pdf'
  },
  {
    id: 's21-3810u20-1',
    subject: 'Languages',
    unit: '2',
    title: 'Reading and Listening',
    examBoard: 'WJEC',
    year: 2021,
    season: 'Summer',
    questions: [
      {
        id: 's21-3810u20-1-q1',
        topic: 'Comprehension',
        subtopic: 'Travel',
        text: 'Lee el texto sobre viajes a Latinoamérica y contesta las siguientes preguntas.',
        marks: 15,
        difficulty: 'medium'
      },
      {
        id: 's21-3810u20-1-q2',
        topic: 'Vocabulary',
        subtopic: 'Shopping',
        text: 'Completa el texto con las palabras apropiadas relacionadas con las compras.',
        marks: 10,
        difficulty: 'easy'
      }
    ],
    fileUrl: '/papers/spanish/s21-3810u20-1.pdf',
    markSchemeUrl: '/papers/spanish/s21-3810u20-1-ms.pdf'
  }
];

export default spanishPastPapers;
