import { AthroMessage, ExamBoard, FeedbackSummary } from '@/types/athro';
import { frenchPastPapers } from '@/data/athro-languages/past-papers/french';
import { germanPastPapers } from '@/data/athro-languages/past-papers/german';
import { spanishPastPapers } from '@/data/athro-languages/past-papers/spanish';
import { getAthroBySubject } from '@/config/athrosConfig';
import { enhanceResponseWithKnowledge, shouldEnhanceWithKnowledge } from './athroServiceExtension';

class AthroService {
  async generateResponse(
    message: string,
    subject: string,
    examBoard: ExamBoard,
    context?: any
  ): Promise<AthroMessage> {
    // Simulate a delay to mimic an API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use the provided promptPersona if available
    const promptPersona = context?.promptPersona || `I am an Athro AI mentoring in ${subject}.`;
    
    console.log(`[AthroService] Using prompt persona: ${promptPersona.substring(0, 50)}...`);

    // Check if the question is out of scope for this character
    const isOutOfScope = this.isOutOfSubjectScope(message, subject);
    
    if (isOutOfScope.outOfScope) {
      return this.generateOutOfScopeResponse(subject, isOutOfScope.detectedSubject);
    }

    // Check if the query would benefit from knowledge base enhancement
    let enhancedContent = '';
    let hasKnowledgeResults = false;
    
    if (shouldEnhanceWithKnowledge(message)) {
      // Convert subject to lowercase to match knowledge base subject format
      const knowledgeSubject = subject.toLowerCase();
      
      // Enhance with knowledge
      const { enhancedContext, hasKnowledgeResults: hasResults } = 
        await enhanceResponseWithKnowledge(message, knowledgeSubject);
      
      enhancedContent = enhancedContext;
      hasKnowledgeResults = hasResults;
    }

    // Basic subject-specific responses, now informed by promptPersona
    let content = '';
    
    // A simplified version of what would be an actual AI system prompt
    const systemPrompt = `${promptPersona}
    
The student has asked: "${message}"

${enhancedContent ? `\n\n${enhancedContent}\n\n` : ''}

Please provide a helpful response that stays in character, addresses the student's question, and provides subject-specific assistance.
`;

    console.log(`[AthroService] Generated system prompt basis for ${subject}`);

    // For mock purposes, we'll simulate responses based on the subject and prompt persona
    if (subject === 'Mathematics') {
      content = this.generateMathematicsResponse(message, promptPersona);
    } 
    else if (subject === 'Science') {
      content = this.generateScienceResponse(message, context?.subjectSection, promptPersona);
    }
    else if (subject === 'English') {
      content = this.generateEnglishResponse(message, promptPersona);
    }
    else if (subject === 'Languages') {
      content = this.generateLanguagesResponse(message, context?.subjectSection, promptPersona);
    }
    else if (subject === 'Welsh') {
      content = this.generateWelshResponse(message, promptPersona);
    }
    else if (subject === 'History') {
      content = this.generateHistoryResponse(message, promptPersona);
    }
    else if (subject === 'Geography') {
      content = this.generateGeographyResponse(message, promptPersona);
    }
    else if (subject === 'Religious Education') {
      content = this.generateREResponse(message, promptPersona);
    }
    else {
      content = `I'm here to help with your ${subject} studies. Let me guide you through this question step by step.`;
    }

    // Add knowledge base attribution if results were found
    if (hasKnowledgeResults) {
      content += '\n\nMy answer includes information from our trusted knowledge base.';
    }

    // Exam board specific help
    if (examBoard === 'wjec') {
      content += ' For WJEC exams, remember to structure your answer according to their mark scheme requirements.';
    } else if (examBoard === 'aqa') {
      content += ' When preparing for AQA exams, focus on applying your knowledge to specific contexts as they often ask.';
    } else if (examBoard === 'ocr') {
      content += ' OCR questions typically require detailed explanations with clear examples.';
    }

    // Add context-aware responses
    if (context?.topic) {
      content += ` I see you're working on ${context.topic} - this is particularly relevant because it connects to core concepts in the curriculum.`;
    }

    const aiMessage: AthroMessage = {
      id: Date.now().toString(),
      senderId: 'ai',
      content: content,
      timestamp: new Date().toISOString(),
    };

    return aiMessage;
  }

