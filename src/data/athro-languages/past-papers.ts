
import { PastPaper, PastPaperQuestion } from '@/data/athro-maths/past-papers';

// Sample Languages past papers following the same structure as Math past papers
export const languagesPastPapers: PastPaper[] = [
  {
    id: 's22-3800u10-1',
    subject: 'French',
    examBoard: 'wjec',
    year: 2022,
    season: 'summer',
    unit: 1,
    title: 'French Unit 1: Speaking',
    questions: [
      {
        id: 's22-3800u10-1-q1',
        number: 1,
        text: 'Présentez-vous et parlez de votre famille. (Introduce yourself and talk about your family.)',
        marks: 10,
        topic: 'Speaking'
      },
      {
        id: 's22-3800u10-1-q2',
        number: 2,
        text: 'Décrivez vos passe-temps préférés. (Describe your favorite hobbies.)',
        marks: 10,
        topic: 'Speaking'
      },
      {
        id: 's22-3800u10-1-q3',
        number: 3,
        text: 'Parlez de vos projets pour l\'avenir. (Talk about your plans for the future.)',
        marks: 10,
        topic: 'Speaking'
      }
    ]
  },
  {
    id: 's22-3810u10-1',
    subject: 'Spanish',
    examBoard: 'wjec',
    year: 2022,
    season: 'summer',
    unit: 1,
    title: 'Spanish Unit 1: Reading',
    questions: [
      {
        id: 's22-3810u10-1-q1',
        number: 1,
        text: 'Lee el texto y contesta las preguntas. (Read the text and answer the questions.)',
        marks: 15,
        topic: 'Reading'
      },
      {
        id: 's22-3810u10-1-q2',
        number: 2,
        text: 'Traduce el siguiente párrafo al inglés. (Translate the following paragraph into English.)',
        marks: 10,
        topic: 'Translation'
      }
    ]
  },
  {
    id: 's22-3820u10-1',
    subject: 'German',
    examBoard: 'wjec',
    year: 2022,
    season: 'summer',
    unit: 1,
    title: 'German Unit 1: Writing',
    questions: [
      {
        id: 's22-3820u10-1-q1',
        number: 1,
        text: 'Schreiben Sie einen Brief an Ihren Freund über Ihre letzte Reise. (Write a letter to your friend about your last trip.)',
        marks: 15,
        topic: 'Writing'
      },
      {
        id: 's22-3820u10-1-q2',
        number: 2,
        text: 'Schreiben Sie einen Aufsatz zum Thema "Umweltschutz". (Write an essay on the topic of "Environmental Protection".)',
        marks: 20,
        topic: 'Writing'
      }
    ]
  }
];

export default languagesPastPapers;
