
import { ModelAnswer } from '@/types/athro';

export const germanModelAnswers: ModelAnswer[] = [
  {
    id: 'g22-3850u10-1-q1',
    question: 'Beschreiben Sie Ihre Familie und was Sie zusammen machen.',
    grade: 'A',
    answer: "Ich werde meine Familie beschreiben und erklären, was wir zusammen machen.",
    workingSteps: [
      'Begin with an introduction about your family',
      'Describe each family member',
      'Explain your relationships with them',
      'Mention activities you do together',
      'Conclude with a general statement about family importance'
    ],
    markScheme: 'A complete answer should include: appropriate family terminology in German, varied adjectives for description, correct verb conjugation, proper sentence structure, at least 100 words.',
    marks: 10,
    latexNotation: '',
    translation: 'In my family there are four people: my father, my mother, my brother and me. My father is called Hans, he is 47 years old and works as an engineer. My mother is called Monika, she is 45 years old and works as a teacher. My brother is called Lukas, he is 20 years old and studies medicine.',
    grammarExplanation: 'This answer correctly uses possessive adjectives (mein, meine), present tense verbs (ist, arbeitet, studiert), and the structure "In meiner Familie gibt es..." to introduce family members.',
    culturalNote: 'In Germany, family relationships are important, although adult children often live independently from their parents.'
  },
  {
    id: 'g22-3850u10-1-q2',
    question: 'Beschreiben Sie Ihren letzten Urlaub.',
    grade: 'A',
    answer: "Ich werde über meinen letzten Urlaub berichten.",
    workingSteps: [
      'Mention when and where you went',
      'Describe your accommodation',
      'Talk about activities you did',
      'Mention the weather',
      'Express your opinion about the holiday'
    ],
    markScheme: 'A complete answer should include: past tense verbs, time expressions, location details, varied vocabulary about activities and accommodation, personal opinions, at least 120 words.',
    marks: 15,
    latexNotation: '',
    translation: 'Last year I went on holiday to Austria with my family. We stayed in a small hotel in the mountains near Salzburg. The weather was very good - sunny and warm every day. During our holiday, we went hiking in the mountains and visited some interesting museums in the city. The food was delicious, especially the Austrian cakes. I really enjoyed this holiday because I love the mountains and nature.',
    grammarExplanation: 'This answer correctly uses the simple past tense (ging, war) and the perfect tense (sind gewandert, haben besucht), prepositions with locations (in den Bergen, in der Stadt), and opinion phrases (Das Essen war köstlich).',
    culturalNote: 'Mountain holidays in Alpine regions like Austria, Switzerland and southern Germany are very popular among German speakers. Hiking is considered an important cultural activity.'
  }
];

export default germanModelAnswers;
