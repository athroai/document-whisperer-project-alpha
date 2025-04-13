import { AthroMessage } from '@/types/athro';
import { pastPapers, PastPaper, PastPaperQuestion } from '@/data/athro-maths/past-papers';
import { modelAnswers, ModelAnswer } from '@/data/athro-maths/model-answers';

// Import subject-specific past papers and model answers
import englishPastPapers from '@/data/athro-english/past-papers';
import englishModelAnswers from '@/data/athro-english/model-answers';
import welshPastPapers from '@/data/athro-welsh/past-papers';
import welshModelAnswers from '@/data/athro-welsh/model-answers';
import languagesPastPapers from '@/data/athro-languages/past-papers';
import languagesModelAnswers from '@/data/athro-languages/model-answers';
import historyPastPapers from '@/data/athro-history/past-papers';
import historyModelAnswers from '@/data/athro-history/model-answers';
import geographyPastPapers from '@/data/athro-geography/past-papers';
import geographyModelAnswers from '@/data/athro-geography/model-answers';
import rePastPapers from '@/data/athro-re/past-papers';
import reModelAnswers from '@/data/athro-re/model-answers';

// Science-specific imports
import biologyPastPapers from '@/data/athro-science/past-papers-biology';
import biologyModelAnswers from '@/data/athro-science/model-answers-biology';
import chemistryPastPapers from '@/data/athro-science/past-papers-chemistry';
import chemistryModelAnswers from '@/data/athro-science/model-answers-chemistry';
import physicsPastPapers from '@/data/athro-science/past-papers-physics';
import physicsModelAnswers from '@/data/athro-science/model-answers-physics';

export async function mockAthroResponse(
  message: string, 
  subject: string,
  examBoard: string = 'wjec',
  context: any = {}
): Promise<AthroMessage> {
  // Mock delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Get the relevant past papers and model answers based on subject
  const subjectPastPapers = getSubjectPastPapers(subject, context);
  const subjectModelAnswers = getSubjectModelAnswers(subject, context);
  
  // Check if the message matches any past paper questions
  const questionMatch = findMatchingQuestion(message, subjectPastPapers);
  
  let content = '';
  let referencedResources: string[] = [];
  let markScheme: string | undefined;
  
  if (questionMatch) {
    // If we have a matching question, use its model answer
    const answer = findModelAnswer(questionMatch.id, subjectModelAnswers);
    
    if (answer) {
      content = `I can help with this ${questionMatch.topic} question.\n\n${formatWorkingSteps(answer.workingSteps)}\n\nThe final answer is: ${answer.markScheme}`;
      referencedResources = [questionMatch.id];
      markScheme = answer.markScheme;
    } else {
      content = generateSubjectResponse(message, subject, context);
    }
  } else {
    content = generateSubjectResponse(message, subject, context);
  }
  
  return {
    id: Date.now().toString(),
    senderId: `athro-${subject.toLowerCase()}`,
    content,
    timestamp: new Date().toISOString(),
    referencedResources,
    markScheme
  };
}

function getSubjectPastPapers(subject: string, context: any = {}): PastPaper[] {
  switch (subject.toLowerCase()) {
    case 'mathematics':
      return pastPapers;
    case 'english':
      return englishPastPapers;
    case 'welsh':
      return welshPastPapers;
    case 'languages':
      // For Languages, we can filter based on the subjectSection (french, spanish, german)
      if (context.subjectSection) {
        return languagesPastPapers.filter(
          paper => paper.subject.toLowerCase() === context.subjectSection.toLowerCase()
        );
      }
      return languagesPastPapers;
    case 'history':
      return historyPastPapers;
    case 'geography':
      return geographyPastPapers;
    case 'religious education':
    case 're':
      return rePastPapers;
    case 'science':
      // For Science, we can filter based on the subjectSection (biology, chemistry, physics)
      if (context.subjectSection === 'biology') {
        return biologyPastPapers;
      } else if (context.subjectSection === 'chemistry') {
        return chemistryPastPapers;
      } else if (context.subjectSection === 'physics') {
        return physicsPastPapers;
      }
      // Default to biology if no specific section
      return biologyPastPapers;
    default:
      return [];
  }
}

function getSubjectModelAnswers(subject: string, context: any = {}): ModelAnswer[] {
  switch (subject.toLowerCase()) {
    case 'mathematics':
      return modelAnswers;
    case 'english':
      return englishModelAnswers;
    case 'welsh':
      return welshModelAnswers;
    case 'languages':
      // For Languages, we can filter based on the subjectSection (french, spanish, german)
      if (context.subjectSection) {
        return languagesModelAnswers.filter(
          answer => {
            const questionId = answer.questionId;
            // Extract subject from question ID (e.g., 's22-3800u10-1-q1' for French)
            const subjectCode = questionId.split('-')[1].substring(0, 4);
            if (context.subjectSection === 'french' && subjectCode === '3800') return true;
            if (context.subjectSection === 'spanish' && subjectCode === '3810') return true;
            if (context.subjectSection === 'german' && subjectCode === '3820') return true;
            return false;
          }
        );
      }
      return languagesModelAnswers;
    case 'history':
      return historyModelAnswers;
    case 'geography':
      return geographyModelAnswers;
    case 'religious education':
    case 're':
      return reModelAnswers;
    case 'science':
      // For Science, we can filter based on the subjectSection
      if (context.subjectSection === 'biology') {
        return biologyModelAnswers;
      } else if (context.subjectSection === 'chemistry') {
        return chemistryModelAnswers;
      } else if (context.subjectSection === 'physics') {
        return physicsModelAnswers;
      }
      // Default to biology if no specific section
      return biologyModelAnswers;
    default:
      return [];
  }
}

