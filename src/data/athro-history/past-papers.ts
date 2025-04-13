
import { PastPaper, PastPaperQuestion } from '@/data/athro-maths/past-papers';

// Sample History past papers following the same structure as Math past papers
export const historyPastPapers: PastPaper[] = [
  {
    id: 's22-3100u10-1',
    subject: 'History',
    examBoard: 'wjec',
    year: 2022,
    season: 'summer',
    unit: 1,
    title: 'History Unit 1: The Elizabethan Age',
    questions: [
      {
        id: 's22-3100u10-1-q1',
        number: 1,
        text: 'What can be learned from Source A about Elizabeth I\'s relationship with Parliament?',
        marks: 5,
        topic: 'Source Analysis',
        difficulty: 3
      },
      {
        id: 's22-3100u10-1-q2',
        number: 2,
        text: 'How useful are Sources B and C to an historian studying the Spanish Armada?',
        marks: 10,
        topic: 'Source Analysis',
        difficulty: 4
      },
      {
        id: 's22-3100u10-1-q3',
        number: 3,
        text: '"The main reason for Elizabeth I\'s problems with Spain was religious differences." How far do you agree with this statement?',
        marks: 20,
        topic: 'Tudor England',
        difficulty: 5
      }
    ]
  },
  {
    id: 's22-3100u20-1',
    subject: 'History',
    examBoard: 'wjec',
    year: 2022,
    season: 'summer',
    unit: 2,
    title: 'History Unit 2: The USA 1910-1929',
    questions: [
      {
        id: 's22-3100u20-1-q1',
        number: 1,
        text: 'Describe the key features of the economic boom in the USA during the 1920s.',
        marks: 10,
        topic: 'USA 1910-1929',
        difficulty: 3
      },
      {
        id: 's22-3100u20-1-q2',
        number: 2,
        text: 'Explain why Prohibition was introduced in the USA in 1919.',
        marks: 15,
        topic: 'USA 1910-1929',
        difficulty: 4
      },
      {
        id: 's22-3100u20-1-q3',
        number: 3,
        text: '"The main reason for increased racial tensions in the USA during the 1920s was the rise of the Ku Klux Klan." How far do you agree with this statement?',
        marks: 20,
        topic: 'USA 1910-1929',
        difficulty: 5
      }
    ]
  }
];

export default historyPastPapers;
