
import { PastPaper, PastPaperQuestion } from '@/data/athro-maths/past-papers';

// Sample Welsh past papers following the same structure as Math past papers
export const welshPastPapers: PastPaper[] = [
  {
    id: 's22-3020u10-1',
    subject: 'Welsh',
    examBoard: 'wjec',
    year: 2022,
    season: 'summer',
    unit: 1,
    title: 'Welsh Second Language Unit 1: Oral',
    questions: [
      {
        id: 's22-3020u10-1-q1',
        number: 1,
        text: 'Siaradwch am eich teulu a\'ch ffrindiau. (Talk about your family and friends.)',
        marks: 10,
        topic: 'Oral Expression',
        subtopic: 'Personal Relationships',
        difficulty: 2
      },
      {
        id: 's22-3020u10-1-q2',
        number: 2,
        text: 'Beth ydych chi\'n hoffi gwneud yn eich amser hamdden? (What do you like to do in your free time?)',
        marks: 10,
        topic: 'Oral Expression',
        subtopic: 'Leisure Activities',
        difficulty: 2
      },
      {
        id: 's22-3020u10-1-q3',
        number: 3,
        text: 'Disgrifiwch eich ardal leol. Beth yw\'r pethau da a drwg am fyw yno? (Describe your local area. What are the good and bad things about living there?)',
        marks: 15,
        topic: 'Oral Expression',
        subtopic: 'Local Area',
        difficulty: 3
      }
    ]
  },
  {
    id: 's22-3020u20-1',
    subject: 'Welsh',
    examBoard: 'wjec',
    year: 2022,
    season: 'summer',
    unit: 2,
    title: 'Welsh Second Language Unit 2: Reading and Writing',
    questions: [
      {
        id: 's22-3020u20-1-q1',
        number: 1,
        text: 'Darllenwch y testun am yr amgylchedd a atebwch y cwestiynau. (Read the text about the environment and answer the questions.)',
        marks: 15,
        topic: 'Reading Comprehension',
        subtopic: 'Environment',
        difficulty: 3
      },
      {
        id: 's22-3020u20-1-q2',
        number: 2,
        text: 'Ysgrifennwch erthygl am bwysigrwydd dysgu ieithoedd tramor. (Write an article about the importance of learning foreign languages.)',
        marks: 20,
        topic: 'Writing',
        subtopic: 'Languages',
        difficulty: 4
      }
    ]
  }
];

export default welshPastPapers;