  // New method to check if a question is outside a character's subject scope
  isOutOfSubjectScope(message: string, currentSubject: string): { outOfScope: boolean, detectedSubject?: string } {
    const lowerMessage = message.toLowerCase();
    
    // Keywords that strongly indicate subject areas
    const subjectKeywords: Record<string, string[]> = {
      'Mathematics': ['algebra', 'equation', 'geometry', 'calculus', 'trigonometry', 'statistics', 'probability', 'quadratic'],
      'Science': ['biology', 'chemistry', 'physics', 'atom', 'cell', 'molecule', 'element', 'reaction', 'force', 'energy'],
      'English': ['shakespeare', 'novel', 'poem', 'poetry', 'literature', 'essay', 'grammar', 'creative writing', 'character analysis'],
      'Languages': ['french', 'german', 'spanish', 'vocabulary', 'conjugation', 'translate', 'verbs'],
      'Welsh': ['cymraeg', 'welsh language', 'welsh culture'],
      'History': ['world war', 'middle ages', 'tudor', 'medieval', 'revolution', 'historic', 'empire', 'monarchy', 'timeline'],
      'Geography': ['climate', 'map', 'countries', 'continent', 'river', 'mountain', 'population', 'erosion', 'tectonic'],
      'Religious Education': ['religion', 'christianity', 'islam', 'judaism', 'buddhism', 'ethics', 'philosophy', 'moral', 'belief']
    };
    
    // Don't detect out of scope for very short messages or greetings
    if (message.length < 15 || 
        lowerMessage.includes('hello') || 
        lowerMessage.includes('hi') || 
        lowerMessage.includes('hey')) {
      return { outOfScope: false };
    }
    
    // Check for strong indicators of other subjects
    for (const [subject, keywords] of Object.entries(subjectKeywords)) {
      if (subject !== currentSubject) {
        // Check if any keywords from another subject appear in the message
        const matchCount = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
        
        // If multiple keywords from another subject are found, suggest it's out of scope
        if (matchCount >= 2) {
          return { outOfScope: true, detectedSubject: subject };
        }
      }
    }
    
    return { outOfScope: false };
  }

  // New method to generate responses when a question is out of scope
  generateOutOfScopeResponse(currentSubject: string, detectedSubject?: string): AthroMessage {
    let content = '';
    const redirectAthro = detectedSubject ? `Athro${detectedSubject}` : "another Athro";
    
    // Create a friendly, in-character redirection
    if (currentSubject === 'Mathematics') {
      content = `I think this question might be outside my mathematical expertise. ${detectedSubject ? `It looks like a ${detectedSubject} question that ${redirectAthro} could help with better.` : "Perhaps another Athro could help you with this?"} Would you like to try asking a maths question instead? I'm here to help you solve equations, work with geometry, analyze data, and much more.`;
    } 
    else if (currentSubject === 'Science') {
      content = `That's an interesting question, but it seems to be outside the realm of scientific inquiry that I specialize in. ${detectedSubject ? `It appears to be more related to ${detectedSubject}, which ${redirectAthro} would be better equipped to address.` : "Another Athro might be better suited to help with this topic."} Is there anything about biology, chemistry, or physics that I can help you explore instead?`;
    }
    else if (currentSubject === 'English') {
      content = `I notice that question isn't quite in the world of literature or language that I focus on. ${detectedSubject ? `It seems more like a ${detectedSubject} question that ${redirectAthro} would be delighted to explore with you.` : "Another Athro might be more helpful with this particular topic."} If you'd like to discuss poetry, prose, creative writing, or language techniques, I'm here to guide you through that!`;
    }
    else if (currentSubject === 'Languages') {
      content = `Pardon, but that question doesn't seem to relate to language learning that I specialize in. ${detectedSubject ? `It appears to be more about ${detectedSubject}, which ${redirectAthro} could help you with.` : "Another Athro might be better positioned to answer your question."} If you'd like help with French, German, or Spanish vocabulary, grammar, or conversation practice, I'm here for you!`;
    }
    else if (currentSubject === 'Welsh') {
      content = `Diolch for your question, but I think it may be outside my area of Welsh language expertise. ${detectedSubject ? `It seems more related to ${detectedSubject}, which ${redirectAthro} could help with.` : "Another Athro might be better suited to help you with this topic."} Would you like to practice Welsh language skills instead?`;
    }
    else if (currentSubject === 'History') {
      content = `That's an interesting question, but it doesn't seem to relate to historical events or analysis that I specialize in. ${detectedSubject ? `It looks more like a ${detectedSubject} question that ${redirectAthro} would be better equipped to explore with you.` : "Another Athro might offer more insight on this topic."} Would you like to discuss a historical period or event instead?`;
    }
    else if (currentSubject === 'Geography') {
      content = `I notice your question might be outside the realm of geographical studies that I focus on. ${detectedSubject ? `It seems more related to ${detectedSubject}, which ${redirectAthro} could help you understand better.` : "Another Athro might be better positioned to address this topic."} If you'd like to explore physical geography, human geography, or environmental systems, I'm here to guide you!`;
    }
    else if (currentSubject === 'Religious Education') {
      content = `Thank you for your question, but I believe it may fall outside the scope of religious studies and ethics that I specialize in. ${detectedSubject ? `It appears to be more related to ${detectedSubject}, which ${redirectAthro} would be better suited to address.` : "Another Athro might offer more valuable insight on this topic."} Would you like to explore religious perspectives, ethical frameworks, or philosophical questions instead?`;
    }
    else {
      content = `I think this question might be outside my area of expertise. ${detectedSubject ? `It seems like ${redirectAthro} might be able to help you better with this ${detectedSubject} question.` : "Perhaps another Athro could help you with this topic."} What would you like to know about ${currentSubject} instead?`;
    }

    return {
      id: Date.now().toString(),
      senderId: 'ai',
      content: content,
      timestamp: new Date().toISOString(),
    };
  }

