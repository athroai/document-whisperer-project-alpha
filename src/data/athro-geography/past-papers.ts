
import { PastPaper, PastPaperQuestion } from '@/data/athro-maths/past-papers';

// Sample Geography past papers following the same structure as Math past papers
export const geographyPastPapers: PastPaper[] = [
  {
    id: 's22-3110u10-1',
    subject: 'Geography',
    examBoard: 'wjec',
    year: 2022,
    season: 'summer',
    unit: 1,
    title: 'Geography Unit 1: Physical Geography',
    questions: [
      {
        id: 's22-3110u10-1-q1',
        number: 1,
        text: 'Explain how river processes create meanders and oxbow lakes.',
        marks: 8,
        topic: 'Rivers and River Management',
        subtopic: 'River Landforms',
        difficulty: 3
      },
      {
        id: 's22-3110u10-1-q2',
        number: 2,
        text: 'Using a named example, evaluate the effectiveness of strategies used to manage coastal erosion.',
        marks: 10,
        topic: 'Coastal Processes and Management',
        subtopic: 'Coastal Defense',
        difficulty: 4
      },
      {
        id: 's22-3110u10-1-q3',
        number: 3,
        text: 'Examine the causes and effects of a recent volcanic eruption you have studied.',
        marks: 15,
        topic: 'Tectonic Processes and Landforms',
        subtopic: 'Volcanic Activity',
        difficulty: 4
      }
    ]
  },
  {
    id: 's22-3110u20-1',
    subject: 'Geography',
    examBoard: 'wjec',
    year: 2022,
    season: 'summer',
    unit: 2,
    title: 'Geography Unit 2: Human Geography',
    questions: [
      {
        id: 's22-3110u20-1-q1',
        number: 1,
        text: 'Study Figure 1, which shows population growth in selected countries. Describe the trends shown in the graph.',
        marks: 6,
        topic: 'Population and Migration',
        subtopic: 'Demographic Change',
        difficulty: 2
      },
      {
        id: 's22-3110u20-1-q2',
        number: 2,
        text: 'Explain the causes of rural-urban migration in a developing country you have studied.',
        marks: 10,
        topic: 'Population and Migration',
        subtopic: 'Migration Patterns',
        difficulty: 3
      },
      {
        id: 's22-3110u20-1-q3',
        number: 3,
        text: '"The benefits of tourism outweigh the costs for developing countries." Discuss this statement with reference to examples you have studied.',
        marks: 15,
        topic: 'Tourism',
        subtopic: 'Tourism Impacts',
        difficulty: 5
      }
    ]
  }
];

export default geographyPastPapers;
