
import { ModelAnswer } from '@/types/athro';

export const frenchModelAnswers: ModelAnswer[] = [
  {
    id: 'f22-3800u10-1-q1', // Added id field
    questionId: 'f22-3800u10-1-q1',
    answer: "Dans ma famille, il y a quatre personnes. Je vais décrire chaque membre et nos relations.", // Added answer field
    workingSteps: [
      'Commencez par une introduction de votre famille',
      'Décrivez chaque membre de votre famille (parents, frères/sœurs)',
      'Expliquez vos relations avec chacun',
      'Utilisez des adjectifs variés pour décrire les personnalités',
      'Mentionnez des activités que vous faites ensemble'
    ],
    markScheme: 'Les réponses doivent inclure: terminologie appropriée pour les membres de la famille, adjectifs variés, verbes correctement conjugués au présent, structure claire avec introduction et conclusion, minimum 100 mots.',
    marks: 10,
    latexNotation: '',
    translation: 'Dans ma famille, il y a quatre personnes: mon père, ma mère, ma sœur et moi. Mon père s\'appelle Pierre, il a 45 ans et il est médecin. Ma mère s\'appelle Marie, elle a 43 ans et elle est professeur. Ma sœur s\'appelle Sophie, elle a 20 ans et elle est étudiante en droit. Je m\'entends bien avec toute ma famille, mais je suis particulièrement proche de ma sœur.',
    grammarExplanation: 'Cette réponse utilise correctement les adjectifs possessifs (mon, ma), les verbes au présent de l\'indicatif (est, a, s\'appelle), et la structure "il y a" pour présenter une liste.',
    culturalNote: 'En France, les relations familiales sont importantes, et il est courant que les membres de la famille restent proches tout au long de leur vie.'
  },
  {
    id: 'f22-3800u10-1-q2', // Added id field
    questionId: 'f22-3800u10-1-q2',
    answer: "Je vais décrire mes passe-temps préférés et expliquer pourquoi je les apprécie.", // Added answer field
    workingSteps: [
      'Présentez vos passe-temps préférés',
      'Expliquez pourquoi vous aimez ces activités',
      'Mentionnez quand vous les pratiquez',
      'Utilisez des expressions pour montrer l\'enthousiasme',
      'Concluez en mentionnant une nouvelle activité que vous aimeriez essayer'
    ],
    markScheme: 'Les réponses doivent inclure: vocabulaire varié des loisirs, expressions d\'opinion, adverbes de fréquence, verbes correctement conjugués, minimum 120 mots.',
    marks: 12,
    latexNotation: '',
    translation: 'Pendant mon temps libre, j\'aime beaucoup faire du sport et lire. Je joue au football deux fois par semaine dans un club local, et j\'aime cela parce que c\'est un sport d\'équipe qui me permet de rencontrer des amis. Le weekend, je lis souvent des romans d\'aventure car cela me permet de m\'évader. Je regarde aussi des films en français pour améliorer mon niveau de langue. À l\'avenir, j\'aimerais essayer l\'escalade car cela semble excitant.',
    grammarExplanation: 'Cette réponse utilise bien les expressions de fréquence (deux fois par semaine, souvent), les verbes d\'opinion (aimer, préférer) et le conditionnel pour exprimer un souhait futur (j\'aimerais).',
    culturalNote: 'Les activités de plein air sont très populaires en France, notamment dans le sud où le climat méditerranéen permet de profiter de l\'extérieur toute l\'année.'
  }
];