  // Subject-specific response generators
  generateMathematicsResponse(message: string, promptPersona: string): string {
    let content = 'Looking at your mathematics question, I can help break this down step-by-step. ';
    
    if (message.toLowerCase().includes('algebra')) {
      content += 'For algebraic problems, we need to identify the variables and operations. Let me show you how to approach this...';
      content += '\n\nLet\'s square this away by following a logical sequence:';
    } else if (message.toLowerCase().includes('geometry')) {
      content += 'This geometry question involves spatial reasoning. Let\'s analyze the shapes and measurements provided...';
      content += '\n\nI\'ll solve this angle by angle, so you can see each step clearly.';
    } else {
      content += 'Let\'s work through this systematically, making sure we understand what\'s being asked before applying the relevant formulas.';
      content += '\n\nThe key to mathematical success is breaking complex problems into manageable steps.';
    }
    
    return content;
  }
  
  generateScienceResponse(message: string, subjectSection?: string, promptPersona?: string): string {
    let content = 'That\'s an interesting science question. ';
    
    if (subjectSection === 'biology') {
      content += 'From a biological perspective, I can explain how this process works in living organisms...';
      content += '\n\nLet\'s break it down atom by atom and explore how these biological systems interact.';
    } else if (subjectSection === 'chemistry') {
      content += 'Looking at the chemical properties involved, we can analyze this reaction...';
      content += '\n\nChemistry is all about transformations - let\'s examine what happens at the molecular level.';
    } else if (subjectSection === 'physics') {
      content += 'Applying physics principles, we can calculate the forces and energy involved...';
      content += '\n\nPhysics helps us understand the fundamental rules of our universe. Let\'s investigate this phenomenon.';
    } else {
      content += 'Let\'s examine the scientific principles at work and how they apply to your question.';
      content += '\n\nScientific inquiry starts with careful observation and analysis. Let\'s approach this methodically.';
    }
    
    return content;
  }
  
  generateEnglishResponse(message: string, promptPersona: string): string {
    let content = 'Let\'s analyze this text thoughtfully. ';
    
    if (message.toLowerCase().includes('shakespeare') || message.toLowerCase().includes('macbeth') || message.toLowerCase().includes('romeo')) {
      content += 'When interpreting Shakespeare, we need to consider both the language of the time and the dramatic context...';
      content += '\n\nShakespeare\'s works are layered with meaning. Let\'s explore the themes and character motivations together.';
    } else if (message.toLowerCase().includes('poetry') || message.toLowerCase().includes('poem')) {
      content += 'Poetry analysis requires us to look at structure, form, and language. Let\'s break down the key techniques...';
      content += '\n\nThe poet\'s choice of words creates a tapestry of meaning. Let\'s unravel it line by line.';
    } else {
      content += 'I\'ll guide you through analyzing the author\'s craft and the effect on the reader.';
      content += '\n\nLiterature gives us windows into human experience. Let\'s explore what this text reveals.';
    }
    
    return content;
  }
  
