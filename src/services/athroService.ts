import { AthroMessage, ExamBoard } from '@/types/athro';
import { frenchPastPapers } from '@/data/athro-languages/past-papers/french';
import { germanPastPapers } from '@/data/athro-languages/past-papers/german';
import { spanishPastPapers } from '@/data/athro-languages/past-papers/spanish';

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

    // Basic subject-specific responses, now informed by promptPersona
    let content = '';
    
    // A simplified version of what would be an actual AI system prompt
    const systemPrompt = `${promptPersona}
    
The student has asked: "${message}"

Please provide a helpful response that stays in character, addresses the student's question, and provides subject-specific assistance.
`;

    console.log(`[AthroService] Generated system prompt basis for ${subject}`);

    // For mock purposes, we'll simulate responses based on the subject and prompt persona
    if (subject === 'Mathematics') {
      content = 'Looking at your mathematics question, I can help break this down step-by-step. ';
      
      if (message.toLowerCase().includes('algebra')) {
        content += 'For algebraic problems, we need to identify the variables and operations. Let me show you how to approach this...';
      } else if (message.toLowerCase().includes('geometry')) {
        content += 'This geometry question involves spatial reasoning. Let\'s analyze the shapes and measurements provided...';
      } else {
        content += 'Let\'s work through this systematically, making sure we understand what\'s being asked before applying the relevant formulas.';
      }
    } 
    else if (subject === 'Science') {
      content = 'That\'s an interesting science question. ';
      
      if (context?.subjectSection === 'biology') {
        content += 'From a biological perspective, I can explain how this process works in living organisms...';
      } else if (context?.subjectSection === 'chemistry') {
        content += 'Looking at the chemical properties involved, we can analyze this reaction...';
      } else if (context?.subjectSection === 'physics') {
        content += 'Applying physics principles, we can calculate the forces and energy involved...';
      } else {
        content += 'Let\'s examine the scientific principles at work and how they apply to your question.';
      }
    }
    else if (subject === 'English') {
      content = 'Let\'s analyze this text thoughtfully. ';
      
      if (message.toLowerCase().includes('shakespeare') || message.toLowerCase().includes('macbeth') || message.toLowerCase().includes('romeo')) {
        content += 'When interpreting Shakespeare, we need to consider both the language of the time and the dramatic context...';
      } else if (message.toLowerCase().includes('poetry') || message.toLowerCase().includes('poem')) {
        content += 'Poetry analysis requires us to look at structure, form, and language. Let\'s break down the key techniques...';
      } else {
        content += 'I\'ll guide you through analyzing the author\'s craft and the effect on the reader.';
      }
    }
    else if (subject === 'Languages') {
      if (context?.subjectSection === 'french') {
        content = 'Pour pratiquer le français, examinons cette question ensemble. ';
        content += 'En français, nous devons faire attention à la grammaire et au vocabulaire approprié...';
      } else if (context?.subjectSection === 'german') {
        content = 'Lassen Sie uns gemeinsam Deutsch üben. ';
        content += 'In der deutschen Sprache müssen wir auf die Grammatik und den richtigen Wortschatz achten...';
      } else if (context?.subjectSection === 'spanish') {
        content = 'Practiquemos español juntos. ';
        content += 'En español, debemos prestar atención a la gramática y el vocabulario adecuado...';
      } else {
        content = 'Let\'s work on your language skills together. It\'s important to practice regularly and immerse yourself in the language.';
      }
    }
    else if (subject === 'Welsh') {
      content = 'Gadewch i ni edrych ar hyn yn Gymraeg. ';
      content += 'When working with Welsh language questions, I can help you with vocabulary, grammar, and proper expressions.';
    }
    else if (subject === 'History') {
      content = 'To understand this historical question, we need to examine the context, causes, and consequences. ';
      
      if (message.toLowerCase().includes('world war')) {
        content += 'World War events require us to consider international relations, military strategy, and social impacts...';
      } else if (message.toLowerCase().includes('medieval') || message.toLowerCase().includes('tudor')) {
        content += 'Medieval and Tudor history involves understanding power structures, religious influences, and everyday life...';
      } else {
        content += 'Let\'s create a timeline of key events and analyze their significance.';
      }
    }
    else if (subject === 'Geography') {
      content = 'This geography question touches on important processes and systems. ';
      
      if (message.toLowerCase().includes('climate') || message.toLowerCase().includes('weather')) {
        content += 'Climate systems are complex interactions between the atmosphere, oceans, and land. Let\'s analyze the patterns...';
      } else if (message.toLowerCase().includes('population') || message.toLowerCase().includes('urban')) {
        content += 'Human geography looks at population patterns, urban development, and cultural regions...';
      } else {
        content += 'Let\'s examine the geographical factors and their relationships to understand this topic fully.';
      }
    }
    else if (subject === 'Religious Education') {
      content = 'When examining religious and ethical questions, it\'s important to consider multiple perspectives. ';
      
      if (message.toLowerCase().includes('christianity') || message.toLowerCase().includes('jesus')) {
        content += 'In Christianity, this concept relates to core teachings about faith, love, and community...';
      } else if (message.toLowerCase().includes('islam') || message.toLowerCase().includes('muslim')) {
        content += 'Islamic teachings on this subject emphasize the importance of submission to Allah and the five pillars...';
      } else {
        content += 'Let\'s explore different religious and non-religious viewpoints to develop a balanced understanding.';
      }
    }
    else {
      content = `I'm here to help with your ${subject} studies. Let me guide you through this question step by step.`;
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

  // Method to fetch past papers based on subject and keywords
  async getPastPapers(subject: string, keywords: string[]): Promise<any[]> {
    // Simulate fetching past papers from a database or external source
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter past papers based on subject and keywords
    let filteredPapers = [];

    if (subject === 'French') {
      filteredPapers = frenchPastPapers.filter((paper) =>
        keywords.every((keyword) =>
          paper.title.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    } else if (subject === 'German') {
      filteredPapers = germanPastPapers.filter((paper) =>
        keywords.every((keyword) =>
          paper.title.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    } else if (subject === 'Spanish') {
      filteredPapers = spanishPastPapers.filter((paper) =>
        keywords.every((keyword) =>
          paper.title.toLowerCase().includes(keyword.toLowerCase())
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
}

const athroService = new AthroService();
export default athroService;
