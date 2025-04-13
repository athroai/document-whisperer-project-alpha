
import { PastPaper, PastPaperQuestion } from '@/data/athro-maths/past-papers';

// Sample English past papers following the same structure as Math past papers
export const englishPastPapers: PastPaper[] = [
  {
    id: 's22-3700u10-1',
    subject: 'English',
    examBoard: 'wjec',
    year: 2022,
    season: 'summer',
    unit: 1,
    title: 'English Language Unit 1',
    questions: [
      {
        id: 's22-3700u10-1-q1',
        number: 1,
        text: 'Read lines 1-10 of the extract. How does the writer engage the reader\'s interest in these lines?',
        marks: 5,
        topic: 'Reading Comprehension',
        subtopic: 'Literary Analysis',
        difficulty: 2
      },
      {
        id: 's22-3700u10-1-q2',
        number: 2,
        text: 'How does the writer present their thoughts and feelings about travel in the extract as a whole?',
        marks: 10,
        topic: 'Language Analysis',
        subtopic: 'Authorial Voice',
        difficulty: 3
      },
      {
        id: 's22-3700u10-1-q3',
        number: 3,
        text: '"Travel broadens the mind." Write an essay discussing this statement.',
        marks: 20,
        topic: 'Creative Writing',
        subtopic: 'Essay Writing',
        difficulty: 4
      }
    ]
  },
  {
    id: 's21-3720u10-1',
    subject: 'English',
    examBoard: 'wjec',
    year: 2021,
    season: 'summer',
    unit: 1,
    title: 'English Literature Unit 1',
    questions: [
      {
        id: 's21-3720u10-1-q1',
        number: 1,
        text: 'How does Shakespeare present the character of Macbeth in Act 1 Scene 7?',
        marks: 15,
        topic: 'Shakespeare',
        subtopic: 'Character Analysis',
        difficulty: 4
      },
      {
        id: 's21-3720u10-1-q2',
        number: 2,
        text: 'Explore how the writer presents the theme of isolation in the poem "The Prelude".',
        marks: 15,
        topic: 'Poetry',
        subtopic: 'Thematic Analysis',
        difficulty: 4
      },
      {
        id: 's21-3720u10-1-q3',
        number: 3,
        text: 'How does the writer use language and structure to build tension in the extract from "Jane Eyre"?',
        marks: 20,
        topic: 'Modern Texts',
        subtopic: 'Narrative Techniques',
        difficulty: 5
      }
    ]
  }
];

export default englishPastPapers;
