
import { PastPaper } from '@/types/athro';

export const frenchPastPapers: PastPaper[] = [
  {
    id: 'f22-3800u10-1',
    subject: 'French',
    unit: '1',
    title: 'Speaking and Writing',
    examBoard: 'wjec',
    year: 2022, // Changed from string to number
    season: 'summer', // Changed to lowercase
    questions: [
      {
        id: 'f22-3800u10-1-q1',
        topic: 'Personal Information',
        subtopic: 'Family',
        text: 'Décrivez votre famille et parlez de vos relations avec les différents membres.',
        marks: 10,
        difficulty: 'medium' // Changed from number to string
      },
      {
        id: 'f22-3800u10-1-q2',
        topic: 'Interests',
        subtopic: 'Hobbies',
        text: 'Qu\'est-ce que vous aimez faire pendant votre temps libre et pourquoi?',
        marks: 12,
        difficulty: 'medium' // Changed from number to string
      },
      {
        id: 'f22-3800u10-1-q3',
        topic: 'Education',
        subtopic: 'School Life',
        text: 'Parlez de votre vie scolaire et de vos projets pour l\'avenir.',
        marks: 15,
        difficulty: 'hard' // Changed from number to string
      }
    ]
  },
  {
    id: 'f21-3800u20-1',
    subject: 'French',
    unit: '2',
    title: 'Reading and Listening',
    examBoard: 'wjec',
    year: 2021, // Changed from string to number
    season: 'summer', // Changed to lowercase
    questions: [
      {
        id: 'f21-3800u20-1-q1',
        topic: 'Comprehension',
        subtopic: 'Daily Life',
        text: 'Lisez le texte sur la vie quotidienne en France et répondez aux questions suivantes.',
        marks: 15,
        difficulty: 'medium' // Changed from number to string
      },
      {
        id: 'f21-3800u20-1-q2',
        topic: 'Vocabulary',
        subtopic: 'Food and Drink',
        text: 'Complétez le texte avec les mots appropriés concernant la nourriture et les boissons.',
        marks: 10,
        difficulty: 'easy' // Changed from number to string
      }
    ]
  }
];