function findMatchingQuestion(message: string, subjectPastPapers: PastPaper[]): PastPaperQuestion | null {
  // Very basic matching logic - in a real implementation this would be much more sophisticated
  const lowerMessage = message.toLowerCase();
  
  for (const paper of subjectPastPapers) {
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

function findModelAnswer(questionId: string, modelAnswers: ModelAnswer[]): ModelAnswer | undefined {
  return modelAnswers.find(answer => answer.questionId === questionId);
}

function formatWorkingSteps(steps: string[]): string {
  return steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
}

function generateSubjectResponse(message: string, subject: string, context: any = {}): string {
  const lowerMessage = message.toLowerCase();
  
  switch (subject.toLowerCase()) {
    case 'mathematics':
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
      
    case 'science':
      const subSection = context.subjectSection || 'general';
      
      if (subSection === 'biology') {
        if (lowerMessage.includes('cell') || lowerMessage.includes('organism')) {
          return "In biology, cells are the basic units of life. Let's explore how they function and interact within organisms.";
        }
        
        if (lowerMessage.includes('evolution') || lowerMessage.includes('natural selection')) {
          return "Evolution through natural selection is a key principle in biology. It helps us understand how species change over time through adaptation to their environments.";
        }
        
        return "I'm your biology mentor. What specific biological concept would you like to explore today?";
      }
      
      if (subSection === 'chemistry') {
        if (lowerMessage.includes('element') || lowerMessage.includes('periodic table')) {
          return "The periodic table organizes elements based on their properties. Let's look at how elements interact and form compounds.";
        }
        
        if (lowerMessage.includes('reaction') || lowerMessage.includes('chemical')) {
          return "Chemical reactions involve the transformation of substances. To understand them, we need to look at the reactants, products, and energy changes.";
        }
        
        return "I'm your chemistry mentor. What chemical concept would you like to explore today?";
      }
      
      if (subSection === 'physics') {
        if (lowerMessage.includes('force') || lowerMessage.includes('motion') || lowerMessage.includes('newton')) {
          return "Newton's laws of motion help us understand how forces affect objects. Let's explore how these principles apply to your question.";
        }
        
        if (lowerMessage.includes('energy') || lowerMessage.includes('conservation')) {
          return "Energy cannot be created or destroyed, only transformed. This principle is key to understanding many physical phenomena.";
        }
        
        return "I'm your physics mentor. What specific physics concept would you like to explore today?";
      }
      
      return "I'm your science mentor covering biology, chemistry, and physics. Which specific area would you like to focus on?";
      
    case 'english':
      if (lowerMessage.includes('shakespeare') || lowerMessage.includes('macbeth') || lowerMessage.includes('romeo')) {
        return "Shakespeare's works are rich with themes and literary devices. Let's analyze the specific aspects you're interested in exploring.";
      }
      
      if (lowerMessage.includes('poetry') || lowerMessage.includes('poem')) {
        return "Poetry analysis involves looking at structure, language, and themes. Which specific poem or poet are you studying?";
      }
      
      if (lowerMessage.includes('essay') || lowerMessage.includes('writing')) {
        return "Effective essay writing requires clear structure and thoughtful analysis. Let's work on developing your ideas and expression.";
      }
      
      return "I'm your English mentor. Are you working on literature analysis, creative writing, or language techniques today?";
      
    case 'welsh':
      if (lowerMessage.includes('grammar') || lowerMessage.includes('mutation')) {
        return "Welsh grammar has unique features like mutations that change the first letter of words in certain contexts. Let's practice these rules together.";
      }
      
      if (lowerMessage.includes('vocabulary') || lowerMessage.includes('words')) {
        return "Building vocabulary is essential for Welsh fluency. Let's focus on the words and phrases you need for your topic.";
      }
      
      // Check if message contains Welsh words and respond in Welsh
      if (/[âêîôûŵŷ]|diolch|croeso|cymraeg/i.test(message)) {
        return "Dw i'n falch o'ch helpu gyda'ch Cymraeg. Beth hoffech chi ganolbwyntio arno heddiw?";
      }
      
      return "I'm your Welsh language mentor. Would you like to practice conversation, grammar, or reading comprehension today?";
      
    case 'languages':
      const languageSection = context.subjectSection || 'general';
      
      if (languageSection === 'french') {
        if (lowerMessage.includes('grammar') || lowerMessage.includes('verb') || lowerMessage.includes('tense')) {
          return "French verb tenses and grammar have specific patterns. Let's practice conjugations and sentence structures together.";
        }
        
        // Check if message contains French words and respond with some French
        if (/bonjour|merci|français/i.test(message)) {
          return "Bonjour! Je suis là pour vous aider avec le français. Que voulez-vous pratiquer aujourd'hui?";
        }
        
        return "I'm your French language mentor. Would you like to work on vocabulary, grammar, or conversation practice?";
      }
      
      if (languageSection === 'spanish') {
        if (lowerMessage.includes('grammar') || lowerMessage.includes('verb') || lowerMessage.includes('tense')) {
          return "Spanish verb conjugations follow specific patterns. Let's practice the tenses you're studying.";
        }
        
        // Check if message contains Spanish words and respond with some Spanish
        if (/hola|gracias|español/i.test(message)) {
          return "¡Hola! Estoy aquí para ayudarte con el español. ¿Qué te gustaría practicar hoy?";
        }
        
        return "I'm your Spanish language mentor. Would you like to focus on vocabulary, grammar, or conversational skills?";
      }
      
      if (languageSection === 'german') {
        if (lowerMessage.includes('grammar') || lowerMessage.includes('cases') || lowerMessage.includes('article')) {
          return "German grammar includes cases that change articles and noun endings. Let's practice these structures together.";
        }
        
        // Check if message contains German words and respond with some German
        if (/hallo|danke|deutsch/i.test(message)) {
          return "Hallo! Ich bin hier, um dir mit Deutsch zu helfen. Was möchtest du heute üben?";
        }
        
        return "I'm your German language mentor. Would you like to work on vocabulary, grammar cases, or conversation practice?";
      }
      
      return "I'm your languages mentor covering French, Spanish, and German. Which language would you like to focus on today?";
      
    case 'history':
      if (lowerMessage.includes('tudor') || lowerMessage.includes('elizabeth') || lowerMessage.includes('henry viii')) {
        return "The Tudor period was a fascinating time in British history. Let's explore the specific aspects of this era that you're studying.";
      }
      
      if (lowerMessage.includes('world war') || lowerMessage.includes('wwi') || lowerMessage.includes('wwii')) {
        return "The World Wars shaped modern history significantly. Let's examine the causes, events, or consequences you're focusing on.";
      }
      
      if (lowerMessage.includes('source') || lowerMessage.includes('evidence') || lowerMessage.includes('analyze')) {
        return "Historical source analysis requires examining origin, purpose, and context. Let's practice these skills with your source material.";
      }
      
      return "I'm your history mentor. Which historical period or skill would you like to focus on today?";
      
    case 'geography':
      if (lowerMessage.includes('river') || lowerMessage.includes('coast') || lowerMessage.includes('erosion')) {
        return "Physical geography processes like erosion shape our landscape. Let's examine how these processes work in rivers and coastal areas.";
      }
      
      if (lowerMessage.includes('population') || lowerMessage.includes('migration') || lowerMessage.includes('urban')) {
        return "Human geography explores population patterns and urban development. Let's look at the factors influencing these patterns.";
      }
      
      if (lowerMessage.includes('map') || lowerMessage.includes('grid reference') || lowerMessage.includes('scale')) {
        return "Map skills are essential in geography. Let's practice interpreting map features and grid references.";
      }
      
      return "I'm your geography mentor covering both physical and human geography. Which area would you like to explore today?";
      
    case 'religious education':
    case 're':
      if (lowerMessage.includes('christianity') || lowerMessage.includes('jesus') || lowerMessage.includes('bible')) {
        return "Christianity has diverse beliefs and practices across different denominations. Let's explore the specific aspects you're studying.";
      }
      
      if (lowerMessage.includes('islam') || lowerMessage.includes('muslim') || lowerMessage.includes('quran')) {
        return "Islam is centered around the Five Pillars of faith. Let's examine the beliefs and practices you're learning about.";
      }
      
      if (lowerMessage.includes('ethics') || lowerMessage.includes('moral') || lowerMessage.includes('right and wrong')) {
        return "Ethical questions involve examining different perspectives on moral issues. Let's explore various religious and philosophical viewpoints.";
      }
      
      return "I'm your Religious Education mentor. Would you like to explore specific religious beliefs, practices, or ethical questions?";
      
    default:
      return `I'm your ${subject} mentor. How can I help you today?`;
  }
}

export async function getPastPapers(subject: string, examBoard?: string): Promise<PastPaper[]> {
  // Mock delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Get the appropriate past papers based on subject
  const subjectPastPapers = getSubjectPastPapers(subject);
  
  // Filter by exam board if specified
  if (examBoard) {
    return subjectPastPapers.filter(paper => paper.examBoard === examBoard.toLowerCase());
  }
  
  return subjectPastPapers;
}

export async function getModelAnswer(questionId: string, subject: string): Promise<ModelAnswer | null> {
  // Mock delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Get the appropriate model answers based on subject
  const subjectModelAnswers = getSubjectModelAnswers(subject);
  
  const answer = subjectModelAnswers.find(a => a.questionId === questionId);
  return answer || null;
}
