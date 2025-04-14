
import { ModelAnswer } from '@/types/athro';

export const spanishModelAnswers: ModelAnswer[] = [
  {
    id: 's22-3810u10-1-q1',
    question: 'Describe tu familia y tus relaciones con los diferentes miembros.',
    grade: 'A',
    answer: "Voy a describir mi familia y mis relaciones con los diferentes miembros.",
    workingSteps: [
      'Comienza con una introducción a tu familia',
      'Describe a cada miembro de tu familia (padres, hermanos)',
      'Explica tus relaciones con cada uno',
      'Usa adjetivos variados para describir las personalidades',
      'Menciona actividades que hacen juntos'
    ],
    markScheme: 'Las respuestas deben incluir: terminología apropiada para los miembros de la familia, adjetivos variados, verbos correctamente conjugados en presente, estructura clara con introducción y conclusión, mínimo 100 palabras.',
    marks: 10,
    latexNotation: '',
    translation: 'En mi familia hay cuatro personas: mi padre, mi madre, mi hermano y yo. Mi padre se llama Juan, tiene 46 años y es ingeniero. Mi madre se llama María, tiene 44 años y es médica. Mi hermano se llama Carlos, tiene 18 años y es estudiante de ciencias. Me llevo bien con toda mi familia, pero soy particularmente cercano a mi hermano.',
    grammarExplanation: 'Esta respuesta utiliza correctamente los adjetivos posesivos (mi, mis), los verbos en presente del indicativo (es, tiene, se llama), y la estructura "hay" para presentar una lista.',
    culturalNote: 'En España y Latinoamérica, las relaciones familiares son muy importantes, y es común que los miembros de la familia mantengan contacto cercano a lo largo de sus vidas.'
  },
  {
    id: 's22-3810u10-1-q2',
    question: 'Describe tu rutina diaria.',
    grade: 'A',
    answer: "Voy a describir mi rutina diaria y lo que hago normalmente durante la semana.",
    workingSteps: [
      'Describe tu rutina matutina',
      'Explica tu horario escolar o laboral',
      'Menciona actividades después de la escuela o el trabajo',
      'Describe qué haces por las noches',
      'Explica cómo es diferente el fin de semana'
    ],
    markScheme: 'Las respuestas deben incluir: verbos reflexivos utilizados correctamente, adverbios de tiempo y frecuencia, frases con "soler + infinitivo", vocabulario relacionado con actividades cotidianas, mínimo 120 palabras.',
    marks: 12,
    latexNotation: '',
    translation: 'Normalmente me despierto a las siete de la mañana. Me ducho, me visto y desayuno antes de ir al instituto. Las clases empiezan a las ocho y media y terminan a las tres. Después de clase, suelo hacer deporte o quedar con mis amigos. Por la noche, ceno con mi familia y luego hago los deberes. Los fines de semana son diferentes porque me levanto más tarde y tengo más tiempo libre.',
    grammarExplanation: 'Esta respuesta utiliza correctamente los verbos reflexivos (me despierto, me ducho), expresiones de tiempo (a las siete, después de), y la estructura "soler + infinitivo" para expresar hábitos.',
    culturalNote: 'En España, el horario diario es diferente al de muchos países anglosajones, con la comida principal al mediodía y una cena más ligera por la noche, normalmente bastante tarde.'
  }
];

export default spanishModelAnswers;
