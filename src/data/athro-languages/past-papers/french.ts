
import { PastPaper } from '@/types/athro';

export const frenchPastPapers: PastPaper[] = [
  {
    id: 'f22-3800u10-1',
    subject: 'Languages',  // Changed from 'French' to match our AthroSubject type
    unit: '1',
    title: 'Speaking and Writing',
    examBoard: 'WJEC',  // Changed from lowercase to uppercase
    year: 2022,  
    season: 'Summer',  // Changed from lowercase to uppercase
    questions: [
      {
        id: 'f22-3800u10-1-q1',
        topic: 'Personal Information',
        subtopic: 'Family',
        text: 'Décrivez votre famille et parlez de vos relations avec les différents membres.',
        marks: 10,
        difficulty: 'medium'
      },
      {
        id: 'f22-3800u10-1-q2',
        topic: 'Interests',
        subtopic: 'Hobbies',
        text: 'Qu\'est-ce que vous aimez faire pendant votre temps libre et pourquoi?',
        marks: 12,
        difficulty: 'medium'
      },
      {
        id: 'f22-3800u10-1-q3',
        topic: 'Education',
        subtopic: 'School Life',
        text: 'Parlez de votre vie scolaire et de vos projets pour l\'avenir.',
        marks: 15,
        difficulty: 'hard'
      }
    ],
    fileUrl: '/papers/french/f22-3800u10-1.pdf',
    markSchemeUrl: '/papers/french/f22-3800u10-1-ms.pdf'
  },
  {
    id: 'f21-3800u20-1',
    subject: 'Languages',  // Changed from 'French' to match our AthroSubject type
    unit: '2',
    title: 'Reading and Listening',
    examBoard: 'WJEC',  // Changed from lowercase to uppercase
    year: 2021,
    season: 'Summer',  // Changed from lowercase to uppercase
    questions: [
      {
        id: 'f21-3800u20-1-q1',
        topic: 'Comprehension',
        subtopic: 'Daily Life',
        text: 'Lisez le texte sur la vie quotidienne en France et répondez aux questions suivantes.',
        marks: 15,
        difficulty: 'medium'
      },
      {
        id: 'f21-3800u20-1-q2',
        topic: 'Vocabulary',
        subtopic: 'Food and Drink',
        text: 'Complétez le texte avec les mots appropriés concernant la nourriture et les boissons.',
        marks: 10,
        difficulty: 'easy'
      }
    ],
    fileUrl: '/papers/french/f21-3800u20-1.pdf',
    markSchemeUrl: '/papers/french/f21-3800u20-1-ms.pdf'
  }
];

export default frenchPastPapers;
