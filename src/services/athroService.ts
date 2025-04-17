
// Improved version of the athroService with proper typing
import { AthroSubject } from '@/types/athro';

export interface Resource {
  id: string;
  name: string;
  type: string;
  url?: string;
  subject?: string;
}

export const getResourcesForSubject = (subject: string): string[] => {
  // This function now returns string IDs of resources as expected
  const resources: Resource[] = [
    { id: '1', name: 'Sample Resource 1', type: 'pdf', subject },
    { id: '2', name: 'Sample Resource 2', type: 'pdf', subject },
    { id: '3', name: 'Sample Resource 3', type: 'pdf', subject }
  ];
  
  // Return just the IDs as strings to match expected string[] return type
  return resources.map(resource => resource.id);
};

export const getResourceById = (id: string): Resource | undefined => {
  const resources: Resource[] = [
    { id: '1', name: 'Sample Resource 1', type: 'pdf', url: '/resources/sample1.pdf' },
    { id: '2', name: 'Sample Resource 2', type: 'pdf', url: '/resources/sample2.pdf' },
    { id: '3', name: 'Sample Resource 3', type: 'pdf', url: '/resources/sample3.pdf' }
  ];
  
  return resources.find(resource => resource.id === id);
};

export const getSubjects = (): AthroSubject[] => {
  return [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Geography'
  ];
};

export const getTopicsForSubject = (subject: AthroSubject): string[] => {
  const topicMap: Record<string, string[]> = {
    'Mathematics': ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry'],
    'Science': ['Biology', 'Chemistry', 'Physics', 'Environmental Science'],
    'English': ['Literature', 'Grammar', 'Writing', 'Reading Comprehension'],
    'History': ['Ancient History', 'World War II', 'Medieval Times', 'Modern History'],
    'Geography': ['Physical Geography', 'Human Geography', 'Cartography']
  };
  
  return topicMap[subject] || [];
};

// Function to get study plans for a user
export const getStudyPlansForUser = async (userId: string) => {
  try {
    // In a real implementation, this would fetch from an API or database
    return [
      {
        id: '1',
        name: 'GCSE Mathematics Revision',
        subjects: ['Mathematics'],
        createdAt: new Date(),
        sessions: [
          {
            id: '101',
            subject: 'Mathematics',
            topic: 'Algebra',
            scheduledFor: new Date(),
            duration: 60
          }
        ]
      }
    ];
  } catch (error) {
    console.error('Error fetching study plans:', error);
    return [];
  }
};
