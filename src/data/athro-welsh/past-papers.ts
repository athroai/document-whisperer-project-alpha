
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
    title: 'Cymraeg Ail Iaith Uned 1',
    questions: [
      {
        id: 's22-3020u10-1-q1',
        number: 1,
        text: 'Darllenwch y darn ac atebwch y cwestiynau yn Gymraeg. (Read the passage and answer the questions in Welsh.)',
        marks: 10,
        topic: 'Reading Comprehension'
      },
      {
        id: 's22-3020u10-1-q2',
        number: 2,
        text: 'Ysgrifennwch e-bost at eich ffrind yn disgrifio eich gwyliau. (Write an email to your friend describing your holiday.)',
        marks: 15,
        topic: 'Writing'
      },
      {
        id: 's22-3020u10-1-q3',
        number: 3,
        text: 'Cyfieithwch y brawddegau canlynol o\'r Saesneg i\'r Gymraeg. (Translate the following sentences from English to Welsh.)',
        marks: 10,
        topic: 'Translation'
      }
    ]
  },
  {
    id: 's21-3020u20-1',
    subject: 'Welsh',
    examBoard: 'wjec',
    year: 2021,
    season: 'summer',
    unit: 2,
    title: 'Cymraeg Ail Iaith Uned 2',
    questions: [
      {
        id: 's21-3020u20-1-q1',
        number: 1,
        text: 'Gwrandewch ar y sgwrs ac atebwch y cwestiynau yn Gymraeg. (Listen to the conversation and answer the questions in Welsh.)',
        marks: 10,
        topic: 'Listening'
      },
      {
        id: 's21-3020u20-1-q2',
        number: 2,
        text: 'Ysgrifennwch erthygl am yr amgylchedd ar gyfer cylchgrawn ysgol. (Write an article about the environment for a school magazine.)',
        marks: 15,
        topic: 'Writing'
      }
    ]
  }
];

export default welshPastPapers;
