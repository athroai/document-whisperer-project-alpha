
import { ModelAnswer } from '@/types/athro';

export const germanModelAnswers: ModelAnswer[] = [
  {
    id: 'g22-3850u10-1-q1', // Added id field
    questionId: 'g22-3850u10-1-q1',
    answer: "Ich werde meine Familie beschreiben und erklären, was wir zusammen machen.", // Added answer field
    workingSteps: [
      'Beginnen Sie mit einer Einleitung zu Ihrer Familie',
      'Beschreiben Sie jeden Familienangehörigen (Eltern, Geschwister)',
      'Erklären Sie, was Sie zusammen machen',
      'Verwenden Sie verschiedene Adjektive, um Persönlichkeiten zu beschreiben',
      'Erwähnen Sie besondere Familientraditionen'
    ],
    markScheme: 'Die Antworten sollten Folgendes enthalten: angemessene Terminologie für Familienmitglieder, verschiedene Adjektive, korrekt konjugierte Verben im Präsens, klare Struktur mit Einleitung und Schluss, mindestens 100 Wörter.',
    marks: 10,
    latexNotation: '',
    translation: 'In meiner Familie gibt es vier Personen: meinen Vater, meine Mutter, meinen Bruder und mich. Mein Vater heißt Hans, er ist 47 Jahre alt und arbeitet als Ingenieur. Meine Mutter heißt Anna, sie ist 45 Jahre alt und ist Lehrerin. Mein Bruder heißt Max, er ist 15 Jahre alt und geht noch zur Schule. Am Wochenende machen wir oft Ausflüge oder kochen zusammen. Jeden Sonntag besuchen wir meine Großeltern zum Mittagessen.',
    grammarExplanation: 'Diese Antwort verwendet korrekt die Possessivpronomen (mein, meine, meinen), Verben im Präsens (gibt, ist, heißt, arbeitet) und die Akkusativform nach der Präposition "für".',
    culturalNote: 'In Deutschland ist das gemeinsame Sonntagsessen eine wichtige Familientradition, die viele Familien zusammenbringt.'
  },
  {
    id: 'g22-3850u10-1-q2', // Added id field
    questionId: 'g22-3850u10-1-q2',
    answer: "Ich werde über meinen letzten Urlaub in Bayern berichten.", // Added answer field
    workingSteps: [
      'Erwähnen Sie, wohin Sie in den Urlaub gefahren sind',
      'Beschreiben Sie, wie Sie dorthin gereist sind',
      'Erklären Sie, wo Sie übernachtet haben',
      'Listen Sie die Aktivitäten auf, die Sie unternommen haben',
      'Geben Sie Ihre Meinung zum Urlaub'
    ],
    markScheme: 'Die Antworten sollten Folgendes enthalten: Vergangenheitsformen (Perfekt/Präteritum), Ortsangaben, Reisevokabular, Aktivitätsbeschreibungen, persönliche Meinung, mindestens 150 Wörter.',
    marks: 15,
    latexNotation: '',
    translation: 'Letzten Sommer bin ich mit meiner Familie nach Bayern gefahren. Wir sind mit dem Auto gefahren und die Reise hat ungefähr vier Stunden gedauert. Wir haben in einem gemütlichen Hotel in der Nähe der Alpen übernachtet. Während des Urlaubs haben wir viele Aktivitäten gemacht. Wir sind gewandert, haben Schloss Neuschwanstein besichtigt und sind im Königssee geschwommen. Das Wetter war meistens sonnig, aber an einem Tag hat es geregnet. Der Urlaub war fantastisch und ich würde gerne wieder nach Bayern fahren.',
    grammarExplanation: 'Diese Antwort verwendet korrekt das Perfekt mit verschiedenen Hilfsverben (sein, haben), Präpositionen mit Dativ (mit, in, nach) und den Konjunktiv II für den Wunsch (würde).',
    culturalNote: 'Bayern ist eines der beliebtesten Urlaubsziele innerhalb Deutschlands, bekannt für seine Alpenlandschaft, traditionelle Kultur und historische Schlösser wie Neuschwanstein.'
  }
];
