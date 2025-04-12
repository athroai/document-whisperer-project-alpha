
import { AthroMessage } from '@/types/athro';
import { pastPapers, PastPaper, PastPaperQuestion } from '@/data/athro-maths/past-papers';
import { modelAnswers, ModelAnswer } from '@/data/athro-maths/model-answers';

export async function mockAthroResponse(
  message: string, 
  subject: string,
  examBoard: string = 'wjec'
): Promise<AthroMessage> {
  // Mock delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Check if the message matches any past paper questions
  const questionMatch = findMatchingQuestion(message);
  
  let content = '';
  let referencedResources: string[] = [];
  
  if (questionMatch) {
    // If we have a matching question, use its model answer
    const answer = findModelAnswer(questionMatch.id);
    
    if (answer) {
      content = `I can help with this ${questionMatch.topic} question.\n\n${formatWorkingSteps(answer.workingSteps)}\n\nThe final answer is: ${answer.markScheme}`;
      referencedResources = [questionMatch.id];
    } else {
      content = generateSubjectResponse(message, subject);
    }
  } else {
    content = generateSubjectResponse(message, subject);
  }
  
  return {
    id: Date.now().toString(),
    senderId: `athro-${subject.toLowerCase()}`,
    content,
    timestamp: new Date().toISOString(),
    referencedResources
  };
}

function findMatchingQuestion(message: string): PastPaperQuestion | null {
  // Very basic matching logic - in a real implementation this would be much more sophisticated
  const lowerMessage = message.toLowerCase();
  
  for (const paper of pastPapers) {
    for (const question of paper.questions) {
      // Check if significant parts of the question text appear in the message
      const keywords = question.text.toLowerCase().split(' ')
        .filter(word => word.length > 3) // Only match on significant words
        .filter(word => !['what', 'find', 'calculate', 'solve', 'work', 'out'].includes(word));
      
      const matchCount = keywords.filter(word => lowerMessage.includes(word)).length;
      const matchThreshold = Math.ceil(keywords.length * 0.6); // 60% match threshold
      
      if (matchCount >= matchThreshold) {
        return question;
      }
    }
  }
  
  return null;
}

function findModelAnswer(questionId: string): ModelAnswer | undefined {
  return modelAnswers.find(answer => answer.questionId === questionId);
}

function formatWorkingSteps(steps: string[]): string {
  return steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
}

function generateSubjectResponse(message: string, subject: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (subject === 'Mathematics') {
    if (lowerMessage.includes('algebra') || lowerMessage.includes('equation') || lowerMessage.includes('solve')) {
      return "Algebra is all about finding unknown values. Let's tackle this step-by-step. Could you share the specific equation you're working on?";
    }
    
    if (lowerMessage.includes('geometry') || lowerMessage.includes('circle') || lowerMessage.includes('triangle') || lowerMessage.includes('angle')) {
      return "Geometry problems are best approached by identifying what we know and what we need to find. Let's break down this question together.";
    }
    
    if (lowerMessage.includes('statistics') || lowerMessage.includes('mean') || lowerMessage.includes('median') || lowerMessage.includes('mode')) {
      return "Statistics involves analyzing and interpreting data. For this problem, we need to understand which measure of central tendency is most appropriate.";
    }
    
    return "I'm your mathematics mentor. Could you provide more details about your maths question? It helps me to see the specific problem you're working on.";
  }
  
  return `I'm your ${subject} mentor. How can I help you today?`;
}

export async function getPastPapers(subject: string, examBoard?: string): Promise<PastPaper[]> {
  // Mock delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // In a real implementation, this would filter from a database
  if (examBoard) {
    return pastPapers.filter(paper => paper.examBoard === examBoard.toLowerCase());
  }
  
  return pastPapers;
}

export async function getModelAnswer(questionId: string): Promise<ModelAnswer | null> {
  // Mock delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const answer = modelAnswers.find(a => a.questionId === questionId);
  return answer || null;
}
