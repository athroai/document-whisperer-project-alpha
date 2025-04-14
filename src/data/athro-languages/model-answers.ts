
import { ModelAnswer } from '@/types/athro';

// Sample Languages model answers
export const languagesModelAnswers: ModelAnswer[] = [
  {
    id: 's22-3800u10-1-q1',
    questionId: 's22-3800u10-1-q1',
    text: "Je vais décrire ma famille et mes relations avec les différents membres.",
    workingSteps: [
      'Start with a greeting: "Bonjour, je m\'appelle..."',
      'Mention your age: "J\'ai ... ans."',
      'Describe your family members: "Dans ma famille, il y a..."',
      'Mention their occupations: "Mon père est... / Ma mère est..."',
      'Describe personality traits: "Mon frère est..."'
    ],
    markScheme: 'A complete answer should include a proper introduction with name and age, accurate description of family structure using appropriate vocabulary, correct use of possessive adjectives, accurate verb conjugation, and proper sentence structure. Aim to include at least three family members with descriptions.',
    marks: 10,
    grade: 'A',
    latexNotation: ''
  },
  {
    id: 's22-3810u10-1-q1',
    questionId: 's22-3810u10-1-q1',
    text: "Voy a leer el texto detenidamente y responder a las preguntas.",
    workingSteps: [
      'First read the entire text to understand the main idea',
      'Look for key vocabulary and cognates',
      'Identify the information being requested in each question',
      'Extract specific details from the text',
      'Form complete answers using information from the text'
    ],
    markScheme: 'Full marks require demonstrating comprehension of the text through accurate answers that include relevant details. Answers should be in complete sentences with correct grammar and spelling where required. Include direct evidence from the text to support your answers.',
    marks: 15,
    grade: 'A',
    latexNotation: ''
  }
];

export default languagesModelAnswers;