  generateLanguagesResponse(message: string, subjectSection?: string, promptPersona?: string): string {
    let content = '';
    
    if (subjectSection === 'french') {
      content = 'Pour pratiquer le français, examinons cette question ensemble. ';
      content += 'En français, nous devons faire attention à la grammaire et au vocabulaire approprié...';
      content += '\n\nCultural note: In France, language precision is highly valued, which is why verb conjugation is so important.';
      content += '\n\nGrammar tip: Remember that French adjectives typically come after the noun they modify, unlike in English.';
    } else if (subjectSection === 'german') {
      content = 'Lassen Sie uns gemeinsam Deutsch üben. ';
      content += 'In der deutschen Sprache müssen wir auf die Grammatik und den richtigen Wortschatz achten...';
      content += '\n\nCultural note: German places great emphasis on precision and structure, which is reflected in both the language and culture.';
      content += '\n\nGrammar tip: In German sentences, the verb always takes the second position in the main clause.';
    } else if (subjectSection === 'spanish') {
      content = 'Practiquemos español juntos. ';
      content += 'En español, debemos prestar atención a la gramática y el vocabulario adecuado...';
      content += '\n\nCultural note: Spanish-speaking countries often use different terms for the same objects, reflecting their rich cultural diversity.';
      content += '\n\nGrammar tip: Unlike English, Spanish uses inverted question marks (¿) at the beginning of questions.';
    } else {
      content = 'Let\'s work on your language skills together. It\'s important to practice regularly and immerse yourself in the language.';
      content += '\n\nLanguage learning is like building a bridge to another culture. Let\'s construct it word by word.';
    }
    
    return content;
  }
  
  generateWelshResponse(message: string, promptPersona: string): string {
    let content = 'Gadewch i ni edrych ar hyn yn Gymraeg. ';
    content += 'When working with Welsh language questions, I can help you with vocabulary, grammar, and proper expressions.';
    content += '\n\nTidy! Welsh is a beautiful language with a rich cultural heritage. Let\'s explore it together.';
    return content;
  }
  
  generateHistoryResponse(message: string, promptPersona: string): string {
    let content = 'To understand this historical question, we need to examine the context, causes, and consequences. ';
    
    if (message.toLowerCase().includes('world war')) {
      content += 'World War events require us to consider international relations, military strategy, and social impacts...';
      content += '\n\nLet\'s create a timeline to see how these events unfolded and influenced each other.';
    } else if (message.toLowerCase().includes('medieval') || message.toLowerCase().includes('tudor')) {
      content += 'Medieval and Tudor history involves understanding power structures, religious influences, and everyday life...';
      content += '\n\nThe past is like a tapestry of interconnected events. Let\'s trace the threads of cause and effect.';
    } else {
      content += 'Let\'s create a timeline of key events and analyze their significance.';
      content += '\n\nHistory helps us understand both where we came from and where we might be heading.';
    }
    
    return content;
  }
  
  generateGeographyResponse(message: string, promptPersona: string): string {
    let content = 'This geography question touches on important processes and systems. ';
    
    if (message.toLowerCase().includes('climate') || message.toLowerCase().includes('weather')) {
      content += 'Climate systems are complex interactions between the atmosphere, oceans, and land. Let\'s analyze the patterns...';
      content += '\n\nLet\'s map out these geographical processes to see how they interact with human and natural systems.';
    } else if (message.toLowerCase().includes('population') || message.toLowerCase().includes('urban')) {
      content += 'Human geography looks at population patterns, urban development, and cultural regions...';
      content += '\n\nGeographical patterns help us understand how people interact with their environment.';
    } else {
      content += 'Let\'s examine the geographical factors and their relationships to understand this topic fully.';
      content += '\n\nGeography connects physical systems with human activities. Let\'s explore these connections.';
    }
    
    return content;
  }
  
  generateREResponse(message: string, promptPersona: string): string {
    let content = 'When examining religious and ethical questions, it\'s important to consider multiple perspectives. ';
    
    if (message.toLowerCase().includes('christianity') || message.toLowerCase().includes('jesus')) {
      content += 'In Christianity, this concept relates to core teachings about faith, love, and community...';
      content += '\n\nReligious texts often contain layers of meaning that have been interpreted differently throughout history.';
    } else if (message.toLowerCase().includes('islam') || message.toLowerCase().includes('muslim')) {
      content += 'Islamic teachings on this subject emphasize the importance of submission to Allah and the five pillars...';
      content += '\n\nEthical questions invite us to consider different viewpoints and understand why people hold their beliefs.';
    } else {
      content += 'Let\'s explore different religious and non-religious viewpoints to develop a balanced understanding.';
      content += '\n\nPhilosophical inquiry helps us examine the foundations of belief systems and ethical frameworks.';
    }
    
    return content;
  }

