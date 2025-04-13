
import { PastPaper, PastPaperQuestion } from '@/data/athro-maths/past-papers';

// Sample RE past papers following the same structure as Math past papers
export const rePastPapers: PastPaper[] = [
  {
    id: 's22-3120u10-1',
    subject: 'Religious Education',
    examBoard: 'wjec',
    year: 2022,
    season: 'summer',
    unit: '1',
    title: 'RE Unit 1: Religion and Philosophical Themes',
    questions: [
      {
        id: 's22-3120u10-1-q1',
        number: 1,
        text: 'Explain the importance of the Five Pillars in Islam.',
        marks: 8,
        topic: 'Islam',
        subtopic: 'Five Pillars',
        difficulty: 3
      },
      {
        id: 's22-3120u10-1-q2',
        number: 2,
        text: 'Describe the role of Jesus as the Son of God in Christian belief.',
        marks: 10,
        topic: 'Christianity',
        subtopic: 'Jesus Christ',
        difficulty: 3
      },
      {
        id: 's22-3120u10-1-q3',
        number: 3,
        text: '"Religious believers should not eat meat." Evaluate this statement with reference to religious teachings.',
        marks: 15,
        topic: 'Ethics',
        subtopic: 'Diet and Food',
        difficulty: 4
      }
    ]
  },
  {
    id: 's22-3120u20-1',
    subject: 'Religious Education',
    examBoard: 'wjec',
    year: 2022,
    season: 'summer',
    unit: '2',
    title: 'RE Unit 2: Religion and Ethical Themes',
    questions: [
      {
        id: 's22-3120u20-1-q1',
        number: 1,
        text: 'Explain religious teachings about the sanctity of life.',
        marks: 10,
        topic: 'Ethics',
        subtopic: 'Sanctity of Life',
        difficulty: 3
      },
      {
        id: 's22-3120u20-1-q2',
        number: 2,
        text: 'Outline Buddhist teachings on suffering (dukkha).',
        marks: 8,
        topic: 'Buddhism',
        subtopic: 'Four Noble Truths',
        difficulty: 3
      },
      {
        id: 's22-3120u20-1-q3',
        number: 3,
        text: '"Religious teachings on wealth and poverty are no longer relevant in the modern world." Discuss this statement.',
        marks: 15,
        topic: 'Ethics',
        subtopic: 'Wealth and Poverty',
        difficulty: 5
      }
    ]
  }
];

export default rePastPapers;