  // Method to fetch past papers based on subject and keywords
  async getPastPapers(subject: string, keywords: string[]): Promise<any[]> {
    // Simulate fetching past papers from a database or external source
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter past papers based on subject and keywords
    let filteredPapers = [];

    if (subject === 'French') {
      filteredPapers = frenchPastPapers.filter((paper) =>
        keywords.every((keyword) =>
          paper.question.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    } else if (subject === 'German') {
      filteredPapers = germanPastPapers.filter((paper) =>
        keywords.every((keyword) =>
          paper.question.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    } else if (subject === 'Spanish') {
      filteredPapers = spanishPastPapers.filter((paper) =>
        keywords.every((keyword) =>
          paper.question.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    } else {
      // Return an empty array if the subject is not supported
      return [];
    }

    return filteredPapers;
  }

  // Method to generate language-specific responses
  generateLanguageResponse(message: string, language: string): string {
    const languageGreetings: Record<string, string> = {
      french: "Bonjour! Comment puis-je vous aider aujourd'hui?",
      german: "Guten Tag! Wie kann ich Ihnen heute helfen?",
      spanish: "¡Hola! ¿Cómo puedo ayudarte hoy?"
    };

    // Add some basic language-specific responses
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      return languageGreetings[language] || "Hello! How can I help you today?";
    }

    // For more complex interactions, we'll need to implement proper language-specific logic
    return `I'm processing your query in ${language}. This feature is still being developed.`;
  }

  // New method to get feedback summary for completed activities
  getFeedbackSummary(submission: any): FeedbackSummary {
    // In a real implementation, this would analyze the submission and generate appropriate feedback
    // For now, we'll return mock feedback based on the submission type and score
    
    const activityType = submission.activityType || 'assignment';
    const score = submission.score || Math.floor(Math.random() * 30) + 70; // Random score between 70-100 if not provided
    const subject = submission.subject || 'Mathematics';
    
    let feedback = '';
    let encouragement = '';
    
    // Generate different feedback based on the score
    if (score >= 90) {
      feedback = "Excellent work! Your understanding of the concepts is very strong. You've demonstrated mastery in most areas.";
      encouragement = "Outstanding effort! Keep up this excellent standard of work!";
    } else if (score >= 80) {
      feedback = "Very good work! You've shown a solid understanding of the material, with just a few areas to review.";
      encouragement = "Great job! You're making excellent progress in your studies!";
    } else if (score >= 70) {
      feedback = "Good effort! You've grasped many of the key concepts, but there are some areas where you could improve.";
      encouragement = "You're doing well! With a bit more practice, you'll master these concepts.";
    } else if (score >= 60) {
      feedback = "Satisfactory work. You've shown understanding of some key concepts, but there are important areas that need more attention.";
      encouragement = "Keep going! With focused practice on the challenging areas, you'll see improvement.";
    } else {
      feedback = "You've made a start, but there are several concepts that need further study and practice.";
      encouragement = "Don't be discouraged! Every attempt is a step toward mastery. Let's identify the areas to focus on.";
    }
    
    // Add subject-specific feedback
    if (subject === 'Mathematics') {
      feedback += " In mathematics, remember to show all your working clearly and check your calculations.";
    } else if (subject === 'Science') {
      feedback += " When answering science questions, ensure you're using precise terminology and supporting claims with evidence.";
    } else if (subject === 'English') {
      feedback += " In your writing, focus on developing your arguments with clear evidence and maintaining a consistent analytical approach.";
    }
    
    return {
      score,
      feedback,
      encouragement,
      activityType: activityType as 'goal' | 'assignment' | 'quiz' | 'exam',
      activityId: submission.id || 'unknown',
      activityName: submission.title || `${subject} Activity`,
      subject,
      submittedAt: submission.submittedAt || new Date().toISOString(),
      teacherComments: submission.teacherComments || undefined,
      strengths: [
        "Good understanding of key concepts",
        "Clear explanation of ideas",
        "Effective use of terminology"
      ],
      improvements: [
        "Could provide more detailed examples",
        "Need to work on time management",
        "Consider alternative approaches to problems"
      ],
      nextSteps: [
        "Review chapter materials",
        "Practice similar questions",
        "Schedule a follow-up session"
      ],
      confidence: Math.min(Math.floor(score / 10), 10) // Scale score to confidence level 1-10
    };
  }
}

const athroService = new AthroService();
export default athroService;
